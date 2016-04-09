angular.module('afterclass.controllers').controller('AskQuestionCtrl', (
    $rootScope, $scope, $ionicScrollDelegate, $ionicTabsDelegate, $state, $firebaseArray, $ionicLoading,
    $ionicPopup, $timeout, $translate, $window, $cordovaNetwork, MyCamera, CloudinaryUpload, Institutes, MyFirebase, StudentCredit, Utils) => {

    let img         = angular.element('#aq-img'),
        ref         = MyFirebase.getRef().child('posts'),
        posts       = $firebaseArray(ref),
        add_img_url = null;

    // Listen to Firebase config collection change and rebuild the subjects array
    let populateScopeWithSubjects = () => Institutes.getSubjectsByInstituteAndDegree($rootScope.user.institute).then(data => $scope.subjects = data);
    $scope.$on('configUpdated', populateScopeWithSubjects);
    populateScopeWithSubjects();

    $scope.body          = {val: ''};
    $scope.hasAttachment = false;

    /**
     * Save question to Firebase
     */
    $scope.addPost = () => {
        if (window.cordova && !$cordovaNetwork.isOnline()) {
            return alert($translate.instant('CHECK_INTERNET'));
        }
        if (angular.element('#aq-subject').val() === '' || angular.element('#aq-body').val() === '') {
            $ionicPopup.alert({
                title   : $translate.instant('FORM.MISSING'),
                template: $translate.instant('FORM.REQUIRED'),
                okText  : $translate.instant('OK')
            });
            return false;
        }

        /**
         *
         * @param img_id
         */
        let persistPost = img_id => {
            $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
            posts.$add({
                user                : $rootScope.user.uid,
                subject             : angular.element('#aq-subject').val(),
                body                : angular.element('#aq-body').val(),
                img_id              : img_id || '',
                status              : 'unanswered',
                create_date         : Firebase.ServerValue.TIMESTAMP,
                update_date         : Firebase.ServerValue.TIMESTAMP,
                potential_tutors    : null,
                replies             : '',
                last_tutor_id       : '',
                amazon_endpoint_arn : $rootScope.user.amazon_endpoint_arn ? $rootScope.user.amazon_endpoint_arn : ''
            }).then(() => {
                StudentCredit.deductCredits(1);
                $timeout(() => {
                    add_img_url = null;
                    $state.go('home').then(() => {
                        $timeout(() => {
                            let unanswered = 0;
                            $ionicLoading.hide();
                            $ionicTabsDelegate.select(unanswered);

                            // Popup with button to like us on Facebook
                            let popupScope   = $rootScope.$new();
                            popupScope.close = () => popup.close();

                            let popup = $ionicPopup.alert({
                                title: $translate.instant('FORM.Q_SENT_TITLE'),
                                template:
                                `<div class="text-center">` +
                                    $translate.instant('FORM.Q_SENT') +
                                    `<hr class="m-10" style="border:0;border-top:1px solid #f0f0f0;">
                                     <p class="text-center pb-5"><small>` + $translate.instant('LIKE_US') + `</small></p>
                                     <facebook-like></facebook-like>
                                     <div class="text-center pt-10 pb-5" ng-click="close()">` + $translate.instant('NEXT_TIME') + `</div>
                                </div>`,
                                buttons: [],
                                scope: popupScope
                            });

                            Utils.triggerAlgorithm();
                        }, 1000);
                    });
                }, 1000);
            }, error => {
                $ionicLoading.hide();
                console.log('Error: ', error);
            });
        };
        if (add_img_url) {
            CloudinaryUpload.uploadImage(add_img_url).then(
                function (result) {
                    persistPost(result.public_id);
                },
                function (err) {

                }
            );
        } else {
            persistPost();
        }
    };

    /**
     * Take picture with camera
     */
    $scope.takePicture = () => {
        if (!window.cordova) {
            return alert('Only works on a real device!');
        }
        MyCamera.getPicture({sourceType: Camera.PictureSourceType.CAMERA}).then(result => {
            add_img_url = result.imageURI;
            $timeout(() => {
                $scope.hasAttachment = true;
                img.html(`<img src="${result.imageURI}">`).find('img').hide().load(function() {
                    angular.element(this).fadeIn();
                    $ionicScrollDelegate.scrollTop();
                }).error(() => {
                    reportError('Failed to load user image on ask question: ' + result.imageURI);
                    $scope.removeAttachment();
                });
            }, 1000);
        }, () => {});
    };

    /**
     * Choose picture from gallery
     */
    $scope.choosePicture = () => {
        if (!window.cordova) {
            return alert('Only works on a real device!');
        }
        MyCamera.getPicture({sourceType: Camera.PictureSourceType.PHOTOLIBRARY}).then(result => {
            if (!result.is_image) {
                $scope.removeAttachment();
                return $ionicPopup.alert({
                    title   : $translate.instant('ERROR'),
                    template: $translate.instant('FORM.ONLY_IMG'),
                    okText  : $translate.instant('OK')
                });
            }
            add_img_url = result.imageURI;
            $timeout(() => {
                $scope.hasAttachment = true;
                img.html(`<img src="${result.imageURI}">`).find('img').hide().load(function() {
                    angular.element(this).fadeIn();
                    $ionicScrollDelegate.scrollBottom();
                }).error(() => {
                    reportError('Failed to load user image on ask question: ' + result.imageURI);
                    $scope.removeAttachment();
                    $ionicPopup.alert({
                        title   : $translate.instant('ERROR'),
                        template: $translate.instant('FORM.BAD_IMG'),
                        okText  : $translate.instant('OK')
                    });
                });
            }, 1000);
        }, () => {});
    };

    /**
     * Remove picture from question
     */
    $scope.removeAttachment = () => {
        add_img_url          = null;
        $scope.hasAttachment = false;
        img.html('');
        $ionicScrollDelegate.scrollTop();
    };

    /**
     * Confirm back if body filled
     */
    $scope.backToHomeConfirm = () => {
        if ($scope.body.val.trim() !== '') {
            let confirmPopup = $ionicPopup.confirm({
                title: $translate.instant('FORM.DATA_FILLED'),
                template: $translate.instant('FORM.BACK_ANYWAY'),
                cancelText: $translate.instant('CANCEL'),
                okText: $translate.instant('OK')
            });
            confirmPopup.then(res => {
                if (!res) { return; }
                $window.history.back();
            });
        } else {
            $window.history.back();
        }
    };
});