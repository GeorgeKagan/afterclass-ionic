angular.module('afterclass.directives', [])

    .directive('acGeneral', function($translate) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                if ($translate.preferredLanguage() === 'he') {
                    angular.element('body').addClass('rtl');
                }
            }
        }
    })

    .directive('askQuestionArea', function($rootScope, $translate, $filter, $state, $cordovaNetwork, Payment, Coupon) {
        return {
            restrict: 'E',
            replace : 'true',
            template:
            '<div class="ask-q-area calm-bg text-center">' +
                '<button class="button aqa-btn" ng-click="btnClick()">' +
                    '<div class="ab-icon {{icon}}"></div>' +
                    '<div class="ab-text" ng-if="btnText===\'payment\'">{{"GET_PAYMENT"|translate}}</div>' +
                    '<div class="ab-text" ng-if="btnText===\'ask\'">{{"ASK_A_TEACHER"|translate}}</div>' +
                    '<div class="ab-text" ng-if="btnText===\'points\'">{{"GET_POINTS"|translate}}</div>' +
                '</button>' +
                '<div class="light text-center padding" dir="auto" ng-if="$root.user.is_teacher">' +
                    '<span ng-show="teacherTotalPayments||teacherTotalPayments==0">' +
                        '{{"GET_PAYMENT_SUBTITLE"|translate:translationData}}' +
                    '</span>' +
                '</div>' +
                '<div class="light text-center padding" dir="auto" ng-if="!$root.user.is_teacher">' +
                    '{{"ASK_QUESTION_REMAINING"|translate:translationData}}' +
                '</div>' +
            '</div>',
            scope: {},
            link: function (scope) {
                if ($rootScope.user.is_teacher) {
                    // Payments will be updated only on app relaunch (state cache)
                    Payment.getPaymentsSum().then(function (sum) {
                        scope.teacherTotalPayments  = sum;
                    });
                    scope.translationData = {sum: teacherTotalPayments};
                    scope.icon      = 'ab-icon-currency';
                    scope.btnText   = 'payment';
                    scope.btnClick  = function () {
                        $state.go('getPayment');
                    };
                } else {
                    scope.$watch('$root.user.credits', function() {
                        var pointsLeft  = Coupon.getPointsLeft();
                        scope.translationData = {count: pointsLeft};
                        scope.btnText   = pointsLeft > 0 ? 'ask' : 'points';
                        scope.btnClick  = function () {
                            if (window.cordova && !$cordovaNetwork.isOnline()) {
                                return alert($translate.instant('CHECK_INTERNET'));
                            }
                            $state.go(pointsLeft > 0 ? 'askQuestion' : 'getCreditManual');
                        };
                    }, true);
                }
            }
        };
    })

    .directive('question', function() {
        return {
            scope: {
                post            : '=',
                viewPost        : '=',
                deletePost      : '=',
                postAccept      : '&',
                postDecline     : '&',
                postReply       : '&',
                toggleAcceptance: '='
            },
            restrict    : 'E',
            replace     : 'true',
            templateUrl : 'templates/partials/question.html',
            controller  : function($rootScope, $scope) {
                $scope.allowReply = true;

                if ($scope.post.status === 'answered') {
                    var lastActivity = $scope.post.create_date;

                    if (Array.isArray($scope.post.replies)) {
                        lastActivity = Math.max($scope.post.replies[$scope.post.replies-1].create_date, lastActivity);
                    }
                    if (lastActivity < moment().subtract(32, 'hours').unix()) {
                        // Allow replies within 32 hours from last activity
                        $scope.allowReply = false;
                    }
                }

                $scope.isPostAccepted = function(post) {
                    var acceptingTutorsForPost = _.filter(post.potential_tutors, {post_status: 'accepted'}),
                        acceptingTutors = _.map(acceptingTutorsForPost, 'user_id');
                    // Try another field as it (the user id field) tends to change on the server.
                    if (!acceptingTutors || !acceptingTutors[0]) {
                        acceptingTutors = _.map(acceptingTutorsForPost, 'id');
                    }
                    if (acceptingTutors.length > 0) {
                        // uid=facebook:123456789 or id=123456789. The server may return either.
                        return acceptingTutors[0] === $rootScope.user.uid || acceptingTutors[0] === $rootScope.user.id;
                    } else {
                        return false;
                    }
                };

                $scope.isPostHasTutorThatAccepted = function(post) {
                    return _.filter(post.potential_tutors, {post_status: 'accepted'}).length;
                };
            },
            link: function (scope, element, attrs) {
                scope.is_teacher    = scope.$root.user.is_teacher;
                scope.header_bg     = attrs.headerBg;
            }
        };
    })

    .directive('questionTabs', function($rootScope, $ionicTabsDelegate) {
        return {
            restrict: 'A',
            link: function() {
                var is_teacher   = $rootScope.user.is_teacher,
                    tabs         = {unanswered: 0, answered: 1};
                $ionicTabsDelegate.select(is_teacher ? tabs.unanswered : tabs.answered);
            }
        };
    })

    .directive("fileUploader", [function () {
        return {
            scope: {
                fileread: "="
            },
            link: function (scope, element, attributes) {
				let lastClick=0;
				//alert("fileUploader init, "+element);
				$(element).click(function () {
					let now=new Date().getTime();
					if(now-lastClick>1000){
						lastClick=now;
						var elem = $(element).parent().find("input.file-upload")[0]
				      	var evt = document.createEvent("MouseEvents");
						evt.initEvent("click", true, false);
						elem.dispatchEvent(evt);
					}
				});



                $(element).parent().find("input.file-upload").bind("change", function (changeEvent) {
                    var reader = new FileReader();
                    reader.onload = function (loadEvent) {
                        scope.$apply(function () {
                            scope.fileread = loadEvent.target.result;
                            alert("scope.fileread="+scope.fileread);
                        });
                    }
                    reader.readAsDataURL(changeEvent.target.files[0]);
                });
            }
        }
    }])

;
