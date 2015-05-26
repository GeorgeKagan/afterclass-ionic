angular.module('afterclass.controllers').controller('ViewQuestionCtrl', function ($rootScope, $scope, $ionicScrollDelegate, $state, $stateParams, $cordovaDialogs, $firebaseObject,
                                                                                  $firebaseArray, $ionicLoading, $ionicActionSheet, $timeout, $translate,
                                                                                  MyCamera, CloudinaryUpload, AmazonSNS) {
    'use strict';
    var ref = new Firebase('https://dazzling-heat-8303.firebaseio.com/posts/' + $stateParams.firebase_id),
        post = ref,
        replies = $firebaseArray(ref.child('replies')),
        add_img_url = null;
    $scope.post = $firebaseObject(post);
    $scope.replyBody = '';
    $scope.add_img_preview = false;

    $scope.post.$loaded().then(function(post){

        //Block replies after a certain amount of time
        if(post.status === "answered") {
            var lastActivity = post.timestamp;
            if(Array.isArray(post.replies)) {
                lastActivity = Math.max(post.replies[post.replies-1].timestamp, lastActivity)
            }

            if(lastActivity < moment().subtract(32, 'hours').unix()) { //Allow replies within 32 hours from last activity
                $scope.allowReply = false;
            }
        }
    });


    $scope.backToHome = function () {
        $state.go('home');
    };
    $scope.addImage = function () {
        $ionicActionSheet.show({
            buttons: [{text: $translate.instant('CAMERA')}, {text: $translate.instant('DOCUMENTS')}],
            destructiveText: $scope.add_img_preview ? $translate.instant('REMOVE') : '',
            titleText: $translate.instant('SEL_SOURCE'),
            cancelText: $translate.instant('CANCEL'),
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
                            return $cordovaDialogs.alert($translate.instant('FORM.ONLY_IMG'), $translate.instant('ERROR'), $translate.instant('OK'));
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
            $cordovaDialogs.alert($translate.instant('PLS_TYPE'), $translate.instant('ERROR'), $translate.instant('OK'));
            return false;
        }
        var persist_reply = function (img_id) {
            $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
            replies.$add({
                user: $rootScope.user.id,
                name: $rootScope.user.name,
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
                    post.timestamp = moment().unix();
                    post.last_tutor_id = $rootScope.user.is_teacher ? $rootScope.user.id : '';
                    // If teacher replied, mark q as answered
                    if ($rootScope.user.is_teacher) {
                        post.status = 'answered';
                    }
                    // If student replied and status is answered, mark qa as unanswered
                    else if (post.status === 'answered') {
                        post.status = 'unanswered';
                    }
                    // If last reply was by tutor, reset potential tutors
                    if (post.last_tutor_id) {
                        post.potential_tutors = null;
                    }
                    if ($rootScope.user.is_teacher) {
                        AmazonSNS.publish(post.amazon_endpoint_arn, $translate.instant('NOTIFICATIONS.TUTOR_REPLIED'));
                    }
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