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

        let populateScopeWithClasses = () => {
            AppConfig.loadConfig().then(() => {
                $scope.classes = angular.copy(AppConfig.getConfig().gradesSubjects);
                $scope.updateAllSelectedBtn();
            });
        };
        $scope.$on('configUpdated', populateScopeWithClasses);
        populateScopeWithClasses();

        TeacherWizard.ifEditSelectChosenClasses($scope.selClasses);

        // Select All
        $scope.$watch('selClasses',   () => $scope.updateAllSelectedBtn(), true);
        $scope.selectAll            = () => TeacherWizard.selectAllClasses($scope.classes, $scope.selClasses, $scope.choice.isAllBtnSelected);
        $scope.updateAllSelectedBtn = () => TeacherWizard.updateSelectAllClassesBtnState($scope.classes, $scope.selClasses, $scope.choice);
        $scope.canSubmit            = () => _.filter($scope.selClasses).length > 0;

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
        $scope.choice      = {isAllBtnSelected: false};

        TeacherWizard.ifEditSelectChosenSubjects($scope.selSubjects);

        // Select All
        $scope.$watch('selSubjects',  () => $scope.updateAllSelectedBtn(), true);
        $scope.selectAll            = () => TeacherWizard.selectAllSubjects($scope.subjects, $scope.selSubjects, $scope.choice.isAllBtnSelected);
        $scope.updateAllSelectedBtn = () => TeacherWizard.updateSelectAllSubjectsBtnState($scope.subjects, $scope.selSubjects, $scope.choice);
        $scope.canSubmit            = () => _.filter($scope.selSubjects).length > 0;

        $scope.submitTeacherStep2Last = () => {
            TeacherWizard.setPayloadSubjects($scope.selSubjects, true);
            TeacherWizard.saveSelectedData();
            $state.go('home');
            $ionicHistory.nextViewOptions({disableBack: true});
        };
    });