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
    })
    .controller('LoginCtrl', function ($scope, $rootScope, $state, $ionicLoading, $ionicHistory, UserCollection) {
        var ref = new Firebase("https://dazzling-heat-8303.firebaseio.com"),
            authData = ref.getAuth();
        if (authData) {
            $state.go('home');
            $ionicHistory.nextViewOptions({disableBack: true});
        }
        //
        $scope.login = function () {
            $ionicLoading.show({template: 'Loading...'});
            ref.authWithOAuthPopup("facebook", function(error, authData) {
                $ionicLoading.hide();
                if (error) {
                    alert("Login failed: " + error);
                } else {
                    UserCollection.saveToUsersCollection(authData);
                    $state.go('home');
                    $ionicHistory.nextViewOptions({disableBack: true});
                }
            });
        };
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
        $scope.viewPost = function (firebase_id) {
            $state.go('viewPost', {firebase_id: firebase_id});
        };
        $scope.postReply = function () {
            $cordovaDialogs.alert('No action yet...', 'Post reply', 'OK');
        };
        //$scope.postAccept = function (post) {
        //    sync.$update(post.$id, { status: 'answered' }).then(function() {
        //        $ionicScrollDelegate.scrollTop(true);
        //    });
        //};
        //$scope.postDecline = function (post) {
        //    sync.$update(post.$id, { status: 'unanswered' }).then(function() {
        //        $ionicScrollDelegate.scrollTop(true);
        //    });
        //};
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

    .controller('AskQuestionCtrl', function ($rootScope, $scope, $ionicScrollDelegate, $state, $firebase, $ionicLoading, $cordovaDialogs, $timeout, MyCamera, CloudinaryUpload) {
        var img = angular.element('#aq-img');
        var ref = new Firebase("https://dazzling-heat-8303.firebaseio.com/posts");
        var posts = $firebase(ref);
        var add_img_url = null;
        $scope.subjects = ['Algebra 1', 'Algebra 2', 'Algebra 3', 'Other'];
        $scope.addPost = function() {
            if (angular.element('#aq-subject').val() === '' || angular.element('#aq-body').val() === '') {
                $cordovaDialogs.alert('Please fill out all required fields', 'Error', 'OK');
                return false;
            }
            var persist_post = function(img_id) {
                $ionicLoading.show({template: 'Sending...'});
                posts.$push({
                    user: $rootScope.user.id,
                    subject: angular.element('#aq-subject').val(),
                    body: angular.element('#aq-body').val(),
                    img_id: img_id || '',
                    status: 'unanswered',
                    ask_date: moment().format("MMM Do YY"),
                    timestamp: moment().unix(),
                    replies: {}
                }).then(function() {
                    $timeout(function() {
                        add_img_url = null;
                        $ionicLoading.hide();
                        $state.go('home');
                    }, 1000);
                }, function(error) {
                    $ionicLoading.hide();
                    console.log("Error:", error);
                });
            };
            if (add_img_url) {
                CloudinaryUpload.uploadImage(add_img_url).then(
                    function (result) {
                        persist_post(result.public_id);
                    },
                    function (err) {

                    }
                );
            } else {
                persist_post();
            }
        };
        $scope.subjectChanged = function () {
            angular.element('#aq-body')[0].focus();
        };
        $scope.backToHome = function () {
            $state.go('home');
        };
        $scope.takePicture = function () {
            MyCamera.getPicture({sourceType: Camera.PictureSourceType.CAMERA}).then(function(result) {
                add_img_url = result.imageURI;
                img.html('<img src="' + result.imageURI + '">');
                $ionicScrollDelegate.scrollTop();
            }, function() {
                img.html('');
                $ionicScrollDelegate.scrollTop();
            });
        };
        $scope.choosePicture = function () {
            MyCamera.getPicture({sourceType: Camera.PictureSourceType.PHOTOLIBRARY}).then(function(result) {
                if (!result.is_image) {
                    return $cordovaDialogs.alert('Only images allowed', 'Error', 'OK');
                }
                add_img_url = result.imageURI;
                img.html('<img src="' + result.imageURI + '">');
                $ionicScrollDelegate.scrollTop();
            }, function() {
                img.html('');
                $ionicScrollDelegate.scrollTop();
            });
        };
    })

    .controller('ViewPostCtrl', function ($rootScope, $scope, $ionicScrollDelegate, $state, $stateParams, $cordovaDialogs, $firebase, $ionicLoading,
                                          $ionicActionSheet, $timeout, MyCamera, CloudinaryUpload) {
        var ref = new Firebase('https://dazzling-heat-8303.firebaseio.com/posts/' + $stateParams.firebase_id),
            post = $firebase(ref),
            replies = $firebase(ref.child('replies')),
            add_img_url = null;
        $scope.post = post.$asObject();
        $scope.replyBody = '';
        $scope.add_img_preview = false;
        $scope.backToHome = function () {
            $state.go('home');
        };
        $scope.addImage = function () {
            $ionicActionSheet.show({
                buttons: [{text: 'Camera'}, {text: 'Documents'}],
                destructiveText: $scope.add_img_preview ? 'Remove' : '',
                titleText: 'Select Source',
                cancelText: 'Cancel',
                destructiveButtonClicked: function () {
                    $scope.add_img_preview = false;
                    add_img_url = null;
                    return true;
                },
                buttonClicked: function (index) {
                    if (index === 0) {
                        // Camera
                        MyCamera.getPicture({sourceType: Camera.PictureSourceType.CAMERA}).then(function (result) {
                            add_img_url = result.imageURI;
                            angular.element('.img-preview').attr('src', result.imageURI);
                            $scope.add_img_preview = true;
                        }, function () {
                            $scope.add_img_preview = false;
                        });
                    } else {
                        // Gallery
                        MyCamera.getPicture({sourceType: Camera.PictureSourceType.PHOTOLIBRARY}).then(function (result) {
                            if (!result.is_image) {
                                return $cordovaDialogs.alert('Only images allowed', 'Error', 'OK');
                            }
                            add_img_url = result.imageURI;
                            angular.element('.img-preview').attr('src', result.imageURI);
                            $scope.add_img_preview = true;
                        }, function () {
                            $scope.add_img_preview = false;
                        });
                    }
                    return true;
                }
            });
        };
        $scope.addReply = function() {
            if (!$scope.replyBody) {
                $cordovaDialogs.alert('Please type something in!', 'Error', 'OK');
                return false;
            }
            var persist_reply = function(img_id) {
                $ionicLoading.show({template: 'Sending...'});
                replies.$push({
                    user: $rootScope.user.id,
                    body: $scope.replyBody,
                    img_id: img_id || '',
                    reply_date: moment().format("MMM Do YY"),
                    timestamp: moment().unix()
                }).then(function() {
                    $ionicLoading.hide();
                    $scope.add_img_preview = false;
                    $scope.replyBody = '';
                    add_img_url = null;
                    $ionicScrollDelegate.scrollBottom(true);
                    // Change question's status according to last comment's user type
                    // + update timestamp so it would go up in feed
                    $scope.post.$loaded().then(function(post) {
                        post.status = $rootScope.user.is_teacher ? 'answered' : 'unanswered';
                        post.timestamp = moment().unix();
                        post.$save();
                    });
                }, function(error) {
                    $ionicLoading.hide();
                    console.log("Error:", error);
                });
            };
            if (add_img_url) {
                CloudinaryUpload.uploadImage(add_img_url).then(
                    function (result) {
                        persist_reply(result.public_id);
                    },
                    function (err) {

                    }
                );
            } else {
                persist_reply();
            }
        };
        $scope.viewFullImage = function(img_id) {
            $state.go('fullImage', {img_id: img_id});
        };
    })
    .controller('FullImageCtrl', function ($scope, $state, $stateParams, $window) {
        $scope.img_id = $stateParams.img_id;
        $scope.backToHome = function () {
            $window.history.back();
        };
    })
;