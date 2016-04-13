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