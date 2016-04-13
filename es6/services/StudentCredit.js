angular.module('afterclass.services').factory('StudentCredit', ($rootScope, User) => {
    'use strict';

    let Credit = {};

    Credit.getCreditBalance = () => {
        if($rootScope.user) {
            if(typeof $rootScope.user.credits !== 'undefined') {
                return $rootScope.user.credits;
            } else { //No credits means unlimited
                return 'unlimited';
            }
        } else {
            return 0;
        }
    };

    Credit.deductCredits = amount => User.updateUser({credits: $rootScope.user.credits - amount});

    return Credit;
});