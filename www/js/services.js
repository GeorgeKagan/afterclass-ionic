angular.module('afterclass.services', [])

    .factory('MyFirebase', function () {
        var obj = {},
            ref = new Firebase("https://dazzling-heat-8303.firebaseio.com");
        obj.getRef = function () {
            return ref;
        };
        obj.getRefCoupons = function () {
            return obj.getRef().child('coupons');
        };
        return obj;
    })
    .factory('MyCamera', function($q, $window) {
        'use strict';
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
                            // On crosswalk engine, the url is bad, so let's fix it!
                            if (result.substring(0, 21) === 'content://com.android') {
                                var photo_split = result.split('%3A');
                                result = 'content://media/external/images/media/' + photo_split[1];
                            }
                            var fileType = result.substring(result.lastIndexOf(".") + 1);
                            var is_image = true;
                            if (fileType != "png" && fileType != "jpg" && fileType != "gif" && fileType != "bmp") {
                                is_image = angular.element.inArray(fileObj.type, ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']) > -1;
                            }
                            q.resolve({
                                imageURI: result,
                                is_image: is_image
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
    .factory('InstitutePopup', function($rootScope, $http, $timeout, $ionicPopup, $translate, UserCollection) {
        'use strict';
        var showPopup = function() {
            var scope = $rootScope.$new();
            $http.get('json/institutes-degrees.json').success(function(data) {
                scope.hash = {selInstitute: 0, selDegree: 0};
                scope.institutes = data;
                scope.selectInstitute = function() {
                    var institute = angular.element('#popup-institute :selected').val();
                    scope.hash.selDegree = 0;
                    if (institute != 0 && institute !== 'Other') {
                        scope.degrees = _.uniq(data[institute], 'name');
                        scope.showDegrees = true;
                    } else if (institute === 'Other') {
                        var all_degrees = [];
                        angular.forEach(data, function(institute) {
                            angular.forEach(institute, function(degree) {
                                all_degrees.push(degree);
                            });
                        });
                        scope.degrees = _.uniq(all_degrees, 'name');
                        scope.showDegrees = true;
                    } else {
                        scope.showDegrees = false;
                    }
                };
                $timeout(function() {
                    $ionicPopup.show({
                        templateUrl: 'templates/partials/institute-popup.html',
                        scope: scope,
                        title: $translate.instant('SEL_INSTITUTE'),
                        buttons: [
                            {
                                text: '<span>' + $translate.instant('SAVE') + '</span>',
                                type: 'button-positive',
                                onTap: function (e) {
                                    var institute = angular.element('#popup-institute :selected').val(),
                                        degree = angular.element('#popup-degree :selected').val();
                                    if (institute !== '0' && degree !== '0') {
                                        UserCollection.updateUser({institute: institute, degree: degree});
                                    } else {
                                        angular.element('#pi-err').show();
                                        e.preventDefault();
                                    }
                                }
                            }
                        ]
                    });
                }, 500);
            }).
            error(function() {
                console.log('Failed to get institutes-degrees json');
            });
        };
        return {
            show: showPopup
        };
    })
    .factory('Institutes', function($q, $rootScope, $http) {
        var obj = {}, d = $q.defer();
        obj.getSubjectsByInstituteAndDegree = function (institute, degree) {
            $http.get('json/institutes-degrees.json').success(function(data) {
                var subjects = _.find(data[institute], {name: degree}).subjects;
                d.resolve(subjects);
            });
            return d.promise;
        };
        return obj;
    })
;