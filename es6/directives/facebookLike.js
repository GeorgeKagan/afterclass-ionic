angular.module('afterclass.directives').directive('facebookLike', () => {
    return {
        restrict: 'E',
        replace: true,
        template:
            `<div style="text-align: center;display: block;">
                <div class="button button-block button-outline button-positive icon-left ion-social-facebook" ng-click="likeClicked()">
                    Like
                </div>
             </div>`,
        scope: {

        },
        link: scope => {
            scope.likeClicked = () => {
                window.open('http://www.facebook.com/AppAfterClass', '_blank', 'location=yes');
            };
        }
    };
});