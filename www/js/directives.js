angular.module('afterclass.directives', [])

    .directive('askQuestion', function($timeout) {
        return {
            restrict: "A",
            link: function(scope, element, attrs) {
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
    .directive('askQuestionArea', function() {
        return {
            restrict: 'E',
            replace: 'true',
            template:
            '<div class="ask-q-area calm-bg text-center">' +
            '<button class="button aqa-btn" ng-click="askQuestion()">' +
                '<div class="ab-icon"></div>' +
                '<div class="ab-text">Ask a teacher</div>' +
            '</button>' +
            '<div class="light text-center padding">Touch to send your question to a private teacher</div>' +
            '</div>'
        };
    })
    .directive('question', function() {
        return {
            scope: {
                post: '=',
                viewPost: '=',
                postAccept: '&',
                postDecline: '&',
                postReply: '&'
            },
            restrict: 'E',
            replace: 'true',
            templateUrl: 'templates/partials/question.html',
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