angular.module('afterclass.filters', [])

    .filter('orderObjectBy', () => {
        return (items, field, reverse) => {
            let filtered = [];
            angular.forEach(items, item => filtered.push(item));
            filtered.sort((a, b) => a[field] > b[field] ? 1 : -1);
            if (reverse) { filtered.reverse(); }
            return filtered;
        };
    })

    .filter('nl2br', $sce => text => text ? $sce.trustAsHtml(text.replace(/\n/g, '<br>')) : '')

    .filter('moment', () => {
        return timestamp => {
            // Subtract 10 seconds (to fix 'in x seconds' bug
            let timeAgo = moment(timestamp - (10 * 1000)).fromNow();
            // If within the past hour, emphasize it
            return `<span class="text-small">` + (Date.now() - timestamp < 3600000 ? `<span class="bold">${timeAgo}</span>` : timeAgo) + `</span>`;
        };
    })
;