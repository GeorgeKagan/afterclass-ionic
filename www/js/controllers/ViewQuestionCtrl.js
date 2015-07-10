angular.module('afterclass.controllers').controller('ViewQuestionCtrl', function ($rootScope, $scope, $ionicScrollDelegate, $state, $stateParams, $firebaseObject,
                                                                                  $firebaseArray, $ionicLoading, $ionicActionSheet, $timeout, $translate, $ionicPopup,
                                                                                  MyCamera, CloudinaryUpload, AmazonSNS, Post) {
    'use strict';
    var ref = new Firebase('https://dazzling-heat-8303.firebaseio.com/posts/' + $stateParams.firebase_id),
        post = ref,
        replies = $firebaseArray(ref.child('replies')),
        add_img_url = null;

    function imageUpload() {
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
                            return $ionicPopup.alert({
                                title: $translate.instant('ERROR'),
                                template: $translate.instant('FORM.ONLY_IMG'),
                                okText: $translate.instant('OK')
                            });
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
    }

    function showAgreement(callback) {
        var replyingTutors = _.pluck(_.filter(replies, { 'is_teacher': true }), 'name');
        if(replyingTutors.length > 0 && $scope.shouldShowAgreement && !$rootScope.user.is_teacher) { //Alert the uses regarding the rules
            $ionicPopup.show({
                template: $translate.instant('COMMENT_AGREEMENT'),
                scope: $scope,
                buttons: [
                    {
                        text: '<span>' + $translate.instant('FORM.GOT_IT') + '</span>',
                        type: 'button-positive button-block',
                        onTap: function (e) {
                            if(typeof callback === 'function') {
                                $scope.shouldShowAgreement = false;
                                callback();
                            }
                        }
                    }
                ]
            });
        } else { //Don't alert the user - he replies to him self
            if(typeof callback === 'function') {
                callback();
            }
        }
    }

    $scope.acceptQuestion = function() {
        Post.toggleAcceptance ($stateParams.firebase_id,$rootScope.user.uid);
        $scope.allowReply = true;
        $scope.showAcceptQuestion = false;
    }

    $scope.shouldShowAgreement = true;
    $scope.post = $firebaseObject(post);
    $scope.replyBody = '';
    $scope.add_img_preview = false;
    $scope.allowReply = false;
    $scope.showAcceptQuestion = false;


    $scope.post.$loaded().then(function(post) {

        if($rootScope.user.is_teacher) { //Tutor

            //Show accept button for assigned tutors
            var acceptingTutors = _.pluck(_.filter(post.potential_tutors, {post_status: 'accepted'}), 'id');
            if($rootScope.user.is_teacher && post.status === 'assigned' && acceptingTutors.length === 0) {
                $scope.allowReply = false;
                $scope.showAcceptQuestion = true;
            } else {
                $scope.allowReply = true;
                $scope.showAcceptQuestion = false;
            }

        } else { //User

            //Block replies after a certain amount of time
            if(post.status === 'answered') {
                var lastActivity = post.create_date;
                if(Array.isArray(post.replies)) {
                    lastActivity = Math.max(post.replies[post.replies-1].create_date, lastActivity);
                }

                if(lastActivity < moment().utc().subtract(8, 'hours').unix()) { //Allow replies within 32 hours from last activity
                    $scope.allowReply = false;
                }
            } else {
                $scope.allowReply = true;
                $scope.showAcceptQuestion = false;
            }

        }

    });

    $scope.report = {
        content: ""
    };
    $scope.reportConversation = function() {
        $ionicPopup.show({
            templateUrl: 'templates/partials/conversation-report-popup.html',
            scope: $scope,
            title: $translate.instant('REPORT_QUESTION'),
            buttons: [
                {
                    text: '<span>' + $translate.instant('CANCEL') + '</span>',
                    type: 'button-default button-block'
                },
                {
                    text: '<span>' + $translate.instant('SEND') + '</span>',
                    type: 'button-positive button-block',
                    onTap: function (e) {
                        $scope.post.$loaded().then(function (post) {
                            post.complaint = $scope.report.content;
                            $scope.report.content = "";
                            post.$save();
                            $ionicPopup.alert({
                                title: '',
                                template: $translate.instant('REPORT_SENT'),
                                okText: $translate.instant('OK')
                            });
                        });
                    }
                }
            ]
        });
    };
    $scope.backToHome = function () {
        $state.go('home');
    };
    $scope.addImage = function () {
        showAgreement(imageUpload);
    };
    $scope.showAgreement = function(){
        showAgreement(function(){
            $('#commentInput').focus(); //TODO: Find a way to make this work (which will allow the removal of $scope.shouldShowAgreement)
        });
    };
    $scope.addReply = function () {
        if (!$scope.replyBody) {
            $ionicPopup.alert({
                title: $translate.instant('ERROR'),
                template: $translate.instant('PLS_TYPE'),
                okText: $translate.instant('OK')
            });
            return false;
        }

        var persist_reply = function (img_id) {
            $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
            replies.$add({
                user: $rootScope.user.uid,
                name: $rootScope.user.name,
                body: $scope.replyBody,
                img_id: img_id || '',
                create_date: moment().utc().unix(),
                is_teacher: $rootScope.user.is_teacher
            }).then(function () {
                $ionicLoading.hide();
                $scope.add_img_preview = false;
                $scope.replyBody = '';
                add_img_url = null;
                $ionicScrollDelegate.scrollBottom(true);
                // Change question's status according to last comment's user type
                // + update update_date so it would go up in feed
                // + update last_tutor_id (if reply author is tutor), otherwise blank it so it's available to all
                $scope.post.$loaded().then(function (post) {
                    post.update_date = moment().utc().unix();
                    post.last_tutor_id = $rootScope.user.is_teacher ? $rootScope.user.uid : '';
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
                    if ($rootScope.user.is_teacher && post.amazon_endpoint_arn) {
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