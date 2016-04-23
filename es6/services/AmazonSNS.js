/**
 * Push notifications
 */
angular.module('afterclass.services').factory('AmazonSNS', ($rootScope, $cordovaPush, $q, $log, $ionicPopup, $translate) => {
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

        let push = PushNotification.init({
            android: {
                senderID: '580333274108',
                icon: 'outline'
            },
            ios: {
                icon: 'outline'
            }
        });

        push.on('registration', function(notification) {
            if (notification.registrationId.length > 0) {
                $log.log('registration ID = ' + notification.registrationId);
                // CREATE ENDPOINT
                let params = {
                    PlatformApplicationArn: ionic.Platform.isIOS()
                        ? 'arn:aws:sns:us-west-2:859437719678:app/APNS/ios-production'
                        : 'arn:aws:sns:us-west-2:859437719678:app/GCM/afterclass-android',
                    Token                 : notification.registrationId
                };
                sns.createPlatformEndpoint(params, (err, data) => {
                    $log.log('EndpointArn', data.EndpointArn);
                    q.resolve(data.EndpointArn);
                });
            }
        });

        push.on('notification', function(data) {
            // data.message,
            // data.title,
            // data.count,
            // data.sound,
            // data.image,
            // data.additionalData
            //This is the actual push notification. Its format depends on the data model from the push server
            $log.log('message', data);
            $ionicPopup.alert({
                title   : data.title,
                template: data.message,
                okText  : $translate.instant('OK')
            });
        });

        push.on('error', function(e) {
            // e.message
            $log.log('GCM error = ' + e.message);
        });

        return q.promise;
    };

    /**
     *
     * @param endpoint_arn
     * @param title
     * @param msg
     */
    Amazon.publish = (endpoint_arn, title, msg = '') => {
        msg = msg.length > 20 ? msg.substr(0, 20) + '...' : msg;
        // PUBLISH TO ENDPOINT
        let params = {
            MessageStructure: 'json',
            Message         : JSON.stringify({
                'default'   : msg,
                'GCM'       : `{ "data": { 
                                    "title": "${title}", 
                                    "message": "${msg}", 
                                    "style": "inbox",
                                    "ledColor": [100, 149, 237, 0]
                               } }`
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