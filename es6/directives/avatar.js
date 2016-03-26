angular.module('afterclass.directives').directive('avatar', () => {
    return {
        restrict: 'E',
        template:
            `<img ng-if="userId.indexOf('facebook') > -1" 
                    ng-src="http://graph.facebook.com/{{::userId.replace('facebook:', '')}}/picture?type=square"
                    width="{{::size}}" height="{{::size}}">
             <img ng-if="userId.indexOf('facebook') === -1" 
                    ng-src="https://secure.gravatar.com/avatar/{{::userId}}?d=identicon" 
                    width="{{::size}}" height="{{::size}}">`,
        scope: {
            userId: '=',
            size: '='
        },
        link: scope => {

        }
    };
});