angular.module('afterclass.services').factory('User', ($rootScope, $q, $firebaseObject, $timeout, AmazonSNS, MyFirebase) => {
    'use strict';

    let ref             = MyFirebase.getRef(),
        INITIAL_CREDITS = 2,
        obj             = {};

    /**
     *
     * @param authData
     * @returns {*}
     */
    obj.saveToUsersCollection = authData => {
        let sync = ref.child('users/' + authData.uid),
            user = $firebaseObject(sync);

        return user.$loaded().then(() => {
            // New user added
            if (user.id) {
                return user;
            }
            let data = {}, customProperties = {
                // Add any initial custom properties here
                update_date: Firebase.ServerValue.TIMESTAMP,
                create_date: Firebase.ServerValue.TIMESTAMP,
                credits    : INITIAL_CREDITS
            };
            if (authData.facebook) {
                data = angular.element.extend(authData.facebook.cachedUserProfile, customProperties);
            } else {
                data = angular.element.extend({
                    first_name: authData.first_name,
                    last_name : authData.last_name,
                    name      : authData.first_name + ' ' + authData.last_name,
                    id        : authData.uid,
                    email     : authData.password.email,
                    picture   : {data: {url: authData.password.profileImageURL}},
                    token     : authData.token,
                    provider  : authData.provider
                }, customProperties);
            }
            user = angular.element.extend(user, data);

            return user.$save().then(() => user, error => console.log('Error saving user: ', error));
        });
    };

    /**
     *
     * @param data
     * @returns {*}
     */
    obj.updateUser = data => {
        let sync = ref.child('users/' + $rootScope.user.uid),
            user = $firebaseObject(sync);

        // Don't wait for async call
        $rootScope.user = angular.element.extend($rootScope.user, data);

        return user.$loaded().then(user => {
            data.update_date = Firebase.ServerValue.TIMESTAMP;
            user             = angular.element.extend(user, data);
            return user.$save(0);
        });
    };

    /**
     * Makes sure any mandatory fields, that previously failed to be set, are set
     * @param user
     * @param authData
     */
    obj.fillMandatoryFields = (user, authData) => {
        let isImpersonating = localStorage.getItem('isImpersonating') === 'true';
        if (isImpersonating) { return; }

        $timeout(() => {
            obj.updateUser({
                firebaseAuthToken: authData.token,
                last_used_device : window.device ? `${device.model} ${device.platform} ${device.version}` : 'device-plugin-not-found'
            });
        });

        if (window.cordova) {
            try {
                AmazonSNS.registerDevice().then(endpoint_arn => {
                    obj.updateUser({amazon_endpoint_arn: endpoint_arn});
                    console.log('Got Amazon SNS endpoint ARN: ', endpoint_arn);
                });
            } catch (e) {
                console.error('Fail Amazon SNS get endpoint ARN: ', e);
            }
        }
    };

    /**
     * Populate rootScope with user data from localStorage
     * @returns {Promise}
     */
    obj.getFromUsersCollection = () => {
        let q = $q.defer();

        if ($rootScope.user) {
            q.resolve($rootScope.user);
            return q.promise;
        }
        let authData = ref.getAuth(),
            sync     = ref.child('users/' + authData.uid),
            user     = $firebaseObject(sync);

        user.$loaded().then(() => {
            // Use up to date fb data, but merge in custom properties set via firebase
            $rootScope.user = angular.element.extend(authData, user);
            q.resolve($rootScope.user);
        });
        return q.promise;
    };

    /**
     * Get user by Firebase ID
     * @param firebaseUserId
     * @returns {Promise}
     */
    obj.getFromUsersCollectionById = (firebaseUserId = null) => {
        if (!firebaseUserId) { console.error('No firebase user id supplied'); }
        return $firebaseObject(ref.child('users/' + firebaseUserId)).$loaded();
    };

    /**
     * Delete a Firebase user
     */
    obj.deleteUser = () => {
        let sync = ref.child('users/' + $rootScope.user.uid),
            user = $firebaseObject(sync);

        AmazonSNS.deleteEndpoint($rootScope.user.amazon_endpoint_arn);
        user.$remove().then(ref => {}, error => console.log('Error: ', error));
    };

    return obj;
});