angular.module('afterclass.services', [])

    .factory('MyFirebase', function () {
        var env = localStorage.getItem('env'),
            obj = {},
            ref = null;
        if (env && env === 'dev') {
            ref = new Firebase('https://spankin-butts.firebaseio.com/');
            console.info('Firebase env: DEV');
        } else {
            ref = new Firebase('https://torrid-torch-3186.firebaseio.com/');
            console.warn('Firebase env: PROD');
        }
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
                    quality         : 80,
                    destinationType : Camera.DestinationType.FILE_URI,
                    mediaType       : Camera.MediaType.PICTURE
                }, options);
                navigator.camera.getPicture(function(result) {
                    $window.resolveLocalFileSystemURL(result, function (fileEntry) {
                        fileEntry.file(function (fileObj) {
                            // On crosswalk engine, the url is bad, so let's fix it!
                            if (result.substring(0, 21) === 'content://com.android') {
                                var photo_split = result.split('%3A');
                                result = 'content://media/external/images/media/' + photo_split[1];
                            }
                            var fileType = result.substring(result.lastIndexOf('.') + 1);
                            var is_image = true;
                            if (fileType != 'png' && fileType != 'jpg' && fileType != 'gif' && fileType != 'bmp') {
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

    .factory('InstitutePopup', function($rootScope, $http, $timeout, $ionicPopup, $translate, User) {
        'use strict';
        var showPopup = function() {
            var scope = $rootScope.$new();
            $http.get('http://www.afterclass.org/json/institutes-degrees.json').success(function(data) {
                scope.hash              = {selInstitute: 0, selDegree: 0};
                scope.institutes        = data;
                scope.institutes[$translate.instant('OTHER')] = $translate.instant('OTHER');
                scope.selectInstitute   = function() {
                    var institute = angular.element('#popup-institute :selected').attr('label');
                    scope.hash.selDegree = 0;
                    if (institute !== undefined && institute !== 'אחר') {
                        scope.degrees       = _.uniq(data[institute], 'name');
                        scope.degrees.push({name: $translate.instant('OTHER')});
                        scope.showDegrees   = true;
                    } else if (institute === 'אחר') {
                        var all_degrees = [];
                        angular.forEach(data, function(dataInstitute) {
                            angular.forEach(dataInstitute, function(degree) {
                                if (dataInstitute === 'אחר') { return; }
                                all_degrees.push(degree);
                            });
                        });
                        scope.degrees       = _.uniq(all_degrees, 'name');
                        scope.degrees.push({name: $translate.instant('OTHER')});
                        scope.showDegrees   = true;
                    } else {
                        scope.showDegrees   = false;
                    }
                };
                $timeout(function() {
                    $ionicPopup.show({
                        templateUrl : 'templates/partials/institute-popup.html',
                        scope       : scope,
                        title       : $translate.instant('SEL_INSTITUTE'),
                        buttons     : [{
                                text: '<span>' + $translate.instant('SAVE') + '</span>',
                                type: 'button-positive',
                                onTap: function (e) {
                                    var institute = angular.element('#popup-institute :selected').attr('label'),
                                        degree = angular.element('#popup-degree :selected').attr('label');
                                    if (institute !== undefined && degree !== undefined) {
                                        User.updateUser({institute: institute, degree: degree});
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
            $http.get('http://www.afterclass.org/json/institutes-degrees.json').success(function(data) {
                var subjects = _.find(data[institute], {name: degree}).subjects;
                d.resolve(subjects);
            });
            return d.promise;
        };
        return obj;
    })
;