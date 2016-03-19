angular.module('afterclass.controllers').controller('ProfileCtrl', ($rootScope, $scope, $ionicTabsDelegate, $ionicPopup, $translate, $ionicLoading, MyFirebase) => {

    var ref = MyFirebase.getRef();

    $ionicTabsDelegate.select(0);

    $scope.account = {oldPassword: '', newPassword: ''};

    $scope.canChangePassword = () => $scope.account.oldPassword.trim() && $scope.account.newPassword.trim();

    $scope.changePassword = () => {
        $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
        ref.changePassword({
            email      : $rootScope.user.email,
            oldPassword: $scope.account.oldPassword,
            newPassword: $scope.account.newPassword
        }, function(error) {
            if (error === null) {
                $scope.account.oldPassword = '';
                $scope.account.newPassword = '';
                $ionicPopup.alert({
                    title   : 'הצלחה',
                    template: 'הסיסמה שונתה בהצלחה',
                    okText  : $translate.instant('OK')
                });
                console.log("Password changed successfully");
            } else {
                $ionicPopup.alert({
                    title   : 'שגיאה',
                    template: 'הסיסמה הישנה שהקשת אינה נכונה',
                    okText  : $translate.instant('OK')
                });
                console.log("Error changing password:", error);
            }
            $ionicLoading.hide();
        });
    };
});