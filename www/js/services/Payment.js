/**
 * Payments for teachers
 */
angular.module('afterclass.services')
    .factory('Payment', function($rootScope, $q, $firebaseArray, $firebaseObject, MyFirebase) {
        var obj = {}, ref = MyFirebase.getRef();

        obj.getPayments = function () {
            var payment = {},
                q = $q.defer(),
                prevPayments = $firebaseArray(ref.child('payments/' + $rootScope.user.uid));
            prevPayments.$loaded().then(function () {
                _.forEach(prevPayments, function (item) {
                    if (item.status === 'current') {
                        payment.balanceFbId = item.$id;
                        payment.balance = item.amount;
                    }
                });
                payment.previous = prevPayments;
                q.resolve(payment);
            });
            return q.promise;
        };

        obj.getPaymentsSum = function () {
            var q = $q.defer();
            obj.getPayments().then(function (payments) {
                var sum = 0;
                _.forEach(payments.previous, function (item) {
                    sum += parseFloat(item.amount);
                });
                q.resolve(sum);
            });
            return q.promise;
        };

        obj.withdraw = function (payment_id) {
            var q = $q.defer(),
                sync = ref.child('payments/' + $rootScope.user.uid + '/' + payment_id),
                payment = $firebaseObject(sync);
            payment.$loaded().then(function (payment) {
                payment.status = 'pending';
                payment.status_date = Math.floor(Date.now() / 1000);
                payment.$save(0);
                q.resolve();
            });
            return q.promise;
        };

        obj._debugCreatePayment = function () {
            var payments = $firebaseArray(ref.child('payments/' + $rootScope.user.uid));
            payments.$add({
                user_id: $rootScope.user.uid,
                amount: 981.12,
                status: 'paid',
                receipt_id: '$#%34gfd8gk',
                payment_hash: 'JdasASA^$^2@',
                status_date: Math.floor(Date.now() / 1000),
                create_date: Math.floor(Date.now() / 1000)
            }).then(function () {

            }, function (error) {

            });
        };

        return obj;
    })
;