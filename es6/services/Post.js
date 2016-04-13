angular.module('afterclass.services').factory('Post', (
    $rootScope, $firebaseObject, $firebaseArray, $ionicLoading, $ionicTabsDelegate, $ionicPopup, $state, $timeout, $log, $translate, MyFirebase, StudentCredit, Utils) => {
    let Post = {};

    Post.persist = (img_id = null) => {
        let posts = $firebaseArray(MyFirebase.getRef().child('posts'));
        $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
        return posts.$add({
            user                : $rootScope.user.uid,
            subject             : angular.element('#aq-subject').val(),
            body                : angular.element('#aq-body').val(),
            img_id              : img_id || '',
            status              : 'unanswered',
            create_date         : Firebase.ServerValue.TIMESTAMP,
            update_date         : Firebase.ServerValue.TIMESTAMP,
            potential_tutors    : null,
            replies             : '',
            last_tutor_id       : '',
            amazon_endpoint_arn : $rootScope.user.amazon_endpoint_arn ? $rootScope.user.amazon_endpoint_arn : ''
        }).then(() => {
            StudentCredit.deductCredits(1);
            $timeout(() => {
                $state.go('home').then(() => {
                    $timeout(() => {
                        let unanswered = 0;
                        $ionicLoading.hide();
                        $ionicTabsDelegate.select(unanswered);

                        // Popup with button to like us on Facebook
                        let popupScope   = $rootScope.$new();
                        popupScope.close = () => popup.close();

                        let popup = $ionicPopup.alert({
                            title: $translate.instant('FORM.Q_SENT_TITLE'),
                            template:
                                `<div class="text-center">` +
                                    $translate.instant('FORM.Q_SENT') +
                                    `<hr class="m-10" style="border:0;border-top:1px solid #f0f0f0;">
                                     <p class="text-center pb-5"><small>` + $translate.instant('LIKE_US') + `</small></p>
                                     <facebook-like></facebook-like>
                                     <div class="text-center pt-10 pb-5" ng-click="close()">` + $translate.instant('NEXT_TIME') + `</div>
                                </div>`,
                            buttons: [],
                            scope: popupScope
                        });

                        Utils.triggerAlgorithm();
                    }, 1000);
                });
            }, 1000);
        }, error => {
            $ionicLoading.hide();
            $log.log('Error: ', error);
        });
    };

    /**
     *
     * @param firebase_id
     * @returns {*|a}
     */
    Post.delete = firebase_id => {
        let ref  = MyFirebase.getRef().child('posts/' + firebase_id),
            post = $firebaseObject(ref);
        return post.$remove();
    };

    /**
     *
     * @param firebase_id
     * @param user_id
     */
    Post.toggleAcceptance = (firebase_id, user_id) => {
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
                $log.log('Error: tutor [' + user_id + '] was not found is potential tutors array');
                $log.log('potentialTutors', potentialTutors);
            }
        });
    };

    return Post;
});