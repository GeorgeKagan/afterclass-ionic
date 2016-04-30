angular.module('afterclass.controllers').controller('FacebookLoginCtrl', ($scope, $state, $ionicHistory, Auth) => {
    'use strict';

    if (!localStorage.getItem('finished_on_boarding') && angular.element.inArray('browser', ionic.Platform.platforms) === -1) {
        $ionicHistory.nextViewOptions({disableBack: true});
        $state.go('onBoarding').then(() => navigator.splashscreen && navigator.splashscreen.hide());
        return;
    }

    // Check if got active session
    Auth.autoLoginIfGotSession();

    $scope.loginWithFacebook  = () => Auth.loginWithFacebook();
    $scope.goToLoginWithEmail = () => $state.go('registerOrLogin');
});