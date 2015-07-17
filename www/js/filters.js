angular.module('afterclass.filters', [])

    .filter('orderObjectBy', function () {
        return function (items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function (item) {
                filtered.push(item);
            });
            filtered.sort(function (a, b) {
                return (a[field] > b[field] ? 1 : -1);
            });
            if (reverse) filtered.reverse();
            return filtered;
        };
    })

    .filter('nl2br', function($sce){
        return function(text) {
            return text ? $sce.trustAsHtml(text.replace(/\n/g, '<br>')) : '';
        };
    })

    .filter('moment', function(){
        return function(timestamp) {
            return moment(timestamp * 1000).fromNow();
        };
    })
;