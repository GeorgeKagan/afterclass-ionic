angular.module('afterclass.controllers').

    controller('UserDetailsChooseTypeCtrl', function ($scope, $state, $ionicHistory, $ionicPopup, $translate, User, InstitutePopup) {
        $scope.student = function () {
            $ionicPopup.confirm({
                title: $translate.instant('USER_DETAILS.SELECTED_STUDENT'),
                template: $translate.instant('CORRECT_SELECTION'),
                cancelText: $translate.instant('CANCEL'),
                okText: $translate.instant('OK')
            }).then(function(res) {
                if (!res) { return; }
                User.updateUser({
                    is_choose_type_finished : true,
                    is_teacher              : false,
                    target_institutes       : null
                });
                $state.go('home');
                $ionicHistory.nextViewOptions({disableBack: true});
            });
        };
        $scope.tutor = function () {
            $state.go('userDetails_tutorStep1');
        };
    }).

    controller('UserDetailsTutorStep1Ctrl', function ($rootScope, $scope, $state, $http, TutorDetails, AppConfig) {
        $scope.selInstitutes = {};

        // If edit mode - mark chosen institutes as selected
        if ($rootScope.user.target_institutes) {
            Object.keys($rootScope.user.target_institutes).forEach(inst => {
                if (Object.keys($rootScope.user.target_institutes[inst]).length) {
                    $scope.selInstitutes[inst] = true;
                }
            });
        }

        AppConfig.loadConfig().then(() => {
            $scope.institutes = angular.copy(AppConfig.getConfig().gradesSubjects);
        });
        $scope.submitTutorStep1 = function () {
            var degrees = TutorDetails.getDegreesBySelectedInstitutes($scope.selInstitutes, $scope.institutes);
            TutorDetails.setPayloadInstitutes($scope.selInstitutes);
            TutorDetails.setDegrees(degrees);
            $state.go('userDetails_tutorStep2', {isEdit: $state.params.isEdit});
        };
        $scope.isChecked = function(entities) {
            return TutorDetails.isChecked(entities);
        };
    }).

    controller('UserDetailsTutorStep2Ctrl', function ($rootScope, $scope, $state, $ionicHistory, TutorDetails) {
        $scope.selDegrees   = {};
        $scope.degrees      = TutorDetails.getDegrees();

        // If edit mode - mark chosen degrees as selected
        if ($rootScope.user.target_institutes) {
            Object.keys($rootScope.user.target_institutes).forEach(inst => {
                Object.keys($rootScope.user.target_institutes[inst]).forEach(degree => {
                    if ($rootScope.user.target_institutes[inst][degree].length) {
                        $scope.selDegrees[inst + '|||' + degree] = true;
                    }
                });
            });
        }

        $scope.submitTutorStep2 = function () {
            var courses = TutorDetails.getCoursesBySelectedDegrees($scope.selDegrees, $scope.degrees);
            TutorDetails.setPayloadDegrees($scope.selDegrees);
            TutorDetails.setCourses(courses);
            $state.go('userDetails_tutorStep3', {isEdit: $state.params.isEdit});
        };
        $scope.submitTutorStep2Last = function () {
            TutorDetails.setPayloadDegrees($scope.selDegrees, true);
            TutorDetails.saveSelectedData();
            $state.go('home');
            $ionicHistory.nextViewOptions({disableBack: true});
        };
        $scope.isChecked = function(entities) {
            return TutorDetails.isChecked(entities);
        };
    }).

    controller('UserDetailsTutorStep3Ctrl', function ($rootScope, $scope, $state, $ionicHistory, TutorDetails) {
        $scope.selCourses   = {};
        $scope.courses      = TutorDetails.getCourses();

        // If edit mode - mark chosen courses as selected
        if ($rootScope.user.target_institutes) {
            Object.keys($rootScope.user.target_institutes).forEach(inst => {
                Object.keys($rootScope.user.target_institutes[inst]).forEach(degree => {
                    $rootScope.user.target_institutes[inst][degree].forEach(course => {
                        $scope.selCourses[inst + '|||' + degree + '|||' + course] = true;
                    });
                });
            });
        }

        $scope.submitTutorStep3 = function () {
            TutorDetails.setPayloadCourses($scope.selCourses);
            TutorDetails.saveSelectedData();
            $state.go('home');
            $ionicHistory.nextViewOptions({disableBack: true});
        };
        $scope.isChecked = function(entities) {
            return TutorDetails.isChecked(entities);
        };
    })
;