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
        return obj;
    })

    .factory('MyCamera', function($q, $window) {
        'use strict';
        return {
            getPicture: function(options) {
                var q = $q.defer();
                options = angular.element.extend({
                    quality             : 90,
                    destinationType     : Camera.DestinationType.FILE_URI,
                    mediaType           : Camera.MediaType.PICTURE,
                    encodingType        : Camera.EncodingType.JPEG,
                    correctOrientation  : true,
                    targetWidth         : 2000,
                    targetHeight        : 2000
                }, options);
                navigator.camera.getPicture(function(result) {
                    $window.resolveLocalFileSystemURL(result, function (fileEntry) {
                        fileEntry.file(function (fileObj) {
                            // On some versions, gallery attachment url is bad, so let's fix it!
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
                    }, function(error) {
                        reportError('Failed resolveLocalFileSystemURL: ' + error);
                    });
                }, function(err) {
                    reportError('Failed camera.getPicture: ' + err);
                    q.reject(err);
                }, options);
                return q.promise;
            }
        };
    })

    .factory('InstitutePopup', function($rootScope, $http, $timeout, $ionicPopup, $translate, $ionicLoading, User, AppConfig) {
        'use strict';
        var showPopup = function() {
            var scope = $rootScope.$new();
            AppConfig.loadConfig().then(() => {
                let grades              = AppConfig.getConfig().grades;
                scope.hash              = {selInstitute: 0};
                scope.institutes        = grades;
                scope.selectInstitute   = function() {};
                $timeout(function() {
                    $ionicPopup.show({
                        templateUrl : 'templates/partials/institute-popup.html',
                        scope       : scope,
                        title       : $translate.instant('SEL_INSTITUTE'),
                        buttons     : [{
                            text: '<span>' + $translate.instant('SAVE') + '</span>',
                            type: 'button-positive',
                            onTap: function (e) {
                                var institute = angular.element('#popup-institute :selected').attr('label');
                                if (institute !== undefined) {
                                    User.updateUser({institute: institute});
                                } else {
                                    angular.element('#pi-err').show();
                                    e.preventDefault();
                                }
                            }
                        }
                        ]
                    });
                    $timeout(() => {
                        // If already got data (edit mode), auto-fill the selects
                        if ($rootScope.user.institute) {
                            angular.element(`#popup-institute [label="${$rootScope.user.institute}"]`).attr('selected', true);
                            scope.selectInstitute();
                        }
                    });
                    $ionicLoading.hide();
                }, 500);
                return grades;
            });
        };
        return {
            show: showPopup
        };
    })

    .factory('Institutes', function($q, $rootScope, $http, $translate, AppConfig) {
        var obj = {};
        obj.getSubjectsByInstituteAndDegree = function (institute) {
            if (!institute) {
                console.error('Ask question: no institute in user data!');
                return;
            }
            return AppConfig.loadConfig().then(() => {
                let subjects = angular.copy(AppConfig.getConfig().subjects);
                if (_.indexOf(subjects, $translate.instant('OTHER')) === -1) {
                    subjects.push($translate.instant('OTHER'));
                }
                return subjects;
            });
        };
        return obj;
    })
;