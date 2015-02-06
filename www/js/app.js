angular.module('afterclass', ['ionic', 'afterclass.controllers', 'afterclass.directives', 'afterclass.services', 'firebase'])

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
                controller: 'HomeCtrl'
            })
            .state('askQuestion', {
                url: "/askQuestion",
                templateUrl: "templates/ask-question.html",
                controller: 'AskQuestionCtrl'
            })
            .state('viewPost', {
                url: "/viewPost",
                templateUrl: "templates/view-post.html",
                controller: 'ViewPostCtrl'
            })
        ;

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/login');
    });
