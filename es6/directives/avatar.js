angular.module('afterclass.directives').directive('avatar', () => {
    return {
        restrict: 'AE',
        transclude: true,
        template:
            `<img ng-if="userId.indexOf('facebook') > -1" 
                    ng-src="http://graph.facebook.com/{{::userId.replace('facebook:', '')}}/picture?type=square&height=80&width=80"
                    width="{{::size}}" height="{{::size}}">
             <img ng-if="userId.indexOf('facebook') === -1" 
                    ng-src="https://secure.gravatar.com/avatar/{{::userId}}?d=identicon" 
                    width="{{::size}}" height="{{::size}}">
             <div ng-transclude></div>`,
        scope: {
            userId: '=',
            size: '='
        },
        link: scope => {

        }
    };
});