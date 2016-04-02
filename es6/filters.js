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
            // Subtract 10 seconds (to fix 'in x seconds' bug
            let timeAgo = moment(timestamp - (10 * 1000)).fromNow();
            // If within the past hour, emphasize it
            return (Date.now()) - timestamp < 3600000 ? `<span class="bold">${timeAgo}</span>` : timeAgo;
        };
    })
;