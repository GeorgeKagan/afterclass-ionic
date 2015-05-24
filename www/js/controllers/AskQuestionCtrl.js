angular.module('afterclass.controllers').controller('AskQuestionCtrl', function ($rootScope, $scope, $ionicScrollDelegate, $ionicTabsDelegate, $state, $firebaseArray, $ionicLoading,
                                                                                 $cordovaDialogs, $timeout, $translate, MyCamera, CloudinaryUpload, Institutes) {
    var img = angular.element('#aq-img');
    var ref = new Firebase("https://dazzling-heat-8303.firebaseio.com/posts");
    var posts = $firebaseArray(ref);
    var add_img_url = null;
    Institutes.getSubjectsByInstituteAndDegree($rootScope.user.institute, $rootScope.user.degree).then(function (data) {
        $scope.subjects = data;
    });
    $scope.addPost = function () {
        if (angular.element('#aq-subject').val() === '' || angular.element('#aq-body').val() === '') {
            $cordovaDialogs.alert($translate.instant('FORM.REQUIRED'), $translate.instant('FORM.MISSING'), $translate.instant('OK'));
            return false;
        }
        var persist_post = function (img_id) {
            $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
            posts.$add({
                user: $rootScope.user.id,
                subject: angular.element('#aq-subject').val(),
                body: angular.element('#aq-body').val(),
                img_id: img_id || '',
                status: 'unanswered',
                ask_date: moment().format("MMM Do YY"),
                timestamp: moment().unix(),
                replies: '',
                potential_tutors: null,
                last_tutor_id: '',
                amazon_endpoint_arn: $rootScope.user.amazon_endpoint_arn
            }).then(function () {
                $timeout(function () {
                    add_img_url = null;
                    $ionicLoading.hide();
                    $state.go('home').then(function() {
                        var unanswered = 0;
                        $ionicTabsDelegate.select(unanswered);
                        $timeout(function() {
                            $cordovaDialogs.alert($translate.instant('FORM.Q_SENT'), $translate.instant('FORM.Q_SENT_TITLE'), $translate.instant('GOT_IT'));
                        }, 1000);
                    });
                }, 1000);
            }, function (error) {
                $ionicLoading.hide();
                console.log("Error:", error);
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
    $scope.subjectChanged = function () {
        angular.element('#aq-body')[0].focus();
    };
    $scope.backToHome = function () {
        $state.go('home');
    };
    $scope.takePicture = function () {
        MyCamera.getPicture({sourceType: Camera.PictureSourceType.CAMERA}).then(function (result) {
            add_img_url = result.imageURI;
            img.html('<img src="' + result.imageURI + '">');
            $ionicScrollDelegate.scrollTop();
        }, function () {
            img.html('');
            $ionicScrollDelegate.scrollTop();
        });
    };
    $scope.choosePicture = function () {
        MyCamera.getPicture({sourceType: Camera.PictureSourceType.PHOTOLIBRARY}).then(function (result) {
            if (!result.is_image) {
                return $cordovaDialogs.alert($translate.instant('FORM.ONLY_IMG'), $translate.instant('ERROR'), $translate.instant('OK'));
            }
            add_img_url = result.imageURI;
            img.html('<img src="' + result.imageURI + '">');
            $ionicScrollDelegate.scrollTop();
        }, function () {
            img.html('');
            $ionicScrollDelegate.scrollTop();
        });
    };
});