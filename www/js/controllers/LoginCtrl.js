angular.module('afterclass.controllers').controller('LoginCtrl', function ($scope, $rootScope, $state, $ionicLoading, $ionicHistory, UserCollection) {
    var ref = new Firebase("https://dazzling-heat-8303.firebaseio.com"),
        authData = ref.getAuth();
    if (authData) {
        $state.go('home');
        $ionicHistory.nextViewOptions({disableBack: true});
    }
    //
    $scope.login = function () {
        $ionicLoading.show({template: 'Loading...'});
        ref.authWithOAuthPopup("facebook", function (error, authData) {
            $ionicLoading.hide();
            if (error) {
                alert("Login failed: " + error);
            } else {
                UserCollection.saveToUsersCollection(authData);
                $state.go('home');
                $ionicHistory.nextViewOptions({disableBack: true});
            }
        });
    };
});