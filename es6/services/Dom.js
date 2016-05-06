angular.module('afterclass.services').factory('Dom', ($rootScope, $ionicScrollDelegate) => {
    'use strict';
    
    let Dom = {};

    /**
     * When scrolling the homepage, make the tabs follow
     */
    Dom.homepageTabs = {
        tabs_top_pos: $rootScope.user.is_teacher && ionic.Platform.isIOS() ? 240 : 210,
        gotScrolled: () => {
            let tabs         = angular.element('#ac-tabs-inner > .tabs'),
                scrollDiv    = angular.element('#ac-tabs-inner .scroll:visible'),
                y            = scrollDiv.offset().top;

            if (!scrollDiv.length) { return; }

            // Fade in or out header solid bg color
            angular.element('.bar-header')[y <= -15 ? 'addClass' : 'removeClass']('scrolled');

            // Tabs sticky on top or following scroll, respectively
            tabs.css('top', y <= -167 ? Dom.homepageTabs.getHeaderSize() : Dom.homepageTabs.tabs_top_pos - Math.abs(y));
        },
        scrollToTop: () => {
            $ionicScrollDelegate.scrollTop();
            angular.element('#ac-tabs-inner .tabs').css('top', Dom.homepageTabs.tabs_top_pos);
            return true;
        },
        getHeaderSize: () => ionic.Platform.isIOS() ? 64 : 44
    };

    return Dom;
});