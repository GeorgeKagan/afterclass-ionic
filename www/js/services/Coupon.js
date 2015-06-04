angular.module('afterclass.services')
    .factory('Coupon', function($rootScope, $firebaseArray, MyFirebase) {
        var obj = {}, ref = MyFirebase.getRefCoupons();
        var types = {SINGLE: 'single', MULTI: 'multi', PERSONAL: 'personal'};
        obj.createCoupon = function () {
            var coupons = $firebaseArray(ref);
            coupons.$add({
                id: 'guid-first-octet',
                type: types.SINGLE,
                creator_id: $rootScope.user.id,
                total_points: 100,
                claim_points: 10,
                claimed_by: [0],
                campaign_name: 'my awesome coupon',
                title: 'my coupon title',
                description: 'my coupon description',
                is_valid: true,
                expiration_date: '01/07/2015'
            }).then(function () {

            }, function (error) {
                console.log("Error creating coupon:", error);
            });
        };
        obj.claimCoupon = function () {

        };
        obj.getPointsLeft = function() {
            return 11;
        };
        return obj;
    })
;