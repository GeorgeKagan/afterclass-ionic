angular.module('afterclass.services').factory('PostsFetcher', ($rootScope, $firebaseArray, MyFirebase) => {
    'use strict';
    
    let ref = MyFirebase.getRef().child('posts');

    return {

        // Teacher
        getForTeacher: scope => {
            let sync, postsTeacherAnswered;
            // Unanswered posts for teacher (status = unanswered and local filter [if in potential teachers array])
            // TODO: HIGHLY UN-SCALABLE (THINK OF A WAY TO FETCH ONLY IF IN POTENTIAL TEACHERS)
            scope.posts_teacher_unanswered = $firebaseArray(ref);

            // Answered posts by teacher (last_tutor_id = this teacher's id)
            sync                 = ref.orderByChild('last_tutor_id').equalTo($rootScope.user.uid);
            postsTeacherAnswered = $firebaseArray(sync);
            postsTeacherAnswered.$loaded().then(() => scope.posts_teacher_answered = postsTeacherAnswered);
        },
        ifPotentialTeacher: post => {
            // If post accepted by teacher and not by current teacher, exclude post
            if (post.acceptedBy && post.acceptedBy !== $rootScope.user.uid) { return false; }
            let teacher_ids = [];
            if (post.potential_tutors) {
                _.each(post.potential_tutors, (item, id) => teacher_ids.push(id));
            }
            // If current teacher present in potential teachers
            return angular.element.inArray($rootScope.user.uid, teacher_ids) > -1;
        },

        // Student
        getForStudent: scope => {
            let sync, posts;
            sync  = ref.orderByChild('user').equalTo($rootScope.user.uid);
            posts = $firebaseArray(sync);
            posts.$loaded().then(() => scope.posts = posts);
        },
        ifUserUnanswered: post => post.status === 'unanswered' || post.status === 'assigned'
    };
});