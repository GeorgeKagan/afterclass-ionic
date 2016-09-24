angular.module('afterclass.services').factory('PostsFetcher', ($rootScope, $firebaseArray, MyFirebase) => {
    'use strict';
    
    let ref = MyFirebase.getRef().child('posts');

    return {

        // Teacher
        getForTeacher: scope => {
            // Unanswered posts for teacher (acceptedBy = null and local filter [if in potential teachers array])
            let unanswered = $firebaseArray(ref.orderByChild('acceptedBy').equalTo(null));
            unanswered.$loaded().then(() => scope.posts_teacher_unanswered = unanswered);

            // Answered posts by teacher (last_tutor_id = this teacher's id)
            let answered = $firebaseArray(ref.orderByChild('last_tutor_id').equalTo($rootScope.user.uid));
            answered.$loaded().then(() => scope.posts_teacher_answered = answered);
        },
        ifPotentialTeacher: post => {
            let teacher_ids = [];
            // Extract teacher_ids from potential_tutors array
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