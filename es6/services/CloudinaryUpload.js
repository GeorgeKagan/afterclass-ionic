angular.module('afterclass.services').factory('CloudinaryUpload', ($q, $ionicLoading, $cordovaFileTransfer, $window, $translate) => {
    'use strict';

    let cloudinary_url = 'https://api.cloudinary.com/v1_1/daayssulc/image/upload',
        upload_preset  = 'gpyif5y5',
        Cloudinary     = {};

    /**
     * 
     * @param imageURI
     * @returns {Promise}
     */
    Cloudinary.uploadImage = imageURI => {
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
                    // FYI: The result will also have URLs for any new images generated with eager transformations
                    let response = JSON.parse(decodeURIComponent(result.response));
                    $ionicLoading.hide();
                    q.resolve(response);
                }, err => {
                    reportError('Failed to upload image to cloudinary: ' + err);
                    $ionicLoading.hide();
                    q.reject(err);
                }, progress => {
                    percentage = Math.min(Math.floor(progress.loaded / fileSize * 100), 100);
                    $ionicLoading.show({template: $translate.instant('UPLOADS.PROGRESS') + percentage + '%'});
                });
        }

        return q.promise;
    };

    return Cloudinary;
});