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
            $scope.isPostAccepted = post => {
                let acceptingTeachersForPost = _.filter(post.potential_tutors, {post_status: 'accepted'}),
                    acceptingTeachers        = _.map(acceptingTeachersForPost, 'user_id');

                // Try another field as it (the user id field) tends to change on the server.
                if (!acceptingTeachers || !acceptingTeachers[0]) {
                    acceptingTeachers = _.map(acceptingTeachersForPost, 'id');
                }
                // uid=facebook:123456789 or id=123456789. The server may return either.
                return acceptingTeachers.length > 0
                    ? acceptingTeachers[0] === $rootScope.user.uid || acceptingTeachers[0] === $rootScope.user.id
                    : false;
            };
            $scope.isPostHasTeacherThatAccepted = post => _.filter(post.potential_tutors, {post_status: 'accepted'}).length;
        },
        link: (scope, element, attrs) => {
            scope.is_teacher = scope.$root.user.is_teacher;
            scope.header_bg  = attrs.headerBg;
        }
    };
});