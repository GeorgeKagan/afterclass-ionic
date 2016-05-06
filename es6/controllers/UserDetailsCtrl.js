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
        $scope.selClasses = {};

        // If edit mode - mark chosen classes as selected
        if ($rootScope.user.target_institutes) {
            Object.keys($rootScope.user.target_institutes).forEach(inst => {
                if (Object.keys($rootScope.user.target_institutes[inst]).length) {
                    $scope.selClasses[inst] = true;
                }
            });
        }

        let populateScopeWithClasses = () => {
            AppConfig.loadConfig().then(() => {
                $scope.classes = angular.copy(AppConfig.getConfig().gradesSubjects);
                $scope.updateAllSelectedBtn();
            });
        };
        $scope.$on('configUpdated', populateScopeWithClasses);
        populateScopeWithClasses();

        // Select All
        $scope.choice = {allSelected: false};
        $scope.$watch('selClasses', () => $scope.updateAllSelectedBtn(), true);
        $scope.selectAll = () => {
            Object.keys($scope.classes).forEach(inst => $scope.selClasses[inst] = $scope.choice.allSelected);
        };
        $scope.updateAllSelectedBtn = () => {
            $scope.choice.allSelected = Object.keys($scope.classes).length === _.filter($scope.selClasses).length;
        };

        $scope.submitTeacherStep1 = () => {
            let subjects = TeacherDetails.getSubjectsBySelectedClasses($scope.selClasses, $scope.classes);
            TeacherDetails.setPayloadClasses($scope.selClasses);
            TeacherDetails.setSubjects(subjects);
            $state.go('userDetails_teacherStep2', {isEdit: $state.params.isEdit});
        };

        $scope.canSubmit = () => _.filter($scope.selClasses).length > 0;
    }).

    controller('UserDetailsTeacherStep2Ctrl', ($rootScope, $scope, $state, $ionicHistory, TeacherDetails) => {
        $scope.selSubjects = {};
        $scope.subjects    = TeacherDetails.getSubjects();

        // If edit mode - mark chosen subjects as selected
        if ($rootScope.user.target_institutes) {
            Object.keys($rootScope.user.target_institutes).forEach(inst => {
                Object.keys($rootScope.user.target_institutes[inst]).forEach(subject => {
                    if ($rootScope.user.target_institutes[inst][subject].length) {
                        $scope.selSubjects[inst + '|||' + subject] = true;
                    }
                });
            });
        }

        // Select All
        $scope.choice = {allSelected: false};
        $scope.$watch('selSubjects', () => {
            $scope.updateAllSelectedBtn();
        }, true);
        $scope.selectAll = () => {
            Object.keys($scope.subjects).forEach(grade => {
                $scope.subjects[grade].forEach(subject => {
                    $scope.selSubjects[grade + '|||' + subject.name] = $scope.choice.allSelected
                });
            });
        };
        $scope.updateAllSelectedBtn = () => {
            let count = 0;
            Object.keys($scope.subjects).forEach(item => count += $scope.subjects[item].length);
            $scope.choice.allSelected = count === _.filter($scope.selSubjects).length;
        };

        $scope.submitTeacherStep2 = () => {
            let courses = TeacherDetails.getCoursesBySelectedSubjects($scope.selSubjects, $scope.subjects);
            TeacherDetails.setPayloadSubjects($scope.selSubjects);
            TeacherDetails.setCourses(courses);
            $state.go('userDetails_teacherStep3', {isEdit: $state.params.isEdit});
        };
        $scope.submitTeacherStep2Last = () => {
            TeacherDetails.setPayloadSubjects($scope.selSubjects, true);
            TeacherDetails.saveSelectedData();
            $state.go('home');
            $ionicHistory.nextViewOptions({disableBack: true});
        };
        $scope.canSubmit = () => _.filter($scope.selSubjects).length > 0;
    });