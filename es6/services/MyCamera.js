angular.module('afterclass.services').factory('MyCamera', ($q, $window) => {
    'use strict';
    return {
        getPicture: options => {
            let q = $q.defer();
            options = angular.element.extend({
                quality             : 90,
                destinationType     : Camera.DestinationType.FILE_URI,
                mediaType           : Camera.MediaType.PICTURE,
                encodingType        : Camera.EncodingType.JPEG,
                correctOrientation  : true,
                targetWidth         : 1500,
                targetHeight        : 1500,
                allowEdit           : true
            }, options);

            navigator.camera.getPicture(result => {
                $window.resolveLocalFileSystemURL(result, fileEntry => {
                    fileEntry.file(fileObj => {
                        // On some versions, gallery attachment url is bad, so let's fix it!
                        if (result.substring(0, 21) === 'content://com.android') {
                            let photo_split = result.split('%3A');
                            result = 'content://media/external/images/media/' + photo_split[1];
                        }
                        let fileType = result.substring(result.lastIndexOf('.') + 1);
                        let is_image = true;

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
            return q.promise;
        }
    };
});