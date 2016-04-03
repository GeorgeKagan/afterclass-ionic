/**
 * Payments for teachers
 */
angular.module('afterclass.services').factory('Payment', ($rootScope, $firebaseArray, $firebaseObject, MyFirebase) => {
    let obj = {},
        ref = MyFirebase.getRef();

    /**
     *
     * @returns {*}
     */
    obj.getPayments = () => {
        let payment      = {},
            prevPayments = $firebaseArray(ref.child('payments/' + $rootScope.user.uid));

        return prevPayments.$loaded().then(() => {
            _.forEach(prevPayments, item => {
                if (item.status === 'current') {
                    payment.balanceFbId = item.$id;
                    payment.balance     = item.amount;
                }
            });
            payment.previous = prevPayments;
            return payment;
        });
    };

    /**
     *
     * @returns Promise
     */
    obj.getPaymentsSum = () => {
        return obj.getPayments().then(payments => {
            let sum = 0;
            _.forEach(payments.previous, item => sum += parseFloat(item.amount));
            return sum;
        });
    };

    /**
     *
     * @param payment_id
     * @returns {*}
     */
    obj.withdraw = payment_id => {
        let sync    = ref.child('payments/' + $rootScope.user.uid + '/' + payment_id),
            payment = $firebaseObject(sync);

        return payment.$loaded().then(payment => {
            payment.status      = 'pending';
            payment.status_date = Math.floor(Date.now() / 1000);
            payment.$save(0);
        });
    };

    /**
     *
     * @private
     */
    obj._debugCreatePayment = () => {
        let payments = $firebaseArray(ref.child('payments/' + $rootScope.user.uid));

        payments.$add({
            user_id     : $rootScope.user.uid,
            amount      : 981.12,
            status      : 'paid',
            receipt_id  : '$#%34gfd8gk',
            payment_hash: 'JdasASA^$^2@',
            status_date : Firebase.ServerValue.TIMESTAMP,
            create_date : Firebase.ServerValue.TIMESTAMP
        }).then(() => {}, error => {});
    };

    return obj;
});