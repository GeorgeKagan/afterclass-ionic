angular.module('afterclass.services').factory('PostReply', (
    $rootScope, $firebaseObject, $firebaseArray, $ionicLoading, $ionicTabsDelegate, $ionicScrollDelegate, $ionicPopup, $state, $timeout, $log, $translate, $cordovaNetwork, $ionicActionSheet,
    MyFirebase, StudentCredit, CloudinaryUpload, AmazonSNS, Utils, MyCamera) => {
    
    let PostReply = {};

    PostReply.addReply = (replies, replyState, post) => {
        if (window.cordova && !$cordovaNetwork.isOnline()) {
            return alert($translate.instant('CHECK_INTERNET'));
        }

        if (!replyState.replyBody) {
            $ionicPopup.alert({
                title   : $translate.instant('ERROR'),
                template: $translate.instant('PLS_TYPE'),
                okText  : $translate.instant('OK')
            });
            return false;
        }

        if (replyState.addImgUrl) {
            CloudinaryUpload.uploadImage(replyState.addImgUrl).then(result => PostReply.persistReply(replies, replyState, post, result.public_id));
        } else {
            PostReply.persistReply(replies, replyState, post);
        }
    };

    PostReply.persistReply = (replies, replyState, post, imgId = null) => {
        let replyData = {
            user                : $rootScope.user.uid,
            first_name          : $rootScope.user.first_name || $rootScope.user.email,
            last_name           : $rootScope.user.last_name || '',
            body                : replyState.replyBody,
            img_id              : imgId || '',
            create_date         : Firebase.ServerValue.TIMESTAMP,
            create_date_human   : moment().format('D/M/YY H:mm:ss'),
            is_teacher          : $rootScope.user.is_teacher
        };

        if ($rootScope.user.is_teacher && post.potential_tutors) {
            let currPotTeacher = post.potential_tutors[$rootScope.user.$id];
            // Another try, returned field might change on the server
            if (!currPotTeacher) {
                currPotTeacher = post.potential_tutors[$rootScope.user.id];
            }
            // Get the timestamp when teacher accepted question and save it on the reply
            replyData.accept_date       = currPotTeacher ? currPotTeacher.status_update_date : null;
            // toggleAcceptance wasn't clicked somehow, so set it to current timestamp (accept by time of reply)
            replyData.accept_date       = replyData.accept_date || Firebase.ServerValue.TIMESTAMP;
            replyData.accept_date_human = moment(replyData.accept_date).format('D/M/YY H:mm:ss')
        }

        replies.$add(replyData).then(() => {
            replyState.addImgPreview  = false;
            replyState.replyBody      = '';
            replyState.addImgUrl      = null;
            $ionicScrollDelegate.scrollBottom(true);

            // Change question's status according to last comment's user type
            // + update update_date so it would go up in feed
            // + update last_tutor_id (if reply author is teacher), otherwise blank it so it's available to all
            post.$loaded().then(post => {
                post.update_date    = Firebase.ServerValue.TIMESTAMP;
                post.last_tutor_id  = $rootScope.user.is_teacher ? $rootScope.user.uid : '';
                // If teacher replied, mark q as answered
                if ($rootScope.user.is_teacher) {
                    post.status = 'answered';
                }
                // If student replied and status is answered, mark q as unanswered
                // and remove acceptedBy field (so would be available to all potential teachers)
                else if (post.status === 'answered') {
                    post.status = 'unanswered';
                    post.acceptedBy = null;
                }
                // If last reply was by teacher, reset potential teachers
                if (post.last_tutor_id) {
                    post.potential_tutors = null;
                }
                if ($rootScope.user.is_teacher && post.amazon_endpoint_arn) {
                    AmazonSNS.publish(
                        post.amazon_endpoint_arn,
                        $translate.instant('NOTIFICATIONS.TEACHER_REPLIED_TITLE'),
                        replyData.body
                    );
                }

                // Done, ask TEACHER for labels
                if ($rootScope.user.is_teacher) {
                    PostReply.teacherTaggingForm(post, () => {
                        post.$save();
                        Utils.triggerAlgorithm();
                    });
                } else {
                    post.$save();
                    Utils.triggerAlgorithm();
                }
            });
        }, error => {
            $log.log('Error: ', error);
        });
    };

    PostReply.imageUpload = replyState => {
        $ionicActionSheet.show({
            buttons         : [{text: $translate.instant('CAMERA')}, {text: $translate.instant('DOCUMENTS')}],
            destructiveText : replyState.addImgPreview ? $translate.instant('REMOVE') : '',
            titleText       : $translate.instant('SEL_SOURCE'),
            cancelText      : $translate.instant('CANCEL'),
            destructiveButtonClicked: () => {
                replyState.addImgPreview = false;
                replyState.addImgUrl     = null;
                return true;
            },
            buttonClicked: index => {
                if (!window.cordova) {
                    return alert('Only works on a real device!');
                }
                if (index === 0) {
                    // Camera
                    MyCamera.getPicture({sourceType: Camera.PictureSourceType.CAMERA}).then(result => {
                        replyState.addImgUrl = result.imageURI;
                        angular.element('.img-preview')
                            .error(() => reportError('Failed to load user image on view question: ' + result.imageURI))
                            .attr('src', result.imageURI);
                        replyState.addImgPreview = true;
                    }, () => replyState.addImgPreview = false);
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
                        replyState.addImgUrl = result.imageURI;
                        angular.element('.img-preview')
                            .error(() => reportError('Failed to load user image on view question: ' + result.imageURI))
                            .attr('src', result.imageURI);
                        replyState.addImgPreview = true;
                    }, () => replyState.addImgPreview = false);
                }
                return true;
            }
        });
    };

    PostReply.teacherTaggingForm = (post, callback) => {
        let popupScope   = $rootScope.$new(true);
        popupScope.label = {content: ''};

        if (typeof post.labels !== 'undefined' && _.isArray(post.labels)) {
            popupScope.label.content = post.labels.join(', ');
        }

        $ionicPopup.show({
            templateUrl : 'templates/partials/conversation-label-popup.html',
            scope       : popupScope,
            title       : $translate.instant('LABELING.TITLE'),
            buttons     : [{
                text: '<span>' + $translate.instant('SAVE') + '</span>',
                type: 'button-positive button-block',
                onTap: e => {
                    if (popupScope.label.content.trim() === '') {
                        e.preventDefault();
                        //TODO: Add a validation message
                    }
                    if (typeof post.labels === 'undefined') {
                        post.labels = [];
                    }
                    post.labels = _.filter(_.uniq(post.labels.concat(_.map(popupScope.label.content.split(','), _.trim))), label => label !== '');
                    $log.log('Final labels are:' + post.labels);
                    callback();
                }
            }]
        });
    };

    PostReply.showStudentAgreement = (callback, replies, replyState) => {
        let replyingTeachers = _.map(_.filter(replies, { 'is_teacher': true }), 'name');

        if (replyingTeachers.length > 0 && replyState.shouldShowAgreement && !$rootScope.user.is_teacher) {
            // Alert the uses regarding the rules
            $ionicPopup.show({
                template: $translate.instant('COMMENT_AGREEMENT'),
                // scope   : $scope,
                buttons : [
                    {
                        text: '<span>' + $translate.instant('FORM.GOT_IT') + '</span>',
                        type: 'button-positive button-block',
                        onTap: function () {
                            if (typeof callback === 'function') {
                                replyState.shouldShowAgreement = false;
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
    };

    return PostReply;
});