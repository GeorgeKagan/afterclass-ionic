angular.module('starter.controllers', ['ui.router'])

.controller('HomeCtrl', function($scope, $ionicScrollDelegate, $state) {
  var tabs_top_pos = 230;
  $scope.items = [
    {title: 'lol rofl lmao first'}
  ];
  $scope.askQuestion = function() {
    //alert('aaa');
    $state.go('askQuestion');
  };
  $scope.gotScrolled = function() {
    var y = angular.element('.scroll:visible').offset().top;
    if (y <= -186) {
      //angular.element('#ac-tabs-outer').show();
      //angular.element('#ac-tabs-inner').hide();
      angular.element('#ac-tabs-inner .tabs').css('top', 44);
    } else {
      //angular.element('#ac-tabs-outer').hide();
      //angular.element('#ac-tabs-inner').show();
      var curr_y = angular.element('#ac-tabs-inner .tabs').position().top;
      angular.element('#ac-tabs-inner .tabs').css('top', tabs_top_pos - Math.abs(y));
    }
  };
  $scope.scrollToTop = function() {
    $ionicScrollDelegate.scrollTop();
    angular.element('#ac-tabs-inner .tabs').css('top', tabs_top_pos);
    return true;
  };
})
.controller('AskQuestionCtrl', function($scope, $ionicScrollDelegate, $state) {
  $scope.backToHome = function() {
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