angular.module('afterclass.directives').directive('facebookLike', () => {
    return {
        restrict: 'E',
        replace: true,
        template:
            `<div style="text-align: center;display: block;">
                <div class="fb-like" 
                    data-href="https://www.facebook.com/AppAfterClass" data-width="230px" 
                    data-layout="button" data-action="like" data-show-faces="false" data-share="false">
                </div>
             </div>`,
        scope: {

        },
        link: scope => {
            FB.init({
                appId      : '776966842380887',
                xfbml      : true,
                version    : 'v2.5'
            });
        }
    };
});