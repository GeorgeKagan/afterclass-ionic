angular.module('afterclass.services').factory('Coupon', function($rootScope, $firebaseArray, MyFirebase, User) {
    'use strict';

    var obj = {};

    obj.getPointsLeft = function() {
        return $rootScope.user.credits;
    };

    obj.deductCredits = function(amount) {
        User.updateUser({
            credits: $rootScope.user.credits - amount
        });
    };

    return obj;
});