angular.module('afterclass.directives').directive('question', () => {
    return {
        scope: {
            post            : '=',
            viewPost        : '=',
            deletePost      : '=',
            postAccept      : '&',
            postDecline     : '&',
            postReply       : '&',
            toggleAcceptance: '='
        },
        restrict    : 'E',
        replace     : 'true',
        templateUrl : 'templates/partials/question.html',
        controller  : ($rootScope, $scope) => {

            /*$scope.allowReply = true;
             if ($scope.post.status === 'answered') {
             let lastActivity = $scope.post.create_date;

             if (Array.isArray($scope.post.replies)) {
             lastActivity = Math.max($scope.post.replies[$scope.post.replies-1].create_date, lastActivity);
             }
             if (lastActivity < moment().subtract(32, 'hours').unix()) {
             // Allow replies within 32 hours from last activity
             $scope.allowReply = false;
             }
             }*/

            $scope.isPostAccepted = post => {
                let acceptingTutorsForPost = _.filter(post.potential_tutors, {post_status: 'accepted'}),
                    acceptingTutors = _.map(acceptingTutorsForPost, 'user_id');
                // Try another field as it (the user id field) tends to change on the server.
                if (!acceptingTutors || !acceptingTutors[0]) {
                    acceptingTutors = _.map(acceptingTutorsForPost, 'id');
                }
                if (acceptingTutors.length > 0) {
                    // uid=facebook:123456789 or id=123456789. The server may return either.
                    return acceptingTutors[0] === $rootScope.user.uid || acceptingTutors[0] === $rootScope.user.id;
                } else {
                    return false;
                }
            };

            $scope.isPostHasTutorThatAccepted = post => _.filter(post.potential_tutors, {post_status: 'accepted'}).length;
        },
        link: (scope, element, attrs) => {
            scope.is_teacher = scope.$root.user.is_teacher;
            scope.header_bg  = attrs.headerBg;
        }
    };
});