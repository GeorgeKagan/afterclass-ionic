angular.module('afterclass.controllers').controller('ImpersonateCtrl', ($rootScope, $scope, $state, $firebaseArray, $firebaseObject, MyFirebase) => {

    let ref = MyFirebase.getRef().child('users');

    $firebaseArray(ref).$loaded().then(data => {
        $scope.users = data;
    });

    $scope.doImpersonation = user => {
        if (!user.firebase_auth_token) {
            return alert('User has no user.firebase_auth_token. They need to login at least once.');
        }
        let ref = MyFirebase.getRef();

        ref.authWithCustomToken(user.firebase_auth_token, error => {
            if (error) {
                console.log("Authentication Failed!", error);
            } else {
                localStorage.setItem('isImpersonating', true);
                window.location.reload(true);
            }
        });
    };
});