/**
 * Push notifications
 */
angular.module('afterclass.services').factory('AmazonSNS', ($rootScope, $cordovaPush, $q, $log) => {
    'use strict';

    let sns = new AWS.SNS({
        region         : 'us-west-2',
        accessKeyId    : 'AKIAIWZPMXE5FSUW7N6A',
        secretAccessKey: '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'
    });

    let Amazon = {};

    /**
     *
     * @returns {Promise}
     */
    Amazon.registerDevice = () => {
        if (!window.cordova) {
            return $log.warn('Cannot register with GCM. Must run on a real device!');
        }
        let q = $q.defer();

        if (ionic.Platform.isIOS()) {
            let iosConfig = {
                badge: true,
                sound: true,
                alert: true
            };
            $cordovaPush.register(iosConfig).then(deviceToken => {
                // Success -- send deviceToken to server, and store for future use
                $log.log('deviceToken: ' + deviceToken);
                //$http.post('http://server.co/', {user: 'Bob', tokenID: deviceToken})
                let params = {
                    //PlatformApplicationArn: 'arn:aws:sns:us-west-2:859437719678:app/APNS_SANDBOX/afterclass_dev',
                    PlatformApplicationArn: 'arn:aws:sns:us-west-2:859437719678:app/APNS/ios-production',
                    Token                 : deviceToken
                };
                sns.createPlatformEndpoint(params, (err, data) => {
                    $log.log('got amazon APNS ' + data + ',' + err);
                    q.resolve(data.EndpointArn);
                });
            }, err => $log.log('can\'t get APNS ' + err));
        }
        else if (ionic.Platform.isAndroid()) {
            let androidConfig = {
                // Google project ID
                senderID: '580333274108'
            };
            $cordovaPush.register(androidConfig).then(result => {}, err => {});
        }

        $rootScope.$on('$cordovaPush:notificationReceived', (event, notification) => {
            switch(notification.event) {
                case 'registered':
                    if (notification.regid.length > 0) {
                        $log.log('registration ID = ' + notification.regid);
                        // CREATE ENDPOINT
                        let params = {
                            PlatformApplicationArn: 'arn:aws:sns:us-west-2:859437719678:app/GCM/afterclass-android',
                            Token                 : notification.regid
                        };
                        sns.createPlatformEndpoint(params, (err, data) => {
                            $log.log('EndpointArn', data.EndpointArn);
                            q.resolve(data.EndpointArn);
                        });
                    }
                    break;
                case 'message':
                    // This is the actual push notification. Its format depends on the data model from the push server
                    $log.log('message', notification);
                    break;
                case 'error':
                    $log.log('GCM error = ' + notification.msg);
                    break;
                default:
                    $log.log('An unknown GCM event has occurred');
                    break;
            }
        });
        return q.promise;
    };

    /**
     *
     * @param endpoint_arn
     * @param msg
     */
    Amazon.publish = (endpoint_arn, msg) => {
        // PUBLISH TO ENDPOINT
        let params = {
            MessageStructure: 'json',
            Message         : JSON.stringify({
                'default'   : msg,
                'GCM'       : "{ \"data\": { \"message\": \"" + msg + "\" } }"
            }),
            TargetArn       : endpoint_arn
        };
        sns.publish(params, (err, data) => {
            if (err) {
                $log.log('Error sending a message', err);
                $log.log('endpoint_arn', endpoint_arn);
            } else {
                $log.log('Sent message:', data);
            }
        });
    };

    Amazon.deleteEndpoint = endpoint => sns.deleteEndpoint({EndpointArn: endpoint});

    return Amazon;
});