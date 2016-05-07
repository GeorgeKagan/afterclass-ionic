angular.module('afterclass.controllers').

    controller('UserWizardChooseTypeCtrl', ($scope, $state, $ionicHistory, $ionicPopup, $translate, User) => {
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
                    target_institutes       : null // Should be "Classes"
                });
                $state.go('home');
                $ionicHistory.nextViewOptions({disableBack: true});
            });
        };
        $scope.teacher = () => $state.go('userWizard_teacherStep1');
    }).

    controller('UserWizardTeacherStep1Ctrl', ($rootScope, $scope, $state, TeacherWizard, AppConfig) => {
        $scope.classes    = {};
        $scope.selClasses = {};
        $scope.choice     = {isAllBtnSelected: false};

        AppConfig.loadConfig().then(() => {
            $scope.classes = angular.copy(AppConfig.getConfig().gradesSubjects);
            $scope.updateAllSelectedBtn();
        });
        TeacherWizard.ifEditSelectChosenClasses($scope.selClasses);
        $scope.$on('configUpdated', () => TeacherWizard.loadClassesList($scope.classes, $scope.selClasses, $scope.choice));

        // Select All
        $scope.$watch('selClasses',   () => $scope.updateAllSelectedBtn(), true);
        $scope.selectAll            = () => TeacherWizard.selectAllClasses($scope.classes, $scope.selClasses, $scope.choice.isAllBtnSelected);
        $scope.updateAllSelectedBtn = () => TeacherWizard.updateSelectAllBtnState($scope.classes, $scope.selClasses, $scope.choice);

        $scope.canSubmit = () => _.filter($scope.selClasses).length > 0;

        $scope.submitTeacherStep1 = () => {
            let subjects = TeacherWizard.getSubjectsBySelectedClasses($scope.selClasses, $scope.classes);
            TeacherWizard.setPayloadClasses($scope.selClasses);
            TeacherWizard.setSubjects(subjects);
            $state.go('userWizard_teacherStep2', {isEdit: $state.params.isEdit});
        };
    }).

    controller('UserWizardTeacherStep2Ctrl', ($rootScope, $scope, $state, $ionicHistory, TeacherWizard) => {
        $scope.selSubjects = {};
        $scope.subjects    = TeacherWizard.getSubjects();

        //todo: stopped here - refactor out to service...

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
        $scope.choice = {isAllBtnSelected: false};
        $scope.$watch('selSubjects', () => {
            $scope.updateAllSelectedBtn();
        }, true);
        $scope.selectAll = () => {
            Object.keys($scope.subjects).forEach(grade => {
                $scope.subjects[grade].forEach(subject => {
                    $scope.selSubjects[grade + '|||' + subject.name] = $scope.choice.isAllBtnSelected
                });
            });
        };
        $scope.updateAllSelectedBtn = () => {
            let count = 0;
            Object.keys($scope.subjects).forEach(item => count += $scope.subjects[item].length);
            $scope.choice.isAllBtnSelected = count === _.filter($scope.selSubjects).length;
        };

        $scope.submitTeacherStep2 = () => {
            TeacherWizard.setPayloadSubjects($scope.selSubjects);
            $state.go('userWizard_teacherStep3', {isEdit: $state.params.isEdit});
        };
        $scope.submitTeacherStep2Last = () => {
            TeacherWizard.setPayloadSubjects($scope.selSubjects, true);
            TeacherWizard.saveSelectedData();
            $state.go('home');
            $ionicHistory.nextViewOptions({disableBack: true});
        };
        $scope.canSubmit = () => _.filter($scope.selSubjects).length > 0;
    });