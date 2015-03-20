angular.module('afterclass.services', [])

    .factory('MyCamera', function($q, $window) {
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
    .factory('UserCollection', function($rootScope, $q, $firebaseArray) {
        var ref = new Firebase("https://dazzling-heat-8303.firebaseio.com");
        return {
            saveToUsersCollection: function(authData) {
                var sync = ref.child('users').orderByChild('id').equalTo(authData.facebook.id),
                    user = $firebaseArray(sync);
                user.$loaded().then(function() {
                    if (!user.length) {
                        sync.$push(authData.facebook.cachedUserProfile);
                    }
                });
            },
            getFromUsersCollection: function(authData) {
                var sync = ref.child('users').orderByChild('id').equalTo(authData.facebook.id),
                    user = $firebaseArray(sync),
                    q = $q.defer();
                user.$loaded().then(function() {
                    $rootScope.user = angular.element.extend(authData.facebook, user[0]);
                    q.resolve();
                    //console.log('Merged User', $rootScope.user);
                });
                return q.promise;
            }
        };
    })
;