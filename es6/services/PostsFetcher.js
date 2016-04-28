angular.module('afterclass.services').factory('PostsFetcher', ($rootScope, $firebaseArray, MyFirebase) => {
    'use strict';
    
    let ref = MyFirebase.getRef().child('posts');

    return {

        // Teacher
        getForTeacher: scope => {
            let sync, postsTutorAnswered;
            // Unanswered posts for tutor (status = unanswered and local filter [if in potential tutors array])
            // TODO: HIGHLY UN-SCALABLE (THINK OF A WAY TO FETCH ONLY IF IN POTENTIAL TUTORS)
            scope.posts_tutor_unanswered = $firebaseArray(ref);

            // Answered posts by tutor (last_tutor_id = this tutor's id)
            sync                = ref.orderByChild('last_tutor_id').equalTo($rootScope.user.uid);
            postsTutorAnswered = $firebaseArray(sync);
            postsTutorAnswered.$loaded().then(() => scope.posts_tutor_answered = postsTutorAnswered);
        },
        ifPotentialTutor: post => {
            // If post accepted by teacher and not by current teacher, exclude post
            if (post.acceptedBy && post.acceptedBy !== $rootScope.user.uid) { return false; }
            let tutor_ids = [];
            if (post.potential_tutors) {
                _.each(post.potential_tutors, (item, id) => tutor_ids.push(id));
            }
            // If current teacher present in potential teachers
            return angular.element.inArray($rootScope.user.uid, tutor_ids) > -1;
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