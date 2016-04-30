angular.module('afterclass.controllers').controller('AskQuestionCtrl', (
    $rootScope, $scope, $ionicScrollDelegate, $ionicPopup, $translate, $window, $cordovaNetwork, MyCamera, CloudinaryUpload, Institutes, Post) => {

    // Listen to Firebase config collection change and rebuild the subjects array
    let populateScopeWithSubjects = () => Institutes.getSubjectsByInstituteAndDegree($rootScope.user.institute)
        .then(data => $scope.subjects = data);
    $scope.$on('configUpdated', populateScopeWithSubjects);
    populateScopeWithSubjects();

    let initQuestion = () => $scope.question = {subject: '', body: '', image: ''};
    initQuestion();

    /**
     * Save question to Firebase
     */
    $scope.addPost = () => {
        if (window.cordova && !$cordovaNetwork.isOnline()) {
            return alert($translate.instant('CHECK_INTERNET'));
        }
        if (!$scope.question.subject || !$scope.question.body.trim()) {
            $ionicPopup.alert({
                title   : $translate.instant('FORM.MISSING'),
                template: $translate.instant('FORM.REQUIRED'),
                okText  : $translate.instant('OK')
            });
            return false;
        }

        if ($scope.question.image) {
            CloudinaryUpload.uploadImage($scope.question.image).then(
                result => Post.persist($scope.question, result.public_id).then(initQuestion),
                err => {}
            );
        } else {
            Post.persist($scope.question).then(initQuestion);
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
            $scope.question.image = result.imageURI;
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
            $scope.question.image = result.imageURI;
        }, () => {});
    };

    /**
     * Remove picture from question
     */
    $scope.removeAttachment = () => {
        $scope.question.image = '';
        $ionicScrollDelegate.scrollTop();
    };

    /**
     * Confirm back if body filled
     */
    $scope.backToHomeConfirm = () => {
        if ($scope.question.body.trim() !== '') {
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