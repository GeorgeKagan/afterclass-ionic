angular.module('afterclass.controllers', ['ui.router'])

    .controller('AppCtrl', function($scope, $rootScope, $ionicPopover, $state, $ionicHistory) {
        // Logout user
        $scope.logout = function () {
            var ref = new Firebase("https://dazzling-heat-8303.firebaseio.com");
            ref.unauth();
            $state.go('login');
            $ionicHistory.nextViewOptions({disableBack: true});
            $scope.popover.hide();
        };
        // Header bar popover
        $ionicPopover.fromTemplateUrl('templates/popover.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });
        // Populate rootScope with user data from localStorage
        var ref = new Firebase("https://dazzling-heat-8303.firebaseio.com"),
            authData = ref.getAuth();
        if (authData) {
            $rootScope.user = authData.facebook;
        }
    })
    .controller('LoginCtrl', function ($scope, $rootScope, $state, $ionicLoading, $ionicHistory) {
        var ref = new Firebase("https://dazzling-heat-8303.firebaseio.com"),
            authData = ref.getAuth();
        if (authData) {
            $rootScope.user = authData.facebook;
            $state.go('home');
            $ionicHistory.nextViewOptions({disableBack: true});
            console.log("User " + authData.uid + " is logged in with " + authData.provider);
        } else {
            console.log("User is logged out");
        }
        //
        $scope.login = function () {
            $ionicLoading.show({template: 'Loading...'});
            ref.authWithOAuthPopup("facebook", function(error, authData) {
                $ionicLoading.hide();
                if (error) {
                    alert("Login failed: " + error);
                    console.log("Login Failed!", error);
                } else {
                    $rootScope.user = authData.facebook;
                    $state.go('home');
                    $ionicHistory.nextViewOptions({disableBack: true});
                    console.log("Authenticated successfully with payload:", authData);
                }
            });
        }
    })
    .controller('HomeCtrl', function ($rootScope, $scope, $ionicScrollDelegate, $state, $firebase, $ionicLoading, $cordovaDialogs) {
        var tabs_top_pos = 230;
        // Load all user's questions from firebase
        var ref = new Firebase("https://dazzling-heat-8303.firebaseio.com/posts");
        var sync = $firebase(ref.orderByChild('user').equalTo($rootScope.user.id));
        var posts = sync.$asArray();
        $ionicLoading.show({template: 'Loading...'});
        posts.$loaded().then(function() {
            $ionicLoading.hide();
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
            $cordovaDialogs.alert('No action yet...', 'Post reply', 'OK');
        };
        $scope.postAccept = function (post) {
            sync.$update(post.$id, { status: 'answered' }).then(function() {
                $ionicScrollDelegate.scrollTop(true);
            });
        };
        $scope.postDecline = function (post) {
            sync.$update(post.$id, { status: 'unanswered' }).then(function() {
                $ionicScrollDelegate.scrollTop(true);
            });
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

    .controller('AskQuestionCtrl', function ($rootScope, $scope, $ionicScrollDelegate, $state, $firebase, $ionicLoading, $cordovaDialogs, MyCamera) {
        var img = angular.element('#aq-img');
        var ref = new Firebase("https://dazzling-heat-8303.firebaseio.com/posts");
        var posts = $firebase(ref);
        $scope.subjects = ['Algebra 1', 'Algebra 2', 'Algebra 3', 'Other'];
        $scope.addPost = function() {
            if (angular.element('#aq-subject').val() === '' || angular.element('#aq-body').val() === '') {
                $cordovaDialogs.alert('Please fill out all required fields', 'Error', 'OK');
                return false;
            }
            $ionicLoading.show({template: 'Loading...'});
            posts.$push({
                user: $rootScope.user.id,
                subject: angular.element('#aq-subject').val(),
                body: angular.element('#aq-body').val(),
                status: 'unanswered',
                ask_date: moment().format("MMM Do YY"),
                timestamp: moment().unix(),
                replies: [
                    //{
                    //    name: 'Generic Teacher',
                    //    body: 'Reply body right here',
                    //    reply_date: moment().format()
                    //}
                ]
            }).then(function(ref) {
                //ref.key();
                $ionicLoading.hide();
                $state.go('home');
            }, function(error) {
                $ionicLoading.hide();
                console.log("Error:", error);
            });
        };
        $scope.subjectChanged = function () {
            angular.element('#aq-body')[0].focus();
        };
        $scope.backToHome = function () {
            $state.go('home');
        };
        $scope.takePicture = function () {
            MyCamera.getPicture({sourceType: Camera.PictureSourceType.CAMERA}).then(function(imageURI) {
                img.html('<img src="' + imageURI + '">');
                $ionicScrollDelegate.scrollTop();
            }, function() {
                img.html('');
                $ionicScrollDelegate.scrollTop();
            });
        };
        $scope.choosePicture = function () {
            MyCamera.getPicture({sourceType: Camera.PictureSourceType.PHOTOLIBRARY}).then(function(imageURI) {
                img.html('<img src="' + imageURI + '">');
                $ionicScrollDelegate.scrollTop();
            }, function() {
                img.html('');
                $ionicScrollDelegate.scrollTop();
            });
        };
    })

    .controller('ViewPostCtrl', function ($scope, $state) {
        $scope.backToHome = function () {
            $state.go('home');
        };
    })
;