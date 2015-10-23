angular.module('afterclass.services').factory('Post', function ($firebaseObject, $firebaseArray, $state, MyFirebase) {
    var obj = {};

    obj.delete = function (firebase_id) {
        var ref     = MyFirebase.getRef().child('posts/' + firebase_id),
            post    = $firebaseObject(ref);
        post.$remove();
    };

    obj.toggleAcceptance = function (firebase_id, user_id) {
        var ref                 = MyFirebase.getRef().child('posts/' + firebase_id),
            acceptedByField     = ref.child('acceptedBy'),
            post                = $firebaseObject(ref),
            potential_tutors    = $firebaseArray(ref.child('potential_tutors'));

        potential_tutors.$loaded().then(function (potentialTutors) {
            var currentTutorIndex = _.findIndex(potentialTutors, {user_id: user_id});
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