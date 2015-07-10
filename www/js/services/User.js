angular.module('afterclass.services')
    .factory('User', function ($rootScope, $q, $firebaseObject, AmazonSNS, MyFirebase) {
        'use strict';
        var ref = MyFirebase.getRef();
        var obj = {
            saveToUsersCollection: function (authData) {
                var sync = ref.child('users/' + authData.uid),
                    user = $firebaseObject(sync),
                    q = $q.defer();
                user.$loaded().then(function () {
                    // New user added
                    if (!user.length) {
                        var data = angular.element.extend(authData.facebook.cachedUserProfile, {
                            // Add any initial custom properties here
                            //uid: authData.uid,
                            update_date: moment().utc().unix(),
                            create_date: moment().utc().unix(),
                            name_lowercase: authData.facebook.cachedUserProfile.name.toLowerCase() //TODO: Remove this when new dashboard is ready
                        });
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
                user.$loaded().then(function (user) {
                    data.update_date = moment().utc().unix();
                    user = angular.element.extend(user, data);
                    user.$save(0);
                });
                // Don't wait for async call
                $rootScope.user = angular.element.extend($rootScope.user, data);
            },
            /**
             * Makes sure any mandatory fields, that previously failed to be set, are set
             * @param user
             */
            fillMandatoryFields: function (user) {
                if (!user.amazon_endpoint_arn) {
                    try {
                        AmazonSNS.registerDevice().then(function (endpoint_arn) {
                            obj.updateUser({amazon_endpoint_arn: endpoint_arn});
                        });
                    } catch (e) {
                    }
                }
            },
            /**
             * Populate rootScope with user data from localStorage
             */
            getFromUsersCollection: function () {
                if ($rootScope.user) {
                    return $rootScope.user;
                }
                var authData = ref.getAuth(),
                    sync = ref.child('users/' + authData.uid),
                    user = $firebaseObject(sync),
                    q = $q.defer();
                user.$loaded().then(function () {
                    // Use up to date fb data, but merge in custom properties set via firebase
                    $rootScope.user = angular.element.extend(authData, user);
                    q.resolve($rootScope.user);
                });
                return q.promise;
            }
        };
        return obj;
    });