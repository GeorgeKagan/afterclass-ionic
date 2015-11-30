angular.module('afterclass.controllers').controller('CouponCtrl', function ($scope, Coupon) {
    'use strict';
    $scope.coupon = {};
    $scope.claimCoupon = function () {
        console.log('coupon id', $scope.coupon.id);
        Coupon.claimCoupon($scope.coupon.id);
    };
});