angular.module('afterclass.controllers', ['ui.router']);
angular.module('afterclass', ['ionic', 'afterclass.controllers', 'afterclass.directives', 'afterclass.services', 'afterclass.filters', 'firebase', 'ngCordova', 'monospaced.elastic'])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
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

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('login', {
                url: "/login",
                templateUrl: "templates/login.html",
                controller: 'LoginCtrl'
            })
            .state('home', {
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
        ;

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/login');
    });