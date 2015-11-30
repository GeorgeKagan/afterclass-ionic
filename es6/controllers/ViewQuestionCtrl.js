angular.module('afterclass.controllers').controller('ViewQuestionCtrl', function (
    $rootScope, $scope, $http, $timeout, $ionicScrollDelegate, $state, $stateParams, $firebaseObject, $firebaseArray, $ionicLoading, $ionicActionSheet,
    $translate, $ionicPopup, $cordovaNetwork, MyCamera, CloudinaryUpload, AmazonSNS, Post, MyFirebase) {
    'use strict';
    var ref         = MyFirebase.getRef().child('/posts/' + $stateParams.firebase_id),
        post        = ref,
        replies     = $firebaseArray(ref.child('replies')),
        add_img_url = null;

    $scope.shouldShowAgreement  = true;
    $scope.post                 = $firebaseObject(post);
    $scope.replyBody            = '';
    $scope.add_img_preview      = false;
    $scope.allowReply           = false;
    $scope.showAcceptQuestion   = false;
    $scope.report               = {content: ''};

    $scope.post.$loaded().then(function(post) {
        if ($rootScope.user.is_teacher) {
            // Tutor
            // Show accept button for assigned tutors
            var acceptingTutors = _.pluck(_.filter(post.potential_tutors, {post_status: 'accepted'}), 'id');
            if ($rootScope.user.is_teacher && post.status === 'assigned' && acceptingTutors.length === 0) {
                $scope.allowReply           = false;
                $scope.showAcceptQuestion   = true;
            } else {
                $scope.allowReply           = true;
                $scope.showAcceptQuestion   = false;
            }
        } else {
            // User
            // Block replies after a certain amount of time
            if (post.status === 'answered') {
                var lastActivity = post.create_date;
                if (Array.isArray(post.replies)) {
                    lastActivity = Math.max(post.replies[post.replies-1].create_date, lastActivity);
                }
                if (lastActivity > moment().utc().subtract(8, 'hours').unix()) {
                    // Allow replies within 32 hours from last activity
                    $scope.allowReply = true;
                }
            } else {
                $scope.allowReply           = true;
                $scope.showAcceptQuestion   = false;
            }
        }
    });

    function imageUpload() {
        $ionicActionSheet.show({
            buttons         : [{text: $translate.instant('CAMERA')}, {text: $translate.instant('DOCUMENTS')}],
            destructiveText : $scope.add_img_preview ? $translate.instant('REMOVE') : '',
            titleText       : $translate.instant('SEL_SOURCE'),
            cancelText      : $translate.instant('CANCEL'),
            destructiveButtonClicked: function () {
                $scope.add_img_preview  = false;
                add_img_url             = null;
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
                                title   : $translate.instant('ERROR'),
                                template: $translate.instant('FORM.ONLY_IMG'),
                                okText  : $translate.instant('OK')
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
        if (replyingTutors.length > 0 && $scope.shouldShowAgreement && !$rootScope.user.is_teacher) {
            // Alert the uses regarding the rules
            $ionicPopup.show({
                template: $translate.instant('COMMENT_AGREEMENT'),
                scope   : $scope,
                buttons : [
                    {
                        text: '<span>' + $translate.instant('FORM.GOT_IT') + '</span>',
                        type: 'button-positive button-block',
                        onTap: function () {
                            if (typeof callback === 'function') {
                                $scope.shouldShowAgreement = false;
                                callback();
                            }
                        }
                    }
                ]
            });
        } else {
            // Don't alert the user - he replies to him self
            if (typeof callback === 'function') {
                callback();
            }
        }
    }

    $scope.acceptQuestion = function() {
        if (window.cordova && !$cordovaNetwork.isOnline()) {
            return alert('Please check that you are connected to the internet');
        }
        Post.toggleAcceptance($stateParams.firebase_id, $rootScope.user.uid);
        $scope.allowReply           = true;
        $scope.showAcceptQuestion   = false;
    };

    $scope.reportConversation = function() {
        if (window.cordova && !$cordovaNetwork.isOnline()) {
            return alert('Please check that you are connected to the internet');
        }
        $ionicPopup.show({
            templateUrl : 'templates/partials/conversation-report-popup.html',
            scope       : $scope,
            title       : $translate.instant('REPORT_QUESTION'),
            buttons     : [{
                    text: '<span>' + $translate.instant('CANCEL') + '</span>',
                    type: 'button-default button-block'
                }, {
                    text: '<span>' + $translate.instant('SEND') + '</span>',
                    type: 'button-positive button-block',
                    onTap: function () {
                        if (!$scope.report.content.trim()) {
                            return;
                        }
                        $scope.post.$loaded().then(function (post) {
                            var complaints = $firebaseArray(ref.child('complaints'));
                            complaints.$loaded().then(function(post) {
                                complaints.$add({
                                    user                : $rootScope.user.name,
                                    body                : $scope.report.content,
                                    create_date         : Firebase.ServerValue.TIMESTAMP,
                                    create_date_human   : moment().format('D/M/YY H:mm:ss'),
                                    is_teacher          : $rootScope.user.is_teacher
                                });
                                $scope.report.content = '';
                                post.$save();
                                $timeout(function() {
                                    $ionicPopup.alert({
                                        title   : '',
                                        template: $translate.instant('REPORT_SENT'),
                                        okText  : $translate.instant('OK')
                                    });
                                }, 0);
                            });
                        });
                    }
                }
            ]
        });
    };

    $scope.addImage = function () {
        showAgreement(imageUpload);
    };

    $scope.showAgreement = function() {
        showAgreement(function() {
            //TODO: Find a way to make this work (which will allow the removal of $scope.shouldShowAgreement)
            $('#commentInput').focus();
        });
    };

    $scope.addReply = function () {
        if (window.cordova && !$cordovaNetwork.isOnline()) {
            return alert('Please check that you are connected to the internet');
        }

        if (!$scope.replyBody) {
            $ionicPopup.alert({
                title   : $translate.instant('ERROR'),
                template: $translate.instant('PLS_TYPE'),
                okText  : $translate.instant('OK')
            });
            return false;
        }

        var persist_reply = function (img_id) {
            $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});

            var replyData = {
                user                : $rootScope.user.uid,
                first_name          : $rootScope.user.first_name,
                last_name           : $rootScope.user.last_name,
                body                : $scope.replyBody,
                img_id              : img_id || '',
                create_date         : Firebase.ServerValue.TIMESTAMP,
                create_date_human   : moment().format('D/M/YY H:mm:ss'),
                is_teacher          : $rootScope.user.is_teacher
            };

            if ($rootScope.user.is_teacher && $scope.post.potential_tutors) {
                // Get the timestamp when teacher accepted question and save it on the reply
                replyData.accept_date       = $scope.post.potential_tutors[$rootScope.user.$id].status_update_date;
                replyData.accept_date_human = moment(replyData.accept_date).format('D/M/YY H:mm:ss')
            }

            replies.$add(replyData).then(function () {
                $ionicLoading.hide();
                $scope.add_img_preview  = false;
                $scope.replyBody        = '';
                add_img_url             = null;
                $ionicScrollDelegate.scrollBottom(true);
                // Change question's status according to last comment's user type
                // + update update_date so it would go up in feed
                // + update last_tutor_id (if reply author is tutor), otherwise blank it so it's available to all
                $scope.post.$loaded().then(function (post) {
                    post.update_date    = Firebase.ServerValue.TIMESTAMP;
                    post.last_tutor_id  = $rootScope.user.is_teacher ? $rootScope.user.uid : '';
                    // If teacher replied, mark q as answered
                    if ($rootScope.user.is_teacher) {
                        post.status = 'answered';
                    }
                    // If student replied and status is answered, mark q as unanswered
                    // and remove acceptedBy field (so would be available to all potential tutors)
                    else if (post.status === 'answered') {
                        post.status = 'unanswered';
                        post.acceptedBy = null;
                    }
                    // If last reply was by tutor, reset potential tutors
                    if (post.last_tutor_id) {
                        post.potential_tutors = null;
                    }
                    if ($rootScope.user.is_teacher && post.amazon_endpoint_arn) {
                        AmazonSNS.publish(post.amazon_endpoint_arn, $translate.instant('NOTIFICATIONS.TUTOR_REPLIED'));
                    }
                    post.$save();

                    // Run sync + algorithm
                    $http.get('http://dashboard.afterclass.co.il/run_sync_and_algorithm.php?hash=FHRH$e509ru28340sdfc2$', function (data) { console.info(data); });
                });
            }, function (error) {
                $ionicLoading.hide();
                console.log('Error: ', error);
            });
        };
        if (add_img_url) {
            CloudinaryUpload.uploadImage(add_img_url).then(function (result) { persist_reply(result.public_id); });
        } else {
            persist_reply();
        }
    };

    $scope.viewFullImage = function (img_id) {
        $state.go('fullImage', {img_id: img_id});
    };

    $timeout(function() {
        $ionicScrollDelegate.scrollBottom(true);
    }, 1000);
});