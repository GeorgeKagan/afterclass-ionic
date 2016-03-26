angular.module('afterclass.controllers').controller('ContactCtrl', function ($rootScope, $scope, $timeout, $ionicLoading, $ionicPopup, $translate, $cordovaNetwork, AppConfig) {

    $scope.config = AppConfig.getConfig().contact;

});