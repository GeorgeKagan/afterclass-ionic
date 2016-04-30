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
                let acceptingTeachersForPost = _.filter(post.potential_teachers, {post_status: 'accepted'}),
                    acceptingTeachers = _.map(acceptingTeachersForPost, 'user_id');
                // Try another field as it (the user id field) tends to change on the server.
                if (!acceptingTeachers || !acceptingTeachers[0]) {
                    acceptingTeachers = _.map(acceptingTeachersForPost, 'id');
                }
                if (acceptingTeachers.length > 0) {
                    // uid=facebook:123456789 or id=123456789. The server may return either.
                    return acceptingTeachers[0] === $rootScope.user.uid || acceptingTeachers[0] === $rootScope.user.id;
                } else {
                    return false;
                }
            };

            $scope.isPostHasTeacherThatAccepted = post => _.filter(post.potential_teachers, {post_status: 'accepted'}).length;
        },
        link: (scope, element, attrs) => {
            scope.is_teacher = scope.$root.user.is_teacher;
            scope.header_bg  = attrs.headerBg;
        }
    };
});