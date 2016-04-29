angular.module('afterclass.controllers').controller('ProfileCtrl', (
    $rootScope, $scope, $ionicTabsDelegate, $ionicPopup, $translate, $ionicLoading, $timeout, $log, MyFirebase, User, otherUser, AppConfig, Profile) => {

    // If viewing someone else and that someone is not the session user
    if (otherUser && $rootScope.user.id !== otherUser.id) {
        $scope.viewingSomeoneElse = true;
        $scope.user = otherUser;
        return;
    }

    $ionicTabsDelegate.select(0);

    // PROFILE

    if ($rootScope.user.is_teacher) {
        $scope.$watch('user.target_institutes', () => {
            $scope.targetGrades = [];
            _.map($rootScope.user.target_institutes, item => $scope.targetGrades = $scope.targetGrades.concat(Object.keys(item)));
            $scope.targetGrades = _.uniq($scope.targetGrades);
        });
    } else {

    }

    // CHANGE PASSWORD

    $scope.account           = {oldPassword: '', newPassword: ''};
    $scope.canChangePassword = () => $scope.account.oldPassword.trim() && $scope.account.newPassword.trim();
    $scope.changePassword    = () => Profile.changePassword($scope.account);

    // SETTINGS

    $scope.languages       = Profile.buildLangArr();
    $scope.settings        = {
        language: $rootScope.user.ui_lang ? $rootScope.user.ui_lang : $translate.use()
    };
    $scope.canSaveSettings = () => $scope.settings.language;
    $scope.saveSettings    = () => Profile.saveSettings($scope.settings);

    // Pre-fill form + init collection by user type
    if ($rootScope.user.is_teacher) {

    } else {
        $scope.$watch('user.institute', () => $scope.settings.grade = $rootScope.user.institute);
        $scope.$on('configUpdated', () => $scope.grades = Profile.buildGradesArr());
        $scope.grades = Profile.buildGradesArr();
    }
});