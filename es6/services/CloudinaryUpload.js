/**
 * Push notifications
 */
angular.module('afterclass.services').factory('CloudinaryUpload', function ($q, $ionicLoading, $cordovaFileTransfer, $window, $translate) {
    'use strict';

    var cloudinary_url  = 'https://api.cloudinary.com/v1_1/daayssulc/image/upload',
        upload_preset   = 'gpyif5y5',
        obj             = {};

    obj.uploadImage = function (imageURI) {
        var deferred = $q.defer(), fileSize, percentage;

        // Find out how big the original file is
		if($window.resolveLocalFileSystemURL){
	        $window.resolveLocalFileSystemURL(imageURI, function (fileEntry) {
	            fileEntry.file(function (fileObj) {
	                fileSize = fileObj.size;
	                $ionicLoading.show({template: $translate.instant('UPLOADS.PROGRESS') + 0 + '%'});
	                uploadFile();
	            });
	        });
		}else{
			fileSize = imageURI.length;
			$ionicLoading.show({template: $translate.instant('UPLOADS.PROGRESS') + 0 + '%'});
			uploadFile();

		}

        function uploadFile() {
            // Add the Cloudinary "upload preset" name to the headers
            var uploadOptions = {params: {upload_preset: upload_preset}};
            $cordovaFileTransfer
                .upload(cloudinary_url, imageURI, uploadOptions)
                .then(function (result) {
                    $ionicLoading.show({template: $translate.instant('UPLOADS.COMPLETE'), duration: 1000});
                    // FYI: The result will also have URLs for any new images generated with eager transformations
                    var response = JSON.parse(decodeURIComponent(result.response));
                    deferred.resolve(response);
                }, function (err) {
                    reportError('Failed to upload image to cloudinary: ' + err);
                    $ionicLoading.show({template: $translate.instant('UPLOADS.FAIL'), duration: 3000});
                    deferred.reject(err);
                }, function (progress) {
                    percentage = Math.min(Math.floor(progress.loaded / fileSize * 100), 100);
                    $ionicLoading.show({template: $translate.instant('UPLOADS.PROGRESS') + percentage + '%'});
                });
        }

        return deferred.promise;
    };

    return obj;
});
