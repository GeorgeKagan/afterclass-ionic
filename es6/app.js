angular.module('afterclass', [
    'ionic', 'afterclass.constants', 'afterclass.controllers', 'afterclass.directives', 'afterclass.services', 'afterclass.filters',
    'ui.router', 'ngAnimate', 'firebase', 'ngCordova', 'monospaced.elastic', 'pascalprecht.translate', 'ionicLazyLoad', 'ngIOS9UIWebViewPatch'])

    .run(($rootScope, $ionicPlatform, $cordovaNetwork, $cordovaAppVersion, Device) => {
        $ionicPlatform.ready(() => {
            if (window.cordova) {
                // Check online status
                if (!$cordovaNetwork.isOnline()) {
                    alert('Please check that you are connected to the internet');
                    window.location.reload();
                    return false;
                }
                // Get app store version
                $cordovaAppVersion.getVersionNumber().then(version => $rootScope.appVersion = version);
            } else {
                $rootScope.appVersion = 'available_on_device';
            }
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
            if (window.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
        Device.confirmOnExitApp();
    })

    .config(($stateProvider, $httpProvider, $urlRouterProvider, $cordovaFacebookProvider, $translateProvider, $ionicConfigProvider, $logProvider, $compileProvider) => {
        let appLang = localStorage.getItem('uiLang') ? localStorage.getItem('uiLang') : 'he'; // remove 'he' to make it detect device lang automatically

        if (!window.cordova) {
            $cordovaFacebookProvider.browserInit(776966842380887, 'v2.5');
        }

        // Better performance
        $logProvider.debugEnabled(false);
        $compileProvider.debugInfoEnabled(true);

        $httpProvider.interceptors.push('HttpInterceptor');
        $ionicConfigProvider.scrolling.jsScrolling(true);
        $ionicConfigProvider.tabs.position('bottom');
        $ionicConfigProvider.views.transition('none');

        //Translation
        $translateProvider.registerAvailableLanguageKeys(['en', 'he']);
        $translateProvider.useSanitizeValueStrategy('escaped');
        //$translateProvider.fallbackLanguage('he');
        $translateProvider.useStaticFilesLoader({
            prefix: 'json/lang/',
            suffix: '.json'
        });

        if (appLang) {
            $translateProvider.preferredLanguage(appLang);
        } else {
            // Decide if 'en' or 'he' according to environment
            $translateProvider.determinePreferredLanguage();
        }

        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'FacebookLoginCtrl'
            })
            .state('registerOrLogin', {
                url: '/registerOrLogin',
                templateUrl: 'templates/register-or-login.html',
                controller: 'EmailLoginCtrl'
            })
            .state('onBoarding', {
                url: '/onBoarding',
                templateUrl: 'templates/on-boarding.html',
                controller: 'OnBoardingCtrl'
            })
            // User details wizard
            .state('userDetails_chooseType', {
                url: '/chooseType',
                templateUrl: 'templates/userDetails/choose-type.html',
                controller: 'UserDetailsChooseTypeCtrl',
                resolve: { user: User => User.getFromUsersCollection() }
            })
            .state('userDetails_tutorStep1', {
                cache: false,
                url: '/tutorStep1/:isEdit',
                templateUrl: 'templates/userDetails/tutor-step1.html',
                controller: 'UserDetailsTutorStep1Ctrl',
                resolve: { user: User => User.getFromUsersCollection() },
                params: { isEdit: 0 }
            })
            .state('userDetails_tutorStep2', {
                cache: false,
                url: '/tutorStep2/:isEdit',
                templateUrl: 'templates/userDetails/tutor-step2.html',
                controller: 'UserDetailsTutorStep2Ctrl',
                resolve: { user: User => User.getFromUsersCollection() },
                params: { isEdit: 0 }
            })
            .state('userDetails_tutorStep3', {
                cache: false,
                url: '/tutorStep3/:isEdit',
                templateUrl: 'templates/userDetails/tutor-step3.html',
                controller: 'UserDetailsTutorStep3Ctrl',
                resolve: { user: User => User.getFromUsersCollection() },
                params: { isEdit: 0 }
            })
            // end User details wizard
            .state('home', {
                url: '/home',
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl',
                resolve: { user: User => User.getFromUsersCollection() }
            })
            .state('askQuestion', {
                url: '/askQuestion',
                templateUrl: 'templates/ask-question.html',
                controller: 'AskQuestionCtrl',
                resolve: { user: User => User.getFromUsersCollection() }
            })
            .state('getCreditManual', {
                url: '/getCreditManual',
                templateUrl: 'templates/get-credit-manual.html',
                controller: 'GetCreditCtrl',
                resolve: { user: User => User.getFromUsersCollection() }
            })
            .state('getPayment', {
                url: '/getPayment',
                templateUrl: 'templates/get-payment.html',
                controller: 'GetPaymentCtrl',
                resolve: { user: User => User.getFromUsersCollection() }
            })
            .state('viewPost', {
                url: '/viewPost/:firebase_id',
                templateUrl: 'templates/view-question.html',
                controller: 'ViewQuestionCtrl',
                resolve: { user: User => User.getFromUsersCollection() }
            })
            .state('fullImage', {
                url: '/fullImage/:img_id',
                templateUrl: 'templates/full-image.html',
                controller: 'FullImageCtrl',
                resolve: { user: User => User.getFromUsersCollection() }
            })
            .state('profile', {
                url: '/profile/:firebase_user_id',
                templateUrl: 'templates/profile.html',
                controller: 'ProfileCtrl',
                resolve: {
                    user: User => User.getFromUsersCollection(),
                    otherUser: ($stateParams, User) => {
                        if ($stateParams.firebase_user_id) {
                            return User.getFromUsersCollectionById($stateParams.firebase_user_id);
                        }
                        return angular.noop();
                    }
                },
                params: { firebase_user_id: null }
            })
            .state('about', {
                url: '/about',
                templateUrl: 'templates/about.html',
                resolve: { user: User => User.getFromUsersCollection() }
            })
            .state('contact', {
                url: '/contact',
                controller: 'ContactCtrl',
                templateUrl: 'templates/contact.html',
                resolve: { user: User => User.getFromUsersCollection(), appConfig: AppConfig => AppConfig.loadConfig() }
            })
            .state('impersonate', {
                url: '/impersonate',
                templateUrl: 'templates/impersonate.html',
                controller: 'ImpersonateCtrl',
                resolve: { user: User => User.getFromUsersCollection() }
            })
        ;

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/login');
    })
    .factory('$exceptionHandler', $log => {
        let env = localStorage.getItem('env');
        return (exception, cause) => {
            $log.error('Exception: ' , exception);
            $log.error('Cause: ', cause);
            if (env !== 'dev') {
                Bugsnag.notifyException(exception, {diagnostics:{cause: cause}});
            }
        };
    })
;