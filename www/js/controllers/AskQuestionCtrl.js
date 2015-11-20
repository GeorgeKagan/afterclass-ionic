angular.module('afterclass.controllers').controller('AskQuestionCtrl', function (
    $rootScope, $scope, $http, $ionicScrollDelegate, $ionicTabsDelegate, $state, $firebaseArray, $ionicLoading,
    $ionicPopup, $timeout, $translate, $window, $cordovaNetwork, MyCamera, CloudinaryUpload, Institutes, MyFirebase, Coupon) {

    var img         = angular.element('#aq-img');
    var ref         = MyFirebase.getRef().child('posts');
    var posts       = $firebaseArray(ref);
    var add_img_url = null;

    Institutes.getSubjectsByInstituteAndDegree($rootScope.user.institute, $rootScope.user.degree).then(function (data) {
        $scope.subjects = data;
    });

    $scope.body = {val: ''};
    $scope.hasAttachment = false;

    /**
     * Save question to Firebase
     */
    $scope.addPost = function () {
        if (window.cordova && !$cordovaNetwork.isOnline()) {
            return alert('Please check that you are connected to the internet');
        }
        if (angular.element('#aq-subject').val() === '' || angular.element('#aq-body').val() === '') {
            $ionicPopup.alert({
                title   : $translate.instant('FORM.MISSING'),
                template: $translate.instant('FORM.REQUIRED'),
                okText  : $translate.instant('OK')
            });
            return false;
        }
        var persist_post = function (img_id) {
            $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
            posts.$add({
                user                   : $rootScope.user.uid,
                subject                : angular.element('#aq-subject').val(),
                body                   : angular.element('#aq-body').val(),
                img_id                 : img_id || '',
                status                 : 'unanswered',
                create_date            : Firebase.ServerValue.TIMESTAMP,
                update_date            : Firebase.ServerValue.TIMESTAMP,
                potential_tutors       : null,
                replies                : '',
                last_tutor_id          : '',
                amazon_endpoint_arn    : $rootScope.user.amazon_endpoint_arn ? $rootScope.user.amazon_endpoint_arn : ''
            }).then(function () {
                Coupon.deductCredits(1);
                $timeout(function () {
                    add_img_url = null;
                    $state.go('home').then(function() {
                        $timeout(function() {
                            var unanswered = 0;
                            $ionicLoading.hide();
                            $ionicTabsDelegate.select(unanswered);
                            $ionicPopup.alert({
                                title   : $translate.instant('FORM.Q_SENT_TITLE'),
                                template: $translate.instant('FORM.Q_SENT'),
                                okText  : $translate.instant('OK')
                            });

                            // Run sync + algorithm
                            $http.get('http://dashboard.afterclass.co.il/run_sync_and_algorithm.php?hash=FHRH$e509ru28340sdfc2$', function (data) { console.info(data); });
                        }, 1000);
                    });
                }, 1000);
            }, function (error) {
                $ionicLoading.hide();
                console.log('Error: ', error);
            });
        };
        if (add_img_url) {
            CloudinaryUpload.uploadImage(add_img_url).then(
                function (result) {
                    persist_post(result.public_id);
                },
                function (err) {

                }
            );
        } else {
            persist_post();
        }
    };

    /**
     * Focus body text area
     */
    $scope.subjectChanged = function () {
        //angular.element('#aq-body')[0].focus();
    };

    /**
     * Take picture with camera
     */
    $scope.takePicture = function () {
        MyCamera.getPicture({sourceType: Camera.PictureSourceType.CAMERA}).then(function (result) {
            add_img_url = result.imageURI;
            $timeout(function() {
                $scope.hasAttachment = true;
                img.html('<img src="' + result.imageURI + '">').find('img').hide().load(function() {
                    angular.element(this).fadeIn();
                    $ionicScrollDelegate.scrollTop();
                });
            }, 1000);
        }, function () { });
    };

    /**
     * Choose picture from gallery
     */
    $scope.choosePicture = function () {
        MyCamera.getPicture({sourceType: Camera.PictureSourceType.PHOTOLIBRARY}).then(function (result) {
            if (!result.is_image) {
                $scope.removeAttachment();
                return $ionicPopup.alert({
                    title   : $translate.instant('ERROR'),
                    template: $translate.instant('FORM.ONLY_IMG'),
                    okText  : $translate.instant('OK')
                });
            }
            add_img_url = result.imageURI;
            $timeout(function() {
                $scope.hasAttachment = true;
                img.html('<img src="' + result.imageURI + '">').find('img').hide().load(function() {
                    angular.element(this).fadeIn();
                    $ionicScrollDelegate.scrollBottom();
                }).error(function() {
                    $scope.removeAttachment();
                    $ionicPopup.alert({
                        title   : $translate.instant('ERROR'),
                        template: $translate.instant('FORM.BAD_IMG'),
                        okText  : $translate.instant('OK')
                    });
                });
            }, 1000);
        }, function () { });
    };

    /**
     * Remove picture from question
     */
    $scope.removeAttachment = function () {
        add_img_url             = null;
        $scope.hasAttachment    = false;
        img.html('');
        $ionicScrollDelegate.scrollTop();
    };

    /**
     * Confirm back if body filled
     */
    $scope.backToHome = function () {
        if ($scope.body.val.trim() !== '') {
            var confirmPopup = $ionicPopup.confirm({
                title: $translate.instant('FORM.DATA_FILLED'),
                template: $translate.instant('FORM.BACK_ANYWAY'),
                cancelText: $translate.instant('CANCEL'),
                okText: $translate.instant('OK')
            });
            confirmPopup.then(function(res) {
                if (!res) { return; }
                $window.history.back();
            });
        } else {
            $window.history.back();
        }
    };
});