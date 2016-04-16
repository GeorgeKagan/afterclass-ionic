angular.module('afterclass.controllers').controller('ViewQuestionCtrl', (
    $rootScope, $scope, $timeout, $ionicScrollDelegate, $state, $stateParams, $firebaseObject, $firebaseArray, $ionicActionSheet,
    $translate, $ionicPopup, $cordovaNetwork, $q, $log, MyCamera, CloudinaryUpload, AmazonSNS, Post, MyFirebase, Rating, Utils) => {
    'use strict';

    let ref         = MyFirebase.getRef().child('/posts/' + $stateParams.firebase_id),
        post        = ref,
        replies     = $firebaseArray(ref.child('replies')),
        add_img_url = null;

    $scope.shouldShowAgreement  = true;
    $scope.post                 = $firebaseObject(post);
    $scope.replyBody            = '';
    $scope.add_img_preview      = false;
    $scope.showReplyForm        = false;
    $scope.showAcceptQuestion   = false;
    $scope.report               = { content: '', customMessage: '' };

    // Init functions
    $q.all([$scope.post.$loaded(), replies.$loaded()]).then(() => initRating(replies).then(() => initFooter($scope.post)));

    /**
     *
     * @param post
     */
    function initFooter(post) {
        $scope.isTutor = $rootScope.user.is_teacher;

        if ($scope.isTutor) { 
            $scope.showRating = false; //Student only

            // Tutor - Show accept button for assigned tutors
            let acceptingTutors = _.filter(post.potential_tutors, {post_status: 'accepted'});

            if ($scope.isTutor && post.status === 'assigned' && acceptingTutors.length === 0) {
                $scope.showReplyForm      = false;
                $scope.showAcceptQuestion = true;
            } else {
                $scope.showReplyForm      = true;
                $scope.showAcceptQuestion = false;
            }
        } else {
            $scope.showAcceptQuestion = false; //Tutor only

            if($scope.rating.hasRepliesToRate()) {
                $scope.showRating    = true;
                $scope.showReplyForm = false;
            } else {
                $scope.showRating    = false;
                $scope.showReplyForm = true;
            }
        }
    }

    /**
     *
     * @param replies
     * @returns {boolean|*}
     */
    function initRating(replies) {
        $scope.rating = Rating.getInstance(replies);

        if ($scope.rating.getRating() === 0) {
            $scope.allowReply = true;
        }
        $scope.rateAnswer = function(stars) {
            $scope.rating.rate(stars);
            if (stars <= 3) {
                $scope.reportConversation($translate.instant('RATING.RATING_TOO_LOW'));
            }
        };
        return $scope.rating.loaded;
    }

    /**
     *
     */
    function imageUpload() {
        $ionicActionSheet.show({
            buttons         : [{text: $translate.instant('CAMERA')}, {text: $translate.instant('DOCUMENTS')}],
            destructiveText : $scope.add_img_preview ? $translate.instant('REMOVE') : '',
            titleText       : $translate.instant('SEL_SOURCE'),
            cancelText      : $translate.instant('CANCEL'),
            destructiveButtonClicked: () => {
                $scope.add_img_preview  = false;
                add_img_url             = null;
                return true;
            },
            buttonClicked: index => {
                if (!window.cordova) {
                    return alert('Only works on a real device!');
                }
                if (index === 0) {
                    // Camera
                    MyCamera.getPicture({sourceType: Camera.PictureSourceType.CAMERA}).then(result => {
                        add_img_url = result.imageURI;
                        angular.element('.img-preview')
                            .error(() => reportError('Failed to load user image on view question: ' + result.imageURI))
                            .attr('src', result.imageURI);
                        $scope.add_img_preview = true;
                    }, () => $scope.add_img_preview = false);
                } else {
                    // Gallery
                    MyCamera.getPicture({sourceType: Camera.PictureSourceType.PHOTOLIBRARY}).then(result => {
                        if (!result.is_image) {
                            return $ionicPopup.alert({
                                title   : $translate.instant('ERROR'),
                                template: $translate.instant('FORM.ONLY_IMG'),
                                okText  : $translate.instant('OK')
                            });
                        }
                        add_img_url = result.imageURI;
                        angular.element('.img-preview')
                            .error(() => reportError('Failed to load user image on view question: ' + result.imageURI))
                            .attr('src', result.imageURI);
                        $scope.add_img_preview = true;
                    }, () => $scope.add_img_preview = false);
                }
                return true;
            }
        });
    }

    /**
     *
     * @param callback
     */
    function showAgreement(callback) {
        let replyingTutors = _.map(_.filter(replies, { 'is_teacher': true }), 'name');

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
            // Don't alert the user - he replies to himself
            if (typeof callback === 'function') {
                callback();
            }
        }
    }

    /**
     *
     */
    $scope.toggleReply = () => {
        if ($scope.showRating) { //Hide rating, show comment
            $scope.showRating    = false;
            $scope.showReplyForm = true;
        } else { //Hide comment, show rating
            $scope.showRating    = true;
            $scope.showReplyForm = false;
        }
    };

    /**
     *
     */
    $scope.acceptQuestion = () => {
        if (window.cordova && !$cordovaNetwork.isOnline()) {
            return alert('Please check that you are connected to the internet');
        }
        Post.toggleAcceptance($stateParams.firebase_id, $rootScope.user.uid);
        $scope.showReplyForm      = true;
        $scope.showAcceptQuestion = false;
    };

    /**
     *
     * @param customMessage
     */
    $scope.reportConversation = customMessage => {
        if (window.cordova && !$cordovaNetwork.isOnline()) {
            return alert($translate.instant('CHECK_INTERNET'));
        }
        $scope.report.customMessage = typeof customMessage !== 'undefined' ? customMessage : '';

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
                onTap: () => {
                    if (!$scope.report.content.trim()) {
                        return;
                    }
                    $scope.post.$loaded().then(() => {
                        let complaints = $firebaseArray(ref.child('complaints'));
                        complaints.$loaded().then(post => {
                            complaints.$add({
                                user                : $rootScope.user.name,
                                body                : $scope.report.content,
                                create_date         : Firebase.ServerValue.TIMESTAMP,
                                create_date_human   : moment().format('D/M/YY H:mm:ss'),
                                is_teacher          : $rootScope.user.is_teacher
                            });
                            $scope.report.content = '';
                            post.$save();
                            $timeout(() => {
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

    $scope.addImage = () => showAgreement(imageUpload);

    //TODO: Find a way to make this work (which will allow the removal of $scope.shouldShowAgreement)
    $scope.showAgreement = () => showAgreement(() => angular.element('#commentInput').focus());

    /**
     *
     * @returns {boolean}
     */
    $scope.addReply = () => {
        if (window.cordova && !$cordovaNetwork.isOnline()) {
            return alert($translate.instant('CHECK_INTERNET'));
        }

        if (!$scope.replyBody) {
            $ionicPopup.alert({
                title   : $translate.instant('ERROR'),
                template: $translate.instant('PLS_TYPE'),
                okText  : $translate.instant('OK')
            });
            return false;
        }

        /**
         * 
         * @param img_id
         */
        let persist_reply = img_id => {
            let replyData = {
                user                : $rootScope.user.uid,
                first_name          : $rootScope.user.first_name || $rootScope.user.email,
                last_name           : $rootScope.user.last_name || '',
                body                : $scope.replyBody,
                img_id              : img_id || '',
                create_date         : Firebase.ServerValue.TIMESTAMP,
                create_date_human   : moment().format('D/M/YY H:mm:ss'),
                is_teacher          : $rootScope.user.is_teacher
            };

            if ($rootScope.user.is_teacher && $scope.post.potential_tutors) {
                let currPotTutor = $scope.post.potential_tutors[$rootScope.user.$id];
                // Another try, returned field might change on the server
                if (!currPotTutor) {
                    currPotTutor = $scope.post.potential_tutors[$rootScope.user.id];
                }
                // Get the timestamp when teacher accepted question and save it on the reply
                replyData.accept_date       = currPotTutor ? currPotTutor.status_update_date : null;
                // toggleAcceptance wasn't clicked somehow, so set it to current timestamp (accept by time of reply)
                replyData.accept_date       = replyData.accept_date || Firebase.ServerValue.TIMESTAMP;
                replyData.accept_date_human = moment(replyData.accept_date).format('D/M/YY H:mm:ss')
            }

            replies.$add(replyData).then(() => {
                $scope.add_img_preview  = false;
                $scope.replyBody        = '';
                add_img_url             = null;
                $ionicScrollDelegate.scrollBottom(true);

                // Change question's status according to last comment's user type
                // + update update_date so it would go up in feed
                // + update last_tutor_id (if reply author is tutor), otherwise blank it so it's available to all
                $scope.post.$loaded().then(post => {
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
                        AmazonSNS.publish(
                            post.amazon_endpoint_arn,
                            $translate.instant('NOTIFICATIONS.TUTOR_REPLIED_TITLE'),
                            replyData.body
                        );
                    }
                    post.$save();
                    Utils.triggerAlgorithm();
                });
            }, error => {
                $log.log('Error: ', error);
            });
        };
        if (add_img_url) {
            CloudinaryUpload.uploadImage(add_img_url).then(result => persist_reply(result.public_id));
        } else {
            persist_reply();
        }
    };

    $scope.viewFullImage = img_id => $state.go('fullImage', {img_id: img_id});

    $timeout(() => {
        if ($state.current.name === 'viewPost') {
            $ionicScrollDelegate.scrollBottom(true);
        }
    }, 500);
});