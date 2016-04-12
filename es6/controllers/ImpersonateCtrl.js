angular.module('afterclass.controllers').controller('ImpersonateCtrl', ($rootScope, $scope, $state, $firebaseArray, $firebaseObject, $log, MyFirebase) => {

    let ref = MyFirebase.getRef().child('users');

    $firebaseArray(ref).$loaded().then(data => $scope.users = data);

    $scope.doImpersonation = user => {
        if (!user.firebaseAuthToken) {
            return alert('User has no user.firebaseAuthToken. They need to login at least once.');
        }
        let ref = MyFirebase.getRef();

        ref.authWithCustomToken(user.firebaseAuthToken, error => {
            if (error) {
                $log.log("Authentication Failed!", error);
            } else {
                localStorage.setItem('isImpersonating', true);
                window.location.reload(true);
            }
        });
    };
});