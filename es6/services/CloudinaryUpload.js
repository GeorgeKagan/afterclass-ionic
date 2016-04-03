angular.module('afterclass.services').factory('CloudinaryUpload', ($q, $ionicLoading, $cordovaFileTransfer, $window, $translate) => {
    'use strict';

    let cloudinary_url = 'https://api.cloudinary.com/v1_1/daayssulc/image/upload',
        upload_preset  = 'gpyif5y5',
        obj            = {};

    /**
     * 
     * @param imageURI
     * @returns {Promise}
     */
    obj.uploadImage = imageURI => {
        let q = $q.defer(), fileSize, percentage;

        // Find out how big the original file is
        $window.resolveLocalFileSystemURL(imageURI, fileEntry => {
            fileEntry.file(fileObj => {
                fileSize = fileObj.size;
                $ionicLoading.show({template: $translate.instant('UPLOADS.PROGRESS') + 0 + '%'});
                uploadFile();
            });
        });

        function uploadFile() {
            // Add the Cloudinary "upload preset" name to the headers
            let uploadOptions = {params: {upload_preset}};

            $cordovaFileTransfer
                .upload(cloudinary_url, imageURI, uploadOptions)
                .then(result => {
                    $ionicLoading.show({template: $translate.instant('UPLOADS.COMPLETE'), duration: 1000});
                    // FYI: The result will also have URLs for any new images generated with eager transformations
                    let response = JSON.parse(decodeURIComponent(result.response));
                    q.resolve(response);
                }, err => {
                    reportError('Failed to upload image to cloudinary: ' + err);
                    $ionicLoading.show({template: $translate.instant('UPLOADS.FAIL'), duration: 3000});
                    q.reject(err);
                }, progress => {
                    percentage = Math.min(Math.floor(progress.loaded / fileSize * 100), 100);
                    $ionicLoading.show({template: $translate.instant('UPLOADS.PROGRESS') + percentage + '%'});
                });
        }

        return q.promise;
    };

    return obj;
});