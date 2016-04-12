angular.module('afterclass.directives', [])

    .directive('acGeneral', $translate => {
        return {
            restrict: 'A',
            link: () => {
                if ($translate.preferredLanguage() === 'he') {
                    angular.element('body').addClass('rtl');
                }
            }
        }
    })

    .directive('askQuestionArea', ($rootScope, $translate, $state, $cordovaNetwork, Payment, StudentCredit) => {
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
                    '<span ng-if="teacherTotalPayments||teacherTotalPayments==0">' +
                        '{{"GET_PAYMENT_SUBTITLE"|translate:translationData}}' + ' &#8362' +
                    '</span>' +
                '</div>' +
                '<div class="light text-center padding" dir="auto" ng-if="!$root.user.is_teacher && showCreditCount">' +
                    '{{"ASK_QUESTION_REMAINING"|translate:translationData}}' +
                '</div>' +
            '</div>',
            scope: {},
            link: scope => {
                if ($rootScope.user.is_teacher) {
                    // Payments will be updated only on app relaunch (state cache)
                    Payment.getPaymentsSum().then(sum => scope.teacherTotalPayments = sum);
                    scope.translationData = {sum: scope.teacherTotalPayments || 0};
                    scope.icon            = 'ab-icon-currency';
                    scope.btnText         = 'payment';
                    scope.btnClick        = () => $state.go('getPayment');
                } else {
                    scope.$watch('$root.user.credits', () => {
                        //Get credit balance
                        let pointsLeft = StudentCredit.getCreditBalance();
                        if(pointsLeft === 'unlimited') {
                            scope.showCreditCount = false;
                        } else {
                            scope.showCreditCount = true;
                        }

                        scope.translationData = {count: pointsLeft};

                        //Set main button text
                        if(pointsLeft === 'unlimited' || pointsLeft > 0) {
                            scope.btnText = 'ask';
                        } else {
                            scope.btnText = 'points';
                        }

                        scope.btnClick        = () => {
                            if (window.cordova && !$cordovaNetwork.isOnline()) {
                                return alert($translate.instant('CHECK_INTERNET'));
                            }

                            //Open correct tab
                            if(pointsLeft === 'unlimited' || pointsLeft > 0) {
                                $state.go('askQuestion');
                            } else {
                                $state.go('getCreditManual');
                            }

                        };
                    }, true);
                }
            }
        };
    })

    .directive('question', () => {
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
            controller  : ($rootScope, $scope) => {

                /*$scope.allowReply = true;
                if ($scope.post.status === 'answered') {
                    let lastActivity = $scope.post.create_date;

                    if (Array.isArray($scope.post.replies)) {
                        lastActivity = Math.max($scope.post.replies[$scope.post.replies-1].create_date, lastActivity);
                    }
                    if (lastActivity < moment().subtract(32, 'hours').unix()) {
                        // Allow replies within 32 hours from last activity
                        $scope.allowReply = false;
                    }
                }*/

                $scope.isPostAccepted = post => {
                    let acceptingTutorsForPost = _.filter(post.potential_tutors, {post_status: 'accepted'}),
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

                $scope.isPostHasTutorThatAccepted = post => _.filter(post.potential_tutors, {post_status: 'accepted'}).length;
            },
            link: (scope, element, attrs) => {
                scope.is_teacher = scope.$root.user.is_teacher;
                scope.header_bg  = attrs.headerBg;
            }
        };
    })

    .directive('questionTabs', ($rootScope, $ionicTabsDelegate) => {
        return {
            restrict: 'A',
            link: () => {
                let is_teacher = $rootScope.user.is_teacher,
                    tabs       = {unanswered: 0, answered: 1};
                $ionicTabsDelegate.select(is_teacher ? tabs.unanswered : tabs.answered);
            }
        };
    })
;