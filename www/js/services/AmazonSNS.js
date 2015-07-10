/**
 * Push notifications
 */
angular.module('afterclass.services')
    .factory('AmazonSNS', function ($rootScope, $cordovaPush, $ionicPopup, $translate, $q) {
        'use strict';
        var sns = new AWS.SNS({
            region: 'us-west-2',
            accessKeyId: 'AKIAIWZPMXE5FSUW7N6A',
            secretAccessKey: '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'
        });

        var obj = {
            registerDevice: function () {
                if (!window.cordova) {
                    console.warn('Cannot register with GCM. Must run on a real device!');
                    return;
                }
                var q = $q.defer();
                if (ionic.Platform.isIOS()) {
                    var iosConfig = {
                        "badge": true,
                        "sound": true,
                        "alert": true
                    };

                    $cordovaPush.register(iosConfig).then(function (deviceToken) {
                        // Success -- send deviceToken to server, and store for future use
                        console.log("deviceToken: " + deviceToken);
                        //$http.post("http://server.co/", {user: "Bob", tokenID: deviceToken})
                        var params = {
                            PlatformApplicationArn: 'arn:aws:sns:us-west-2:859437719678:app/APNS_SANDBOX/afterclass_dev',
                            Token: deviceToken
                        };
                        sns.createPlatformEndpoint(params, function (err, data) {
                            console.log("got amazon apns " + data + "," + err);
                            q.resolve(data.EndpointArn);
                        });
                    }, function (err) {
                        console.log("can't get apns " + err);
                        //alert("Registration error: " + err)
                    });

                } else if (ionic.Platform.isAndroid()) {
                    var androidConfig = {
                        // Google project ID
                        senderID: "580333274108"
                    };
                    $cordovaPush.register(androidConfig).then(function (result) {

                    }, function (err) {

                    });
                }

                $rootScope.$on('$cordovaPush:notificationReceived', function (event, notification) {
                    switch (notification.event) {
                        case 'registered':
                            if (notification.regid.length > 0) {
                                console.log('registration ID = ' + notification.regid);
                                // CREATE ENDPOINT
                                var params = {
                                    PlatformApplicationArn: 'arn:aws:sns:us-west-2:859437719678:app/GCM/afterclass-android',
                                    Token: notification.regid
                                };
                                sns.createPlatformEndpoint(params, function (err, data) {
                                    console.log('EndpointArn', data.EndpointArn);
                                    q.resolve(data.EndpointArn);
                                });
                            }
                            break;
                        case 'message':
                            // This is the actual push notification. Its format depends on the data model from the push server
                            console.log('message', notification);
                            $ionicPopup.alert({
                                title: '',
                                template: notification.message
                            });
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
                sns.publish(params, function (err, data) {
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
    });