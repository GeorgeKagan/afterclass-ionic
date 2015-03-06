angular.module('afterclass.services', [])

    .factory('MyCamera', ['$q', function($q) {
        return {
            getPicture: function(options) {
                var q = $q.defer();
                navigator.camera.getPicture(function(result) {
                    // Do any magic you need
                    q.resolve(result);
                }, function(err) {
                    q.reject(err);
                }, options);
                return q.promise;
            }
        }
    }])
    .factory('CloudinaryUpload', function($q, $ionicLoading, $cordovaFile, $window) {
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
                    $ionicLoading.show({template: 'Uploading Image : ' + 0 + '%'});
                    uploadFile();
                });
            });
            function uploadFile() {
                // Add the Cloudinary "upload preset" name to the headers
                var uploadOptions = {
                    params: {upload_preset: upload_preset}
                };
                $cordovaFile
                    .uploadFile(cloudinary_url, imageURI, uploadOptions)
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
                        $ionicLoading.show({template: 'Uploading Image : ' + percentage + '%'});
                    });
            }
            return deferred.promise;
        };
        return service;
    })
;