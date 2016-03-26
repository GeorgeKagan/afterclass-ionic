angular.module('afterclass.controllers').controller('ContactCtrl', function ($rootScope, $scope, $timeout, $ionicLoading, $ionicPopup, $translate, $cordovaNetwork, AppConfig) {

    console.log( AppConfig.getConfig().contact)
    $scope.config = AppConfig.getConfig().contact;

});