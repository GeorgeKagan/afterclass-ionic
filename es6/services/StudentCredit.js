angular.module('afterclass.services').factory('StudentCredit', ($rootScope, User) => {
    'use strict';

    let obj = {};

    obj.getCreditBalance = () => {
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

    obj.deductCredits = amount => User.updateUser({credits: $rootScope.user.credits - amount});

    return obj;
});