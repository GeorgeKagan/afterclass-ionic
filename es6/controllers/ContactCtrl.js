angular.module('afterclass.controllers').controller('ContactCtrl', ($scope, AppConfig, Social) => {
    $scope.config = AppConfig.getConfig().contact;

    $scope.openFacebookApp = () => Social.openFacebookAppPage();
});