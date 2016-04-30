angular.module('afterclass.services').factory('Dom', ($rootScope, $ionicScrollDelegate) => {
    'use strict';
    
    let Dom = {};

    /**
     * When scrolling the homepage, make the tabs follow
     */
    Dom.homepageTabs = {
        tabs_top_pos: $rootScope.user.is_teacher && ionic.Platform.isIOS() ? 260 : 230,
        gotScrolled: () => {
            let tabs         = angular.element('#ac-tabs-inner > .tabs'),
                scrollDiv    = angular.element('#ac-tabs-inner .scroll:visible'),
                y            = scrollDiv.offset().top;

            if (!scrollDiv.length) { return; }

            if (y <= -186) {
                // Tabs sticky on top
                angular.element('.bar-header').addClass('scrolled');
                tabs.css('top', Dom.homepageTabs.getHeaderSize());
            } else {
                // Tabs following scroll
                angular.element('.bar-header').removeClass('scrolled');
                tabs.css('top', Dom.homepageTabs.tabs_top_pos - Math.abs(y));
            }
        },
        scrollToTop: () => {
            $ionicScrollDelegate.scrollTop(true);
            angular.element('#ac-tabs-inner .tabs').css('top', Dom.homepageTabs.tabs_top_pos);
            return true;
        },
        getHeaderSize: () => ionic.Platform.isIOS() ? 64 : 44
    };

    return Dom;
});