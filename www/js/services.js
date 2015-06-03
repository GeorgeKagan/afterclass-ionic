angular.module('afterclass.services', [])

    .factory('MyCamera', function($q, $window) {
        'use strict';
        return {
            getPicture: function(options) {
                var q = $q.defer();
                options = angular.element.extend({
                    quality: 80,
                    destinationType: Camera.DestinationType.FILE_URI,
                    mediaType: Camera.MediaType.PICTURE
                }, options);
                navigator.camera.getPicture(function(result) {
                    $window.resolveLocalFileSystemURL(result, function (fileEntry) {
                        fileEntry.file(function (fileObj) {
                            // On crosswalk engine, the url is bad, so let's fix it!
                            if (result.substring(0, 21) === 'content://com.android') {
                                var photo_split = result.split('%3A');
                                result = 'content://media/external/images/media/' + photo_split[1];
                            }
                            q.resolve({
                                imageURI: result,
                                is_image: angular.element.inArray(fileObj.type, ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']) > -1
                            });
                        });
                    });
                }, function(err) {
                    q.reject(err);
                }, options);
                return q.promise;
            }
        };
    })
    .factory('CloudinaryUpload', function($q, $ionicLoading, $cordovaFileTransfer, $window, $translate) {
        'use strict';
        var cloudinary_url = 'https://api.cloudinary.com/v1_1/daayssulc/image/upload',
            upload_preset = 'gpyif5y5',
            service = {};
        service.uploadImage = function (imageURI) {
            var deferred = $q.defer();
            var fileSize;
            var percentage;
            // Find out how big the original file is
            $window.resolveLocalFileSystemURL(imageURI, function (fileEntry) {
                fileEntry.file(function (fileObj) {
                    fileSize = fileObj.size;
                    $ionicLoading.show({template: $translate.instant('UPLOADS.PROGRESS') + 0 + '%'});
                    uploadFile();
                });
            });
            function uploadFile() {
                // Add the Cloudinary "upload preset" name to the headers
                var uploadOptions = {
                    params: {upload_preset: upload_preset}
                };
                $cordovaFileTransfer
                    .upload(cloudinary_url, imageURI, uploadOptions)
                    .then(function (result) {
                        $ionicLoading.show({template: $translate.instant('UPLOADS.COMPLETE'), duration: 1000});
                        // FYI: The result will also have URLs for any new images generated with eager transformations
                        var response = JSON.parse(decodeURIComponent(result.response));
                        deferred.resolve(response);
                    }, function (err) {
                        $ionicLoading.show({template: $translate.instant('UPLOADS.FAIL'), duration: 3000});
                        deferred.reject(err);
                    }, function (progress) {
                        percentage = Math.floor(progress.loaded / fileSize * 100);
                        $ionicLoading.show({template: $translate.instant('UPLOADS.PROGRESS') + percentage + '%'});
                    });
            }
            return deferred.promise;
        };
        return service;
    })
    .factory('UserCollection', function($rootScope, $q, $firebaseArray, AmazonSNS) {
        'use strict';
        var ref = new Firebase("https://dazzling-heat-8303.firebaseio.com");
        var obj = {
            saveToUsersCollection: function(authData) {
                var sync = ref.child('users').orderByChild('id').equalTo(authData.facebook.id),
                    user = $firebaseArray(sync),
                    q = $q.defer();
                user.$loaded().then(function() {
                    // New user added
                    if (!user.length) {
                        user.$add(angular.element.extend(authData.facebook.cachedUserProfile, {
                            // Add any initial custom properties here
                            name_lowercase: authData.facebook.cachedUserProfile.name.toLowerCase()
                        })).then(function() {
                            try {
                                AmazonSNS.registerDevice().then(function (endpoint_arn) {
                                    obj.updateUser({amazon_endpoint_arn: endpoint_arn});
                                });
                            } catch(e) {}
                            q.resolve(user[0]);
                        });
                    } else {
                        q.resolve(user[0]);
                    }
                });
                return q.promise;
            },
            updateUser: function(data) {
                var sync = ref.child('users').orderByChild('id').equalTo($rootScope.user.id),
                    user = $firebaseArray(sync);
                user.$loaded().then(function (user) {
                    user[0] = angular.element.extend(user[0], data);
                    user.$save(0);
                });
                // Don't wait for async call
                $rootScope.user = angular.element.extend($rootScope.user, data);
            },
            /**
             * Populate rootScope with user data from localStorage
             */
            getFromUsersCollection: function() {
                if ($rootScope.user) {
                    return $rootScope.user;
                }
                var authData = ref.getAuth(),
                    sync = ref.child('users').orderByChild('id').equalTo(authData.facebook.id),
                    user = $firebaseArray(sync),
                    q = $q.defer();
                user.$loaded().then(function() {
                    // Use up to date fb data, but merge in custom properties set via firebase
                    $rootScope.user = angular.element.extend(authData.facebook, user[0]);
                    q.resolve($rootScope.user);
                    //console.log('Merged User', $rootScope.user);
                });
                return q.promise;
            }
        };
        return obj;
    })
    .factory('Post', function($firebaseObject, $firebaseArray) {
        var obj = {
            delete: function(firebase_id) {
                var ref = new Firebase("https://dazzling-heat-8303.firebaseio.com/posts/" + firebase_id),
                    post = $firebaseObject(ref);
                post.$remove();
            },
            toggleAcceptance: function(firebase_id, user_id) {
                var ref = new Firebase("https://dazzling-heat-8303.firebaseio.com/posts/" + firebase_id),
                    post = $firebaseObject(ref),
                    potential_tutors = $firebaseArray(ref.child('potential_tutors'));

                potential_tutors.$loaded().then(function(potentialTutors){

                    var currentTutorIndex = _.findIndex(potentialTutors, {id:user_id});
                    if(currentTutorIndex > -1) {
                        if(typeof potential_tutors[currentTutorIndex].post_status !== 'undefined' && potential_tutors[currentTutorIndex].post_status === 'accepted') {
                            potential_tutors[currentTutorIndex].post_status = 'declined';
                        } else {
                            potential_tutors[currentTutorIndex].post_status = 'accepted';
                        }
                        potential_tutors.$save(currentTutorIndex); //Index of modified thing
                    } else {
                        console.log('Error: tutor ['+user_id+'] was not found is potential tutors array');
                    }

                });
            }
        };
        return obj;
    })
    .factory('InstitutePopup', function($rootScope, $http, $timeout, $ionicPopup, $translate, UserCollection) {
        'use strict';
        var showPopup = function() {
            var scope = $rootScope.$new();
            $http.get('json/institutes-degrees.json').success(function(data) {
                scope.hash = {selInstitute: 0, selDegree: 0};
                scope.institutes = data;
                scope.selectInstitute = function() {
                    var institute = angular.element('#popup-institute :selected').val();
                    scope.hash.selDegree = 0;
                    if (institute != 0 && institute !== 'Other') {
                        scope.degrees = _.uniq(data[institute], 'name');
                        scope.showDegrees = true;
                    } else if (institute === 'Other') {
                        var all_degrees = [];
                        angular.forEach(data, function(institute) {
                            angular.forEach(institute, function(degree) {
                                all_degrees.push(degree);
                            });
                        });
                        scope.degrees = _.uniq(all_degrees, 'name');
                        scope.showDegrees = true;
                    } else {
                        scope.showDegrees = false;
                    }
                };
                $timeout(function() {
                    $ionicPopup.show({
                        templateUrl: 'templates/partials/institute-popup.html',
                        scope: scope,
                        title: $translate.instant('SEL_INSTITUTE'),
                        buttons: [
                            {
                                text: '<span>' + $translate.instant('SAVE') + '</span>',
                                type: 'button-positive',
                                onTap: function (e) {
                                    var institute = angular.element('#popup-institute :selected').val(),
                                        degree = angular.element('#popup-degree :selected').val();
                                    if (institute !== '0' && degree !== '0') {
                                        UserCollection.updateUser({institute: institute, degree: degree});
                                    } else {
                                        angular.element('#pi-err').show();
                                        e.preventDefault();
                                    }
                                }
                            }
                        ]
                    });
                }, 500);
            }).
            error(function() {
                console.log('Failed to get institutes-degrees json');
            });
        };
        return {
            show: showPopup
        };
    })
    .factory('Institutes', function($q, $rootScope, $http) {
        var obj = {}, d = $q.defer();
        obj.getSubjectsByInstituteAndDegree = function (institute, degree) {
            $http.get('json/institutes-degrees.json').success(function(data) {
                var subjects = _.find(data[institute], {name: degree}).subjects;
                d.resolve(subjects);
            });
            return d.promise;
        };
        return obj;
    })
    /**
     * Push notifications
     */
    .factory('AmazonSNS', function($rootScope, $cordovaPush, $cordovaDialogs, $q) {
        'use strict';
        var sns = new AWS.SNS({
            region: 'us-west-2',
            accessKeyId: 'AKIAIEAG6S2HZVPZOAHQ',
            secretAccessKey: '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'
        });
        var obj = {
            registerDevice: function () {
                if (!window.cordova) {
                    console.warn('Cannot register with GCM. Must run on a real device!');
                    return;
                }
                var androidConfig = {
                    // Google project ID
                    senderID: "285670938797"
                }, q = $q.defer();
                $cordovaPush.register(androidConfig).then(function (result) { }, function (err) { });
                $rootScope.$on('$cordovaPush:notificationReceived', function (event, notification) {
                    switch (notification.event) {
                        case 'registered':
                            if (notification.regid.length > 0) {
                                console.log('registration ID = ' + notification.regid);
                                // CREATE ENDPOINT
                                var params = {
                                    PlatformApplicationArn: 'arn:aws:sns:us-west-2:912268630951:app/GCM/AfterClass',
                                    Token: notification.regid
                                };
                                sns.createPlatformEndpoint(params, function(err, data) {
                                    console.log('EndpointArn', data.EndpointArn);
                                    q.resolve(data.EndpointArn);
                                });
                            }
                            break;
                        case 'message':
                            // This is the actual push notification. Its format depends on the data model from the push server
                            console.log('message', notification);
                            $cordovaDialogs.alert(notification.message, 'Heads up!', 'Got it');
                            break;
                        case 'error':
                            console.log('GCM error = ' + notification.msg);
                            break;
                        default:
                            console.log('An unknown GCM event has occurred');
                            break;
                    }
                });
                return q.promise;
            },
            publish: function (endpoint_arn, msg) {
                // PUBLISH TO ENDPOINT
                var params = {
                    MessageStructure: 'json',
                    Message: JSON.stringify({
                        "default": msg,
                        "GCM": "{ \"data\": { \"message\": \"" + msg + "\" } }"
                    }),
                    TargetArn: endpoint_arn
                };
                sns.publish(params, function(err, data){
                    if (err) {
                        console.log('Error sending a message', err);
                    } else {
                        console.log('Sent message:', data);
                    }
                });
            }
        };
        return {
            registerDevice: obj.registerDevice,
            publish: obj.publish
        };
    })
;