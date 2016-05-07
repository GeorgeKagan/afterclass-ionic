angular.module('afterclass.controllers').controller('ViewQuestionCtrl', (
    $rootScope, $scope, $timeout, $ionicScrollDelegate, $state, $stateParams, $firebaseObject, $firebaseArray, $ionicActionSheet,
    $translate, $ionicPopup, $cordovaNetwork, $q, $log, MyCamera, CloudinaryUpload, AmazonSNS, Post, MyFirebase, Rating, Utils, PostReply) => {
    'use strict';

    let ref         = MyFirebase.getRef().child('/posts/' + $stateParams.firebase_id),
        post        = ref,
        replies     = $firebaseArray(ref.child('replies'));
        // addImgUrl   = null;

    // $scope.shouldShowAgreement  = true;
    $scope.post                 = $firebaseObject(post);
    $scope.replyState           = {replyBody: '', addImgPreview: '', addImgUrl: '', shouldShowAgreement: true};
    // $scope.replyBody            = '';
    // $scope.addImgPreview        = false;
    $scope.showReplyForm        = false;
    $scope.showAcceptQuestion   = false;
    $scope.report               = {content: '', customMessage: ''};

    // Init functions
    $q.all([$scope.post.$loaded(), replies.$loaded()]).then(() => initRating(replies).then(() => initFooter($scope.post)));

    /**
     *
     * @param post
     */
    //todo: decide what to do with it
    function initFooter(post) {
        $scope.isTeacher = $rootScope.user.is_teacher;

        if ($scope.isTeacher) {
            $scope.showRating = false; //Student only

            // Teacher - Show accept button for assigned teachers
            let acceptingTeachers = _.filter(post.potential_tutors, {post_status: 'accepted'});

            if ($scope.isTeacher && post.status === 'assigned' && acceptingTeachers.length === 0) {
                $scope.showReplyForm      = false;
                $scope.showAcceptQuestion = true;
            } else {
                $scope.showReplyForm      = true;
                $scope.showAcceptQuestion = false;
            }
        } else {
            $scope.showAcceptQuestion = false; // Teacher only

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
    //todo: decide what to do with it
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
    //todo: move to PostReply service
    function imageUpload() {
        $ionicActionSheet.show({
            buttons         : [{text: $translate.instant('CAMERA')}, {text: $translate.instant('DOCUMENTS')}],
            destructiveText : $scope.replyState.addImgPreview ? $translate.instant('REMOVE') : '',
            titleText       : $translate.instant('SEL_SOURCE'),
            cancelText      : $translate.instant('CANCEL'),
            destructiveButtonClicked: () => {
                $scope.replyState.addImgPreview  = false;
                $scope.replyState.addImgUrl      = null;
                return true;
            },
            buttonClicked: index => {
                if (!window.cordova) {
                    return alert('Only works on a real device!');
                }
                if (index === 0) {
                    // Camera
                    MyCamera.getPicture({sourceType: Camera.PictureSourceType.CAMERA}).then(result => {
                        $scope.replyState.addImgUrl = result.imageURI;
                        angular.element('.img-preview')
                            .error(() => reportError('Failed to load user image on view question: ' + result.imageURI))
                            .attr('src', result.imageURI);
                        $scope.replyState.addImgPreview = true;
                    }, () => $scope.replyState.addImgPreview = false);
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
                        $scope.replyState.addImgUrl = result.imageURI;
                        angular.element('.img-preview')
                            .error(() => reportError('Failed to load user image on view question: ' + result.imageURI))
                            .attr('src', result.imageURI);
                        $scope.replyState.addImgPreview = true;
                    }, () => $scope.replyState.addImgPreview = false);
                }
                return true;
            }
        });
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
    //todo: move to Post service
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
                                    title   : $translate.instant('SUCCESS'),
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

    $scope.viewFullImage = imgId => $state.go('fullImage', {img_id: imgId});
    $scope.addImage      = () => PostReply.showStudentAgreement(imageUpload, replies, $scope.replyState);
    $scope.addReply      = () => PostReply.addReply(replies, $scope.replyState, $scope.post);
    //TODO: Find a way to make this work (which will allow the removal of $scope.shouldShowAgreement)
    $scope.showAgreement = () => PostReply.showStudentAgreement(() => angular.element('#commentInput').focus(), replies, $scope.replyState);

    $timeout(() => $state.current.name === 'viewPost' && $ionicScrollDelegate.scrollBottom(true), 500);
});