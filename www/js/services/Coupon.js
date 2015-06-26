angular.module('afterclass.services')
    .factory('Coupon', function($rootScope, $firebaseArray, MyFirebase) {
        var obj = {}, ref = MyFirebase.getRefCoupons();
        var types = {SINGLE: 'single', MULTI: 'multi', PERSONAL: 'personal'};
        obj.createCoupon = function () {
            var coupons = $firebaseArray(ref);
            coupons.$add({
                id: window.device ? window.device.uuid.substr(0, 6) : 'created-via-web',
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
        obj.getCoupon = function (couponId) {
            var sync = ref.orderByChild('id').equalTo(couponId);
            var coupon = $firebaseArray(sync);
            return coupon.$loaded().then(function () {
                return coupon;
            });
        };
        obj.claimCoupon = function (couponId) {
            obj.getCoupon(couponId).then(function (coupon) {
                if (!coupon.is_valid) {
                    // and expiration_date
                    console.log('Coupon ' + couponId + ' is inactive!');
                }
                switch (coupon.type) {
                    case types.SINGLE:

                        break;
                    case types.MULTI:
                        // coupon.claimed_by
                        break;
                    case types.PERSONAL:
                        // creator_id? what for?
                        break;
                }
                console.log('promise', coupon);
                coupon[0].total_points = coupon[0].total_points - coupon[0].claim_points;
                coupon.$save(0);
            });
        };
        obj.getPointsLeft = function() {
            return 11;
        };
        return obj;
    })
;