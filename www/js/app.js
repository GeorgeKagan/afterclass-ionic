angular.module('afterclass.controllers', ['ui.router']);
angular.module('afterclass', ['ionic', 'afterclass.controllers', 'afterclass.directives', 'afterclass.services', 'afterclass.filters', 'firebase', 'ngCordova', 'monospaced.elastic', 'pascalprecht.translate'])

    .run(function ($rootScope, $ionicPlatform, $cordovaNetwork, $translate) {
        $ionicPlatform.ready(function () {
            if (window.cordova) {
                var isOnline = $cordovaNetwork.isOnline();
                if (!isOnline) {
                    alert('Please check that you are connected to the internet');
                }
            }
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider, $cordovaFacebookProvider, $translateProvider) {
        var appLang = 'he';

        if (!window.cordova) {
            $cordovaFacebookProvider.browserInit(776966842380887, "v2.0");
        }
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
                resolve: { user: function(UserCollection) { return UserCollection.getFromUsersCollection(); } }
            })
            .state('userDetails_tutorStep1', {
                cache: false,
                url: '/tutorStep1',
                templateUrl: 'templates/userDetails/tutor-step1.html',
                controller: 'UserDetailsTutorStep1Ctrl',
                resolve: { user: function(UserCollection) { return UserCollection.getFromUsersCollection(); } }
            })
            .state('userDetails_tutorStep2', {
                cache: false,
                url: '/tutorStep2',
                templateUrl: 'templates/userDetails/tutor-step2.html',
                controller: 'UserDetailsTutorStep2Ctrl',
                resolve: { user: function(UserCollection) { return UserCollection.getFromUsersCollection(); } }
            })
            .state('userDetails_tutorStep3', {
                cache: false,
                url: '/tutorStep3',
                templateUrl: 'templates/userDetails/tutor-step3.html',
                controller: 'UserDetailsTutorStep3Ctrl',
                resolve: { user: function(UserCollection) { return UserCollection.getFromUsersCollection(); } }
            })
            // end User details wizard
            .state('home', {
                cache: false,
                url: "/home",
                templateUrl: "templates/home.html",
                controller: 'HomeCtrl',
                resolve: { user: function(UserCollection) { return UserCollection.getFromUsersCollection(); } }
            })
            .state('askQuestion', {
                url: "/askQuestion",
                templateUrl: "templates/ask-question.html",
                controller: 'AskQuestionCtrl',
                resolve: { user: function(UserCollection) { return UserCollection.getFromUsersCollection(); } }
            })
            .state('viewPost', {
                url: "/viewPost/:firebase_id",
                templateUrl: "templates/view-question.html",
                controller: 'ViewQuestionCtrl',
                resolve: { user: function(UserCollection) { return UserCollection.getFromUsersCollection(); } }
            })
            .state('fullImage', {
                url: "/fullImage/:img_id",
                templateUrl: "templates/full-image.html",
                controller: 'FullImageCtrl',
                resolve: { user: function(UserCollection) { return UserCollection.getFromUsersCollection(); } }
            })
            .state('aboutPage', {
                url: "/about",
                templateUrl: "templates/about-page.html",
                resolve: { user: function(UserCollection) { return UserCollection.getFromUsersCollection(); } }
            })
            .state('contactPage', {
                url: "/contact",
                templateUrl: "templates/contact-page.html",
                resolve: { user: function(UserCollection) { return UserCollection.getFromUsersCollection(); } }
            })
        ;

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/login');
    });