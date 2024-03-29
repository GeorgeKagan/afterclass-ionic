angular.module('afterclass.services').factory('MyCamera', ($q, $window) => {
    'use strict';
    return {
        getPicture: options => {
            let q = $q.defer();
            options = angular.element.extend({
                quality             : 90,
                destinationType     : Camera.DestinationType.FILE_URI,
                mediaType           : Camera.MediaType.PICTURE,
                encodingType        : Camera.EncodingType.PNG,
                correctOrientation  : true,
                targetWidth         : 1500,
                targetHeight        : 1500,
                allowEdit           : false
            }, options);

            cordova.plugins.diagnostic.requestCameraAuthorization(status => {
                console.log('Authorization request for camera use was ' + (status == cordova.plugins.diagnostic.permissionStatus.GRANTED ? 'granted' : 'denied'));
                navigator.camera.getPicture(result => {
                    $window.resolveLocalFileSystemURL(result, fileEntry => {
                        fileEntry.file(fileObj => {
                            // On some versions, gallery attachment url is bad, so let's fix it!
                            if (result.substring(0, 21) === 'content://com.android') {
                                let photo_split = result.split('%3A');
                                result = 'content://media/external/images/media/' + photo_split[1];
                            }
                            let fileType = result.substring(result.lastIndexOf('.') + 1),
                                is_image = true;

                            if (fileType != 'png' && fileType != 'jpg' && fileType != 'gif' && fileType != 'bmp') {
                                is_image = angular.element.inArray(fileObj.type, ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']) > -1;
                            }
                            q.resolve({imageURI: result, is_image});
                        });
                    }, error => reportError('Failed resolveLocalFileSystemURL: ' + error));
                }, err => {
                    reportError('Failed camera.getPicture: ' + err);
                    q.reject(err);
                }, options);
            }, error => {
                console.error(error);
            });

            return q.promise;
        }
    };
});