angular.module('afterclass.directives').directive('askQuestionArea', ($rootScope, $translate, $state, $cordovaNetwork, Payment, StudentCredit) => {
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
                    scope.showCreditCount = pointsLeft !== 'unlimited';
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
});