angular.module('afterclass.services').factory('StudentCredit', ($rootScope, User) => {
    'use strict';

    let obj = {};

    obj.getCreditBalance = () => $rootScope.user ? $rootScope.user.credits : 0;

    obj.deductCredits = amount => User.updateUser({credits: $rootScope.user.credits - amount});

    return obj;
});