angular.module('afterclass', ['ionic', 'afterclass.controllers', 'afterclass.directives', 'afterclass.services'])

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

            .state('home', {
                url: "/home",
                //abstract: true,
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
        //.state('app.search', {
        //  url: "/search",
        //  views: {
        //    'menuContent': {
        //      templateUrl: "templates/search.html"
        //    }
        //  }
        //})
        //
        //.state('app.browse', {
        //  url: "/browse",
        //  views: {
        //    'menuContent': {
        //      templateUrl: "templates/browse.html"
        //    }
        //  }
        //})
        //  .state('app.playlists', {
        //    url: "/playlists",
        //    views: {
        //      'menuContent': {
        //        templateUrl: "templates/playlists.html",
        //        controller: 'PlaylistsCtrl'
        //      }
        //    }
        //  })
        //
        //.state('app.single', {
        //  url: "/playlists/:playlistId",
        //  views: {
        //    'menuContent': {
        //      templateUrl: "templates/playlist.html",
        //      controller: 'PlaylistCtrl'
        //    }
        //  }
        //})


        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/home');
    });
