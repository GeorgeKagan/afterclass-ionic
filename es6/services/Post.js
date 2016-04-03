angular.module('afterclass.services').factory('Post', ($firebaseObject, $firebaseArray, $state, MyFirebase) => {
    let obj = {};

    /**
     *
     * @param firebase_id
     * @returns {*|a}
     */
    obj.delete = firebase_id => {
        let ref  = MyFirebase.getRef().child('posts/' + firebase_id),
            post = $firebaseObject(ref);
        return post.$remove();
    };

    /**
     *
     * @param firebase_id
     * @param user_id
     */
    obj.toggleAcceptance = (firebase_id, user_id) => {
        let ref              = MyFirebase.getRef().child('posts/' + firebase_id),
            acceptedByField  = ref.child('acceptedBy'),
            post             = $firebaseObject(ref),
            potential_tutors = $firebaseArray(ref.child('potential_tutors'));

        potential_tutors.$loaded().then(potentialTutors => {
            let currentTutorIndex = _.findIndex(potentialTutors, {user_id: user_id});
            // Another try, returned field might change on the server
            if (currentTutorIndex === -1) {
                currentTutorIndex = _.findIndex(potentialTutors, {$id: user_id});
            }
            if (currentTutorIndex > -1) {
                // Tutor is found in potential tutors
                potential_tutors[currentTutorIndex].status_update_date = Firebase.ServerValue.TIMESTAMP;

                if (typeof potential_tutors[currentTutorIndex].post_status !== 'undefined' &&
                    potential_tutors[currentTutorIndex].post_status === 'accepted')
                {
                    potential_tutors[currentTutorIndex].post_status = 'declined';
                    acceptedByField.remove();
                } else {
                    potential_tutors[currentTutorIndex].post_status = 'accepted';
                    post.acceptedBy                                 = user_id;
                    post.$save();
                    $state.go('viewPost', {firebase_id: firebase_id});
                }
                potential_tutors.$save(currentTutorIndex); // Index of modified thing
            } else {
                // Error
                console.log('Error: tutor [' + user_id + '] was not found is potential tutors array');
                console.log('potentialTutors', potentialTutors);
            }
        });
    };

    return obj;
});