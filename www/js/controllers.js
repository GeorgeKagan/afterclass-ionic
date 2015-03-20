angular.module('afterclass.controllers', ['ui.router'])

    .controller('AppCtrl', function($scope, $rootScope, $ionicPopover, $state, $ionicHistory) {
        // Logout user
        $scope.logout = function () {
            var ref = new Firebase("https://dazzling-heat-8303.firebaseio.com");
            ref.unauth();
            $state.go('login');
            $ionicHistory.nextViewOptions({disableBack: true});
            $scope.popover.hide();
            $rootScope.user = null;
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
    .controller('HomeCtrl', function ($rootScope, $scope, $ionicScrollDelegate, $state, $firebaseArray, $ionicLoading, $cordovaDialogs) {
        var tabs_top_pos = $rootScope.user.is_teacher ? 44 : 230;
        // Load all user's questions from firebase
        var ref = new Firebase("https://dazzling-heat-8303.firebaseio.com/posts"),
            sync, sync2, sync3, posts, posts_tutor_unanswered, posts_tutor_answered;
        $ionicLoading.show({template: 'Loading...'});
        if ($rootScope.user.is_teacher) {
            // Unanswered posts for tutor (status = unanswered and local filter [if in potential tutors array])
            // TODO: HIGHLY UN-SCALABLE (THINK OF A WAY TO FETCH ONLY IF IN POTENTIAL TUTORS)
            sync2 = ref.orderByChild('status').equalTo('unanswered');
            posts_tutor_unanswered = $firebaseArray(sync2);
            posts_tutor_unanswered.$loaded().then(function() {
                $ionicLoading.hide();
                $scope.posts_tutor_unanswered = posts_tutor_unanswered;
            });
            $scope.ifPotentialTutor = function (post) {
                return angular.element.inArray($rootScope.user.id, post.potential_tutors) > -1;
            };
            // Answered posts by tutor (last_tutor_id = this tutor's id)
            sync3 = ref.orderByChild('last_tutor_id').equalTo($rootScope.user.id);
            posts_tutor_answered = $firebaseArray(sync3);
            posts_tutor_answered.$loaded().then(function() {
                $scope.posts_tutor_answered = posts_tutor_answered;
            });
        } else {
            sync = ref.orderByChild('user').equalTo($rootScope.user.id);
            posts = $firebaseArray(sync);
            posts.$loaded().then(function() {
                $ionicLoading.hide();
                $scope.posts = posts;
            });
        }
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
            if ($rootScope.user.is_teacher) {
                return;
            }
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

    .controller('AskQuestionCtrl', function ($rootScope, $scope, $ionicScrollDelegate, $state, $firebaseArray, $ionicLoading, $cordovaDialogs, $timeout, MyCamera, CloudinaryUpload) {
        var img = angular.element('#aq-img');
        var ref = new Firebase("https://dazzling-heat-8303.firebaseio.com/posts");
        var posts = $firebaseArray(ref);
        var add_img_url = null;
        $scope.subjects = ['Algebra 1', 'Algebra 2', 'Algebra 3', 'Other'];
        $scope.addPost = function() {
            if (angular.element('#aq-subject').val() === '' || angular.element('#aq-body').val() === '') {
                $cordovaDialogs.alert('Please fill out all required fields', 'Error', 'OK');
                return false;
            }
            var persist_post = function(img_id) {
                $ionicLoading.show({template: 'Sending...'});
                posts.$add({
                    user: $rootScope.user.id,
                    subject: angular.element('#aq-subject').val(),
                    body: angular.element('#aq-body').val(),
                    img_id: img_id || '',
                    status: 'unanswered',
                    ask_date: moment().format("MMM Do YY"),
                    timestamp: moment().unix(),
                    replies: '',
                    potential_tutors: '',
                    last_tutor_id: ''
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

    .controller('ViewPostCtrl', function ($rootScope, $scope, $ionicScrollDelegate, $state, $stateParams, $cordovaDialogs, $firebaseObject, $firebaseArray, $ionicLoading,
                                          $ionicActionSheet, $timeout, MyCamera, CloudinaryUpload) {
        var ref = new Firebase('https://dazzling-heat-8303.firebaseio.com/posts/' + $stateParams.firebase_id),
            post = ref,
            replies = $firebaseArray(ref.child('replies')),
            add_img_url = null;
        $scope.post = $firebaseObject(post);
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
                replies.$add({
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
                    // + update last_tutor_id (if reply author is tutor), otherwise blank it so it's available to all
                    $scope.post.$loaded().then(function(post) {
                        post.status = $rootScope.user.is_teacher ? 'answered' : 'unanswered';
                        post.timestamp = moment().unix();
                        post.last_tutor_id = $rootScope.user.is_teacher ? $rootScope.user.id : '';
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