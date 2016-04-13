angular.module('afterclass.controllers').controller('AskQuestionCtrl', (
    $rootScope, $scope, $ionicScrollDelegate, $ionicTabsDelegate, $state, $firebaseArray, $ionicLoading,
    $ionicPopup, $timeout, $translate, $window, $cordovaNetwork, $log, MyCamera, CloudinaryUpload, Institutes, MyFirebase, Post) => {

    let img         = angular.element('#aq-img'),
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

        if (add_img_url) {
            CloudinaryUpload.uploadImage(add_img_url).then(
                result => Post.persist(result.public_id).then(() => add_img_url = null),
                err => {}
            );
        } else {
            Post.persist().then(() => add_img_url = null);
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