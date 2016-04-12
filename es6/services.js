angular.module('afterclass.services', [])

    .factory('MyFirebase', ($log) => {
        let env = localStorage.getItem('env'),
            obj = {},
            ref = null;

        if (env && env === 'dev') {
            ref = new Firebase('https://spankin-butts.firebaseio.com/');
            $log.info('Firebase env: DEV');
        } else {
            ref = new Firebase('https://torrid-torch-3186.firebaseio.com/');
            $log.warn('Firebase env: PROD');
        }
        obj.getRef = () => ref;
        return obj;
    })

    .factory('MyCamera', ($q, $window) => {
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
                    targetWidth         : 2000,
                    targetHeight        : 2000
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
    })

    .factory('InstitutePopup', ($rootScope, $http, $timeout, $ionicPopup, $translate, $ionicLoading, User, AppConfig) => {
        'use strict';
        let showPopup = () => {
            let scope = $rootScope.$new();

            /**
             * Listen to Firebase config collection update and rebuild the grades array.
             */
            let populatePopupScopeWithGrades = () => {
                scope.institutes = [];
                AppConfig.loadConfig().then(() => {
                    AppConfig.getConfig().grades.forEach(item => scope.institutes.push({
                        key: item,
                        value: $translate.instant('GRADES.' + item)
                    }));
                });
            };
            scope.$on('configUpdated', populatePopupScopeWithGrades);
            populatePopupScopeWithGrades();

            scope.hash            = {selInstitute: 0};
            scope.selectInstitute = () => {};

            $timeout(() => {
                $ionicPopup.show({
                    templateUrl : 'templates/partials/institute-popup.html',
                    scope       : scope,
                    title       : $translate.instant('SEL_INSTITUTE'),
                    buttons     : [{
                        text: '<span>' + $translate.instant('SAVE') + '</span>',
                        type: 'button-positive',
                        onTap: e => {
                            let institute = angular.element('#popup-institute :selected').val();
                            if (institute) {
                                User.updateUser({institute});
                            } else {
                                angular.element('#pi-err').show();
                                e.preventDefault();
                            }
                        }
                    }]
                });
                $timeout(() => {
                    // If already got data (edit mode), auto-fill the selects
                    if ($rootScope.user.institute) {
                        angular.element(`#popup-institute [value="${$rootScope.user.institute}"]`).attr('selected', true);
                        scope.selectInstitute();
                    }
                });
                $ionicLoading.hide();
            }, 500);
        };
        return {
            show: showPopup
        };
    })

    .factory('Institutes', ($q, $rootScope, $http, $translate, $log, AppConfig) => {
        let obj = {};
        obj.getSubjectsByInstituteAndDegree = institute => {
            if (!institute) {
                return $log.error('Ask question: no institute in user data!');
            }
            return AppConfig.loadConfig().then(() => {
                let subjects = [];
                AppConfig.getConfig().subjects.forEach(item => subjects.push({key: item, value: $translate.instant('SUBJECTS.' + item)}));
                return angular.copy(subjects);
            });
        };
        return obj;
    })
;