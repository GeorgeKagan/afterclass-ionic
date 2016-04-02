angular.module('afterclass.services').factory('User', function ($rootScope, $q, $firebaseObject, $timeout, AmazonSNS, MyFirebase, Utils) {
    'use strict';

    var ref = MyFirebase.getRef();
    var INITIAL_CREDITS = 2;

    var obj = {
        saveToUsersCollection: function (authData) {
            var sync    = ref.child('users/' + authData.uid),
                user    = $firebaseObject(sync),
                q       = $q.defer();
            user.$loaded().then(function () {
                // New user added
                if (!user.id) {
                    var data = {}, customProperties = {
                        // Add any initial custom properties here
                        //uid: authData.uid,
                        update_date : Firebase.ServerValue.TIMESTAMP,
                        create_date : Firebase.ServerValue.TIMESTAMP,
                        credits     : INITIAL_CREDITS
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
                            provider  : authData.provider,
                        }, customProperties);
                    }
                    user = angular.element.extend(user, data);
                    user.$save().then(function () {
                        q.resolve(user);
                    }, function (error) {
                        q.resolve(null);
                        console.log("Error saving user:", error);
                    });
                } else {
                    q.resolve(user);
                }
            });
            return q.promise;
        },
        updateUser: function (data) {
            var sync = ref.child('users/' + $rootScope.user.uid),
                user = $firebaseObject(sync);

            // Don't wait for async call
            $rootScope.user = angular.element.extend($rootScope.user, data);

            return user.$loaded().then(function (user) {
                data.update_date    = Firebase.ServerValue.TIMESTAMP;
                user                = angular.element.extend(user, data);
                return user.$save(0);
            });
        },
        /**
         * Makes sure any mandatory fields, that previously failed to be set, are set
         * @param user
         * @param authData
         */
        fillMandatoryFields: function (user, authData) {
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
                    AmazonSNS.registerDevice().then(function (endpoint_arn) {
                        obj.updateUser({amazon_endpoint_arn: endpoint_arn});
                        console.log('Got Amazon SNS endpoint ARN: ', endpoint_arn);
                    });
                } catch (e) {
                    console.error('Fail Amazon SNS get endpoint ARN: ', e);
                }
            }
        },
        /**
         * Populate rootScope with user data from localStorage
         * @returns {Promise}
         */
        getFromUsersCollection: function () {
            var q = $q.defer();
            if ($rootScope.user) {
                q.resolve($rootScope.user);
                return q.promise;
            }
            var authData = ref.getAuth(),
                sync     = ref.child('users/' + authData.uid),
                user     = $firebaseObject(sync);
            user.$loaded().then(function () {
                // Use up to date fb data, but merge in custom properties set via firebase
                $rootScope.user = angular.element.extend(authData, user);
                q.resolve($rootScope.user);
            });
            return q.promise;
        },
        /**
         * Get user by Firebase ID
         * @param firebaseUserId
         * @returns {Promise}
         */
        getFromUsersCollectionById: function (firebaseUserId = null) {
            if (!firebaseUserId) { console.error('No firebase user id supplied'); }
            return $firebaseObject(ref.child('users/' + firebaseUserId)).$loaded();
        },
        /**
         * Delete a Firebase user
         */
        deleteUser: function () {
            var sync = ref.child('users/' + $rootScope.user.uid),
                user = $firebaseObject(sync);
            AmazonSNS.deleteEndpoint($rootScope.user.amazon_endpoint_arn);
            user.$remove().then(function (ref) {
                // data has been deleted locally and in the database
            }, function (error) {
                console.log("Error:", error);
            });
        }
    };

    return obj;
});