angular.module('afterclass.directives', [])

    .directive('acGeneral', function($translate) {
        return {
            restrict: "A",
            link: function (scope, element, attrs) {
                if ($translate.preferredLanguage() === 'he') {
                    angular.element('body').addClass('rtl');
                }
            }
        }
    })
    .directive('askQuestion', function($timeout) {
        return {
            restrict: "A",
            link: function(scope, element, attrs) {
                if (ionic.Platform.isIOS()) {
                    return;
                }
                // Auto show the subject select options
                var showDropDown = function (element) {
                    var event;
                    event = document.createEvent('MouseEvents');
                    event.initMouseEvent('mousedown', true, true, window);
                    element.dispatchEvent(event);
                };
                var dropDown = document.getElementById('aq-subject');
                $timeout(function() {
                    showDropDown(dropDown);
                }, 400);
            }
        };
    })
    .directive('askQuestionArea', function($rootScope, $translate) {
        var btnText, uiSref, subtitle, icon = '';
        if ($rootScope.user.is_teacher) {
            btnText = $translate.instant('GET_PAYMENT');
            uiSref = 'getPayment';
            subtitle = $translate.instant('GET_PAYMENT_SUBTITLE', {sum: 123});
            icon = 'ab-icon-currency';
        } else {
            btnText = $translate.instant('ASK_A_TEACHER');
            uiSref = 'askQuestion';
            subtitle = $translate.instant('ASK_QUESTION_INSTRUCTIONS');
        }
        return {
            restrict: 'E',
            replace: 'true',
            template:
            '<div class="ask-q-area calm-bg text-center">' +
            '<button class="button aqa-btn" ui-sref="' + uiSref + '">' +
                '<div class="ab-icon ' + icon + '"></div>' +
                '<div class="ab-text">' + btnText + '</div>' +
            '</button>' +
            '<div class="light text-center padding" dir="auto">' + subtitle + '</div>' +
            '</div>'
        };
    })
    .directive('question', function() {
        return {
            scope: {
                post: '=',
                viewPost: '=',
                deletePost: '=',
                postAccept: '&',
                postDecline: '&',
                postReply: '&',
                toggleAcceptance: '='
            },
            restrict: 'E',
            replace: 'true',
            templateUrl: 'templates/partials/question.html',
            controller: function($rootScope, $scope) {

                $scope.allowReply = true;
                if($scope.post.status === "answered") {
                    var lastActivity = $scope.post.timestamp;
                    if(Array.isArray($scope.post.replies)) {
                        lastActivity = Math.max($scope.post.replies[$scope.post.replies-1].timestamp, lastActivity)
                    }

                    if(lastActivity < moment().subtract(32, 'hours').unix()) { //Allow replies within 32 hours from last activity
                        $scope.allowReply = false;
                    }
                }

                $scope.isPostAccepted = function(post) {
                    var acceptingTutors = _.pluck(_.filter(post.potential_tutors, {post_status: 'accepted'}), 'id');
                    if(acceptingTutors.length > 0) {
                        return acceptingTutors[0] === $rootScope.user.id;
                    } else {
                        return false;
                    }
                };
            },
            link: function (scope, element, attrs) {
                scope.is_teacher = scope.$root.user.is_teacher;
                scope.header_bg = attrs.headerBg;
            }
        };
    })
    .directive('questionTabs', function($rootScope, $ionicTabsDelegate) {
        return {
            restrict: 'A',
            link: function() {
                var is_teacher = $rootScope.user.is_teacher,
                    tabs = {unanswered: 0, answered: 1};
                $ionicTabsDelegate.select(is_teacher ? tabs.unanswered : tabs.answered);
            }
        };
    })

;