angular.module('afterclass.controllers', ['ui.router'])

    .controller('HomeCtrl', function ($scope, $ionicScrollDelegate, $state, $firebase) {
        var tabs_top_pos = 230;
        // Load all user's questions from firebase
        var ref = new Firebase("https://dazzling-heat-8303.firebaseio.com/posts");
        var sync = $firebase(ref);
        var posts = sync.$asArray();
        posts.$loaded().then(function() {
            $scope.posts = posts;
        });
        //
        $scope.askQuestion = function () {
            $state.go('askQuestion');
        };
        $scope.viewPost = function () {
            $state.go('viewPost');
        };
        $scope.postReply = function () {
            alert('post reply');
        };
        $scope.postAccept = function () {
            alert('lol');
        };
        $scope.gotScrolled = function () {
            var y = angular.element('.scroll:visible').offset().top;
            if (y <= -186) {
                angular.element('#ac-tabs-inner .tabs').css('top', 44);
            } else {
                angular.element('#ac-tabs-inner .tabs').css('top', tabs_top_pos - Math.abs(y));
            }
        };
        $scope.scrollToTop = function () {
            $ionicScrollDelegate.scrollTop();
            angular.element('#ac-tabs-inner .tabs').css('top', tabs_top_pos);
            return true;
        };
    })

    .controller('AskQuestionCtrl', function ($scope, $ionicScrollDelegate, $state, $firebase, MyCamera) {
        var img = angular.element('#aq-img');
        var ref = new Firebase("https://dazzling-heat-8303.firebaseio.com/posts");
        var posts = $firebase(ref);
        $scope.addPost = function() {
            if (angular.element('#aq-subject').val() === '0' || angular.element('#aq-body').val() === '') {
                alert('Please fill all fields');
                return false;
            }
            posts.$push({
                subject: angular.element('#aq-subject').val(),
                body: angular.element('#aq-body').val(),
                status: 'unanswered',
                ask_date: moment().format("MMM Do YY"),
                replies: [
                    //{
                    //    name: 'Generic Teacher',
                    //    body: 'Reply body right here',
                    //    reply_date: moment().format()
                    //}
                ]
            }).then(function(ref) {
                //ref.key();
                $state.go('home');
            }, function(error) {
                console.log("Error:", error);
            });
        };
        $scope.backToHome = function () {
            $state.go('home');
        };
        $scope.takePicture = function () {
            MyCamera.getPicture({sourceType: Camera.PictureSourceType.CAMERA}).then(function(imageURI) {
                img.html('<img src="' + imageURI + '">');
            }, function(err) {
                img.html('Could not load image ' + err);
            });
        };
        $scope.choosePicture = function () {
            MyCamera.getPicture({sourceType: Camera.PictureSourceType.PHOTOLIBRARY}).then(function(imageURI) {
                img.html('<img src="' + imageURI + '">');
            }, function(err) {
                img.html('Could not load image ' + err);
            });
        };
    })

    .controller('ViewPostCtrl', function ($scope, $ionicScrollDelegate, $state) {
        $scope.backToHome = function () {
            $state.go('home');
        };
    })
;

//.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
//  // Form data for the login modal
//  $scope.loginData = {};
//
//  // Create the login modal that we will use later
//  $ionicModal.fromTemplateUrl('templates/login.html', {
//    scope: $scope
//  }).then(function(modal) {
//    $scope.modal = modal;
//  });
//
//  // Triggered in the login modal to close it
//  $scope.closeLogin = function() {
//    $scope.modal.hide();
//  };
//
//  // Open the login modal
//  $scope.login = function() {
//    $scope.modal.show();
//  };
//
//  // Perform the login action when the user submits the login form
//  $scope.doLogin = function() {
//    console.log('Doing login', $scope.loginData);
//
//    // Simulate a login delay. Remove this and replace with your login
//    // code if using a login system
//    $timeout(function() {
//      $scope.closeLogin();
//    }, 1000);
//  };
//})
//
//.controller('PlaylistsCtrl', function($scope) {
//  $scope.playlists = [
//    { title: 'Reggae', id: 1 },
//    { title: 'Chill', id: 2 },
//    { title: 'Dubstep', id: 3 },
//    { title: 'Indie', id: 4 },
//    { title: 'Rap', id: 5 },
//    { title: 'Cowbell', id: 6 }
//  ];
//})
//
//.controller('PlaylistCtrl', function($scope, $stateParams) {
//});