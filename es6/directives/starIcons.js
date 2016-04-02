angular.module('afterclass.directives').directive('starIcons', () => {
    return {
        restrict: 'E',
        replace: true,
        template:
            `<ul dir="auto" class="text-left">
                <li><img ng-src="{{starIcon(1)}}" ng-click="rateAnswer(1)"></li>
                <li><img ng-src="{{starIcon(2)}}" ng-click="rateAnswer(2)"></li>
                <li><img ng-src="{{starIcon(3)}}" ng-click="rateAnswer(3)"></li>
                <li><img ng-src="{{starIcon(4)}}" ng-click="rateAnswer(4)"></li>
                <li><img ng-src="{{starIcon(5)}}" ng-click="rateAnswer(5)"></li>
             </ul>`,
        scope: {
            ratingObj: '=',
            rateAnswer: '=',
            // Read only view
            rating: '='
        },
        link: scope => {
            scope.starIcon = function(index) {
                let rating = (scope.rating ? Math.round(scope.rating) : false) || scope.ratingObj.getRating();
                if (index <= rating) {
                    return '../img/star-full.png';
                } else {
                    return '../img/star-empty.png';
                }
            };
        }
    };
});