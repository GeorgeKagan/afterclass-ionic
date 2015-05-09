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
    .factory('CloudinaryUpload', function($q, $ionicLoading, $cordovaFileTransfer, $window) {
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
                    $ionicLoading.show({template: 'Uploading... ' + 0 + '%'});
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
                        $ionicLoading.show({template: 'Upload Completed', duration: 1000});
                        // FYI: The result will also have URLs for any new images generated with eager transformations
                        var response = JSON.parse(decodeURIComponent(result.response));
                        deferred.resolve(response);
                    }, function (err) {
                        $ionicLoading.show({template: 'Upload Failed', duration: 3000});
                        deferred.reject(err);
                    }, function (progress) {
                        percentage = Math.floor(progress.loaded / fileSize * 100);
                        $ionicLoading.show({template: 'Uploading... ' + percentage + '%'});
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
                    user = $firebaseArray(sync);
                user.$loaded().then(function() {
                    if (!user.length) {
                        user.$add(angular.element.extend(authData.facebook.cachedUserProfile, {
                            is_teacher: false
                        })).then(function() {
                            AmazonSNS.registerDevice().then(function(endpoint_arn) {
                                obj.updateUser({amazon_endpoint_arn: endpoint_arn});
                            });
                        });
                    }
                });
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
    .factory('Post', function($firebaseObject) {
        var obj = {
            delete: function(firebase_id) {
                var ref = new Firebase("https://dazzling-heat-8303.firebaseio.com/posts/" + firebase_id),
                    post = $firebaseObject(ref);
                post.$remove();
            }
        };
        return obj;
    })
    .factory('InstitutePopup', function($timeout, $ionicPopup, UserCollection) {
        'use strict';
        var showPopup = function() {
            $timeout(function() {
                $ionicPopup.show({
                    template: '<select id="popup-institute"><option value="0">Choose...</option><option value="IDC">IDC</option>' +
                    '<option value="COMAS">COMAS</option><option value="TAU">TAU</option><option value="Other">Other</option></select>' +
                    '<span id="pi-err" style="color:red;display:none">Please choose one!</span>',
                    title: 'Please select your institute',
                    buttons: [
                        {
                            text: '<span>Save</span>',
                            type: 'button-positive',
                            onTap: function (e) {
                                var institute = angular.element('#popup-institute :selected').val();
                                if (institute !== '0') {
                                    UserCollection.updateUser({institute: institute});
                                } else {
                                    angular.element('#pi-err').show();
                                    e.preventDefault();
                                }
                            }
                        }
                    ]
                });
            }, 4000);
        };
        return {
            show: showPopup
        };
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