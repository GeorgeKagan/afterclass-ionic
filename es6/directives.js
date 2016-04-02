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
                    '<div class="ab-text">{{btnText}}</div>' +
                '</button>' +
                '<div class="light text-center padding" dir="auto" ng-bind-html="subtitle"></div>' +
            '</div>',
            scope: {},
            link: function (scope) {
                if ($rootScope.user.is_teacher) {
                    // Payments will be updated only on app relaunch (state cache)
                    Payment.getPaymentsSum().then(function (sum) {
                        scope.teacherTotalPayments  = sum;
                        scope.subtitle              = '<span ng-show="teacherTotalPayments||teacherTotalPayments==0">' +
                            $translate.instant('GET_PAYMENT_SUBTITLE', {sum: scope.teacherTotalPayments}) + '</span>';
                    });
                    scope.icon      = 'ab-icon-currency';
                    scope.btnText   = $translate.instant('GET_PAYMENT');
                    scope.btnClick  = function () {
                        $state.go('getPayment');
                    };
                } else {
                    scope.$watch('$root.user.credits', function() {
                        var pointsLeft  = Coupon.getPointsLeft();
                        scope.btnText   = $translate.instant(pointsLeft > 0 ? 'ASK_A_TEACHER' : 'GET_POINTS');
                        scope.btnClick  = function () {
                            if (window.cordova && !$cordovaNetwork.isOnline()) {
                                return alert($translate.instant('CHECK_INTERNET'));
                            }
                            $state.go(pointsLeft > 0 ? 'askQuestion' : 'getCredit');
                        };
                        scope.subtitle = $translate.instant('ASK_QUESTION_REMAINING', {count: pointsLeft});
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
                        acceptingTutors = _.pluck(acceptingTutorsForPost, 'user_id');
                    // Try another field as it (the user id field) tends to change on the server.
                    if (!acceptingTutors || !acceptingTutors[0]) {
                        acceptingTutors = _.pluck(acceptingTutorsForPost, 'id');
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

    .directive("fileread", [function () {
        return {
            scope: {
                fileread: "="
            },
            link: function (scope, element, attributes) {
                element.bind("change", function (changeEvent) {
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
