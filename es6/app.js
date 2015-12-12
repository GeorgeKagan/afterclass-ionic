angular.module('afterclass.controllers', ['ui.router']);

angular.module('afterclass', ['ionic', 'afterclass.controllers', 'afterclass.directives', 'afterclass.services', 'afterclass.filters',
    'ngAnimate', 'firebase', 'ngCordova', 'monospaced.elastic', 'pascalprecht.translate', 'ionicLazyLoad', 'ngIOS9UIWebViewPatch'])

    .run(function ($rootScope, $ionicPlatform, $cordovaNetwork, $cordovaAppVersion) {
        $ionicPlatform.ready(function () {
            if (window.cordova) {
                // Check online status
                if (!$cordovaNetwork.isOnline()) {
                    alert('Please check that you are connected to the internet');
                    window.location.reload();
                    return false;
                }
                // Get app store version
                $cordovaAppVersion.getVersionNumber().then(version => $rootScope.appVersion = version);
            }
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .config(function ($stateProvider, $httpProvider, $urlRouterProvider, $cordovaFacebookProvider, $translateProvider, $ionicConfigProvider) {
        var appLang = 'he';

        if (!window.cordova) {
            $cordovaFacebookProvider.browserInit(776966842380887, "v2.5");
        }

        $httpProvider.interceptors.push('HttpInterceptor');
        $ionicConfigProvider.scrolling.jsScrolling(true);

        //Translation
        $translateProvider.useStaticFilesLoader({
            prefix: 'json/lang/',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage(appLang);
        $translateProvider.registerAvailableLanguageKeys(['en', 'he']);
        $translateProvider.useSanitizeValueStrategy('escaped');
        //$translateProvider.fallbackLanguage('he');
        //$translateProvider.determinePreferredLanguage();

        moment.locale(appLang);

        $stateProvider
            .state('login', {
                url: "/login",
                templateUrl: "templates/login.html",
                controller: 'LoginCtrl',
                onEnter: function($state, $ionicHistory, $timeout) {
                    if (!localStorage.getItem('finished_on_boarding')) {
                        $timeout(function() {
                            $ionicHistory.nextViewOptions({disableBack: true});
                            $state.go('onBoarding');
                        });
                    }
                }
            })
            .state('onBoarding', {
                url: "/onBoarding",
                templateUrl: "templates/on-boarding.html",
                controller: 'OnBoardingCtrl'
            })
            // User details wizard
            .state('userDetails_chooseType', {
                url: '/chooseType',
                templateUrl: 'templates/userDetails/choose-type.html',
                controller: 'UserDetailsChooseTypeCtrl',
                resolve: { user: function(User) { return User.getFromUsersCollection(); } }
            })
            .state('userDetails_tutorStep1', {
                cache: false,
                url: '/tutorStep1/:isEdit',
                templateUrl: 'templates/userDetails/tutor-step1.html',
                controller: 'UserDetailsTutorStep1Ctrl',
                resolve: { user: function(User) { return User.getFromUsersCollection(); } },
                params: { isEdit: 0 }
            })
            .state('userDetails_tutorStep2', {
                cache: false,
                url: '/tutorStep2/:isEdit',
                templateUrl: 'templates/userDetails/tutor-step2.html',
                controller: 'UserDetailsTutorStep2Ctrl',
                resolve: { user: function(User) { return User.getFromUsersCollection(); } },
                params: { isEdit: 0 }
            })
            .state('userDetails_tutorStep3', {
                cache: false,
                url: '/tutorStep3/:isEdit',
                templateUrl: 'templates/userDetails/tutor-step3.html',
                controller: 'UserDetailsTutorStep3Ctrl',
                resolve: { user: function(User) { return User.getFromUsersCollection(); } },
                params: { isEdit: 0 }
            })
            // end User details wizard
            .state('home', {
                url: "/home",
                templateUrl: "templates/home.html",
                controller: 'HomeCtrl',
                resolve: { user: function(User) { return User.getFromUsersCollection(); } }
            })
            .state('askQuestion', {
                url: "/askQuestion",
                templateUrl: "templates/ask-question.html",
                controller: 'AskQuestionCtrl',
                cache: false,
                resolve: { user: function(User) { return User.getFromUsersCollection(); } }
            })
            .state('getCredit', {
                url: "/getCredit",
                templateUrl: "templates/get-credit.html",
                controller: 'GetCreditCtrl',
                resolve: { user: function(User) { return User.getFromUsersCollection(); } }
            })
            .state('getPayment', {
                url: "/getPayment",
                templateUrl: "templates/get-payment.html",
                controller: 'GetPaymentCtrl',
                resolve: { user: function(User) { return User.getFromUsersCollection(); } }
            })
            .state('viewPost', {
                url: "/viewPost/:firebase_id",
                templateUrl: "templates/view-question.html",
                controller: 'ViewQuestionCtrl',
                resolve: { user: function(User) { return User.getFromUsersCollection(); } }
            })
            .state('fullImage', {
                url: "/fullImage/:img_id",
                templateUrl: "templates/full-image.html",
                controller: 'FullImageCtrl',
                resolve: { user: function(User) { return User.getFromUsersCollection(); } }
            })
            .state('about', {
                url: "/about",
                templateUrl: "templates/about.html",
                resolve: { user: function(User) { return User.getFromUsersCollection(); } }
            })
            .state('contact', {
                url: "/contact",
                templateUrl: "templates/contact.html",
                resolve: { user: function(User) { return User.getFromUsersCollection(); } }
            })
            .state('impersonate', {
                url: "/impersonate",
                templateUrl: "templates/impersonate.html",
                controller: 'ImpersonateCtrl',
                resolve: { user: function(User) { return User.getFromUsersCollection(); } }
            })
        ;

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/login');
    })

    .factory('$exceptionHandler', function ($log) {
        let env = localStorage.getItem('env');
        return function (exception, cause) {
            $log.error('Exception: ' , exception);
            $log.error('Cause: ', cause);
            if (env !== 'dev') {
                Bugsnag.notifyException(exception, {diagnostics:{cause: cause}});
            }
        };
    })
;