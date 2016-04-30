angular.module('afterclass.controllers').controller('EmailLoginCtrl', ($scope, Auth) => {
    'use strict';
    
    // Init model and default action (login)
    $scope.account = {firstName: '', lastName: '', email: '', password: '', passwordAgain: ''};
    $scope.show    = 'login';

    // Toggle between login and register
    $scope.showLogin    = () => $scope.show = 'login';
    $scope.showRegister = () => $scope.show = 'register';

    // Flags
    $scope.isPasswordsSame = () => $scope.account.password === $scope.account.passwordAgain;
    $scope.canLogin        = () => $scope.account.email && $scope.account.password;
    $scope.canRegister     = () => {
        return $scope.account.firstName && $scope.account.lastName &&
            $scope.account.email && $scope.account.password && $scope.account.passwordAgain && $scope.isPasswordsSame();
    };

    // Actions
    $scope.login          = () => Auth.loginWithEmail($scope.account);
    $scope.sendResetEmail = () => Auth.sendResetEmail($scope.account, $scope);
    $scope.register       = () => Auth.register($scope.account);
});