angular.module('afterclass.controllers').

    controller('UserDetailsChooseTypeCtrl', ($scope, $state, $ionicHistory, $ionicPopup, $translate, User) => {
        $scope.student = () => {
            $ionicPopup.confirm({
                title: $translate.instant('USER_DETAILS.SELECTED_STUDENT'),
                template: $translate.instant('CORRECT_SELECTION'),
                cancelText: $translate.instant('CANCEL'),
                okText: $translate.instant('OK')
            }).then(res => {
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
        $scope.teacher = () => $state.go('userDetails_teacherStep1');
    }).

    controller('UserDetailsTeacherStep1Ctrl', ($rootScope, $scope, $state, $http, TeacherDetails, AppConfig) => {
        $scope.selInstitutes = {};

        // If edit mode - mark chosen institutes as selected
        if ($rootScope.user.target_institutes) {
            Object.keys($rootScope.user.target_institutes).forEach(inst => {
                if (Object.keys($rootScope.user.target_institutes[inst]).length) {
                    $scope.selInstitutes[inst] = true;
                }
            });
        }

        let populateScopeWithInstitutes = () => {
            AppConfig.loadConfig().then(() => {
                $scope.institutes = angular.copy(AppConfig.getConfig().gradesSubjects);
                $scope.updateAllSelectedBtn();
            });
        };
        $scope.$on('configUpdated', populateScopeWithInstitutes);
        populateScopeWithInstitutes();

        // Select All
        $scope.choice = {allSelected: false};
        $scope.$watch('selInstitutes', () => $scope.updateAllSelectedBtn(), true);
        $scope.selectAll = () => {
            Object.keys($scope.institutes).forEach(inst => $scope.selInstitutes[inst] = $scope.choice.allSelected);
        };
        $scope.updateAllSelectedBtn = () => {
            $scope.choice.allSelected = Object.keys($scope.institutes).length === _.filter($scope.selInstitutes).length;
        };

        $scope.submitTeacherStep1 = () => {
            let degrees = TeacherDetails.getDegreesBySelectedInstitutes($scope.selInstitutes, $scope.institutes);
            TeacherDetails.setPayloadInstitutes($scope.selInstitutes);
            TeacherDetails.setDegrees(degrees);
            $state.go('userDetails_teacherStep2', {isEdit: $state.params.isEdit});
        };

        $scope.canSubmit = () => _.filter($scope.selInstitutes).length > 0;
    }).

    controller('UserDetailsTeacherStep2Ctrl', ($rootScope, $scope, $state, $ionicHistory, TeacherDetails) => {
        $scope.selDegrees = {};
        $scope.degrees    = TeacherDetails.getDegrees();

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

        // Select All
        $scope.choice = {allSelected: false};
        $scope.$watch('selDegrees', () => {
            $scope.updateAllSelectedBtn();
        }, true);
        $scope.selectAll = () => {
            Object.keys($scope.degrees).forEach(grade => {
                $scope.degrees[grade].forEach(subject => {
                    $scope.selDegrees[grade + '|||' + subject.name] = $scope.choice.allSelected
                });
            });
        };
        $scope.updateAllSelectedBtn = () => {
            let count = 0;
            Object.keys($scope.degrees).forEach(item => count += $scope.degrees[item].length);
            $scope.choice.allSelected = count === _.filter($scope.selDegrees).length;
        };

        $scope.submitTeacherStep2 = () => {
            let courses = TeacherDetails.getCoursesBySelectedDegrees($scope.selDegrees, $scope.degrees);
            TeacherDetails.setPayloadDegrees($scope.selDegrees);
            TeacherDetails.setCourses(courses);
            $state.go('userDetails_teacherStep3', {isEdit: $state.params.isEdit});
        };
        $scope.submitTeacherStep2Last = () => {
            TeacherDetails.setPayloadDegrees($scope.selDegrees, true);
            TeacherDetails.saveSelectedData();
            $state.go('home');
            $ionicHistory.nextViewOptions({disableBack: true});
        };
        $scope.canSubmit = () => _.filter($scope.selDegrees).length > 0;
    }).

    controller('UserDetailsTeacherStep3Ctrl', ($rootScope, $scope, $state, $ionicHistory, TeacherDetails) => {
        $scope.selCourses = {};
        $scope.courses    = TeacherDetails.getCourses();

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

        $scope.submitTeacherStep3 = () => {
            TeacherDetails.setPayloadCourses($scope.selCourses);
            TeacherDetails.saveSelectedData();
            $state.go('home');
            $ionicHistory.nextViewOptions({disableBack: true});
        };
        $scope.isChecked = entities => TeacherDetails.isChecked(entities);
    });