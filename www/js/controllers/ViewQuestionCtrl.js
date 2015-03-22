angular.module('afterclass.controllers').controller('ViewQuestionCtrl', function ($rootScope, $scope, $ionicScrollDelegate, $state, $stateParams, $cordovaDialogs, $firebaseObject,
                                                                                  $firebaseArray, $ionicLoading, $ionicActionSheet, $timeout, MyCamera, CloudinaryUpload) {
    'use strict';
    var ref = new Firebase('https://dazzling-heat-8303.firebaseio.com/posts/' + $stateParams.firebase_id),
        post = ref,
        replies = $firebaseArray(ref.child('replies')),
        add_img_url = null;
    $scope.post = $firebaseObject(post);
    $scope.replyBody = '';
    $scope.add_img_preview = false;
    $scope.backToHome = function () {
        $state.go('home');
    };
    $scope.addImage = function () {
        $ionicActionSheet.show({
            buttons: [{text: 'Camera'}, {text: 'Documents'}],
            destructiveText: $scope.add_img_preview ? 'Remove' : '',
            titleText: 'Select Source',
            cancelText: 'Cancel',
            destructiveButtonClicked: function () {
                $scope.add_img_preview = false;
                add_img_url = null;
                return true;
            },
            buttonClicked: function (index) {
                if (index === 0) {
                    // Camera
                    MyCamera.getPicture({sourceType: Camera.PictureSourceType.CAMERA}).then(function (result) {
                        add_img_url = result.imageURI;
                        angular.element('.img-preview').attr('src', result.imageURI);
                        $scope.add_img_preview = true;
                    }, function () {
                        $scope.add_img_preview = false;
                    });
                } else {
                    // Gallery
                    MyCamera.getPicture({sourceType: Camera.PictureSourceType.PHOTOLIBRARY}).then(function (result) {
                        if (!result.is_image) {
                            return $cordovaDialogs.alert('Only images allowed', 'Error', 'OK');
                        }
                        add_img_url = result.imageURI;
                        angular.element('.img-preview').attr('src', result.imageURI);
                        $scope.add_img_preview = true;
                    }, function () {
                        $scope.add_img_preview = false;
                    });
                }
                return true;
            }
        });
    };
    $scope.addReply = function () {
        if (!$scope.replyBody) {
            $cordovaDialogs.alert('Please type something in!', 'Error', 'OK');
            return false;
        }
        var persist_reply = function (img_id) {
            $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
            replies.$add({
                user: $rootScope.user.id,
                body: $scope.replyBody,
                img_id: img_id || '',
                reply_date: moment().format("MMM Do YY"),
                timestamp: moment().unix()
            }).then(function () {
                $ionicLoading.hide();
                $scope.add_img_preview = false;
                $scope.replyBody = '';
                add_img_url = null;
                $ionicScrollDelegate.scrollBottom(true);
                // Change question's status according to last comment's user type
                // + update timestamp so it would go up in feed
                // + update last_tutor_id (if reply author is tutor), otherwise blank it so it's available to all
                $scope.post.$loaded().then(function (post) {
                    post.status = $rootScope.user.is_teacher ? 'answered' : 'unanswered';
                    post.timestamp = moment().unix();
                    post.last_tutor_id = $rootScope.user.is_teacher ? $rootScope.user.id : '';
                    post.$save();
                });
            }, function (error) {
                $ionicLoading.hide();
                console.log("Error:", error);
            });
        };
        if (add_img_url) {
            CloudinaryUpload.uploadImage(add_img_url).then(
                function (result) {
                    persist_reply(result.public_id);
                },
                function (err) {

                }
            );
        } else {
            persist_reply();
        }
    };
    $scope.viewFullImage = function (img_id) {
        $state.go('fullImage', {img_id: img_id});
    };
});