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
            '<div class="aqa-btn" ng-click="askQuestion()">' +
            '<div class="ab-icon"></div>' +
            '<div class="ab-text">Ask a teacher</div>' +
            '</div>' +
            '<div class="light text-center padding">Touch to send your question to a private teacher</div>' +
            '</div>'
        };
    })
    .directive('question', function() {
        return {
            scope: {
                post: '='
            },
            restrict: 'E',
            replace: 'true',
            templateUrl: '../templates/question.html',
            link: function (scope, element, attrs) {
                scope.header_bg = attrs.headerBg;
            }
        };
    })
;