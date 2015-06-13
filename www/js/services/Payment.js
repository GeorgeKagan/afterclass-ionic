angular.module('afterclass.services')
    .factory('Payment', function($rootScope, $q, $firebaseArray, $firebaseObject, MyFirebase) {
        var obj = {}, ref = MyFirebase.getRef();

        obj.getPayments = function () {
            var payment = {},
                q = $q.defer(),
                prevPayments = $firebaseArray(ref.child('payments').orderByChild('user_id').equalTo($rootScope.user.uid));
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
                sync = ref.child('payments/' + payment_id),
                payment = $firebaseObject(sync);
            payment.$loaded().then(function (payment) {
                payment.status = 'pending';
                payment.status_date = Math.round(Date.now() / 1000);
                payment.$save(0);
                q.resolve();
            });
            return q.promise;
        };

        obj._debugCreatePayment = function () {
            var payments = $firebaseArray(ref.child('payments'));
            payments.$add({
                user_id: $rootScope.user.uid,
                amount: 997,
                status: 'current',
                receipt_id: '$#%asdrsadg4',
                payment_hash: 'JGFfdsfjoofsaQ22@',
                status_date: Math.round(Date.now() / 1000),
                create_date: Math.round(Date.now() / 1000)
            }).then(function () {

            }, function (error) {

            });
        };

        return obj;
    })
;