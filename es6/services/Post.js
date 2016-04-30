angular.module('afterclass.services').factory('Post', (
    $rootScope, $firebaseObject, $firebaseArray, $ionicLoading, $ionicTabsDelegate, $ionicPopup, $state, $timeout, $log, $translate, MyFirebase, StudentCredit, Utils) => {
    
    let Post = {};

    Post.persist = (question, img_id = null) => {
        let posts = $firebaseArray(MyFirebase.getRef().child('posts'));
        $ionicLoading.show({template: '<ion-spinner class="spinner-calm"></ion-spinner>'});
        return posts.$add({
            user                : $rootScope.user.uid,
            subject             : question.subject,
            body                : question.body,
            img_id              : img_id || '',
            status              : 'unanswered',
            create_date         : Firebase.ServerValue.TIMESTAMP,
            update_date         : Firebase.ServerValue.TIMESTAMP,
            potential_teachers    : null,
            replies             : '',
            last_teacher_id       : '',
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
            potential_teachers = $firebaseArray(ref.child('potential_teachers'));

        potential_teachers.$loaded().then(potentialTeachers => {
            let currentTeacherIndex = _.findIndex(potentialTeachers, {user_id: user_id});
            // Another try, returned field might change on the server
            if (currentTeacherIndex === -1) {
                currentTeacherIndex = _.findIndex(potentialTeachers, {$id: user_id});
            }
            if (currentTeacherIndex > -1) {
                // Teacher is found in potential teachers
                potential_teachers[currentTeacherIndex].status_update_date = Firebase.ServerValue.TIMESTAMP;

                if (typeof potential_teachers[currentTeacherIndex].post_status !== 'undefined' &&
                    potential_teachers[currentTeacherIndex].post_status === 'accepted')
                {
                    potential_teachers[currentTeacherIndex].post_status = 'declined';
                    acceptedByField.remove();
                } else {
                    potential_teachers[currentTeacherIndex].post_status = 'accepted';
                    post.acceptedBy                                 = user_id;
                    post.$save();
                    $state.go('viewPost', {firebase_id: firebase_id});
                }
                potential_teachers.$save(currentTeacherIndex); // Index of modified thing
            } else {
                // Error
                $log.log('Error: teacher [' + user_id + '] was not found is potential teachers array');
                $log.log('potentialTeachers', potentialTeachers);
            }
        });
    };

    return Post;
});