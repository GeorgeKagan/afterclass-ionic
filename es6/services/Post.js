angular.module('afterclass.services').factory('Post', (
    $rootScope, $firebaseObject, $firebaseArray, $ionicLoading, $ionicTabsDelegate, $ionicPopup, $state, $timeout, $log, $translate, $cordovaNetwork,
    MyFirebase, StudentCredit, Utils) => {
    
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

        potential_tutors.$loaded().then(potentialTeachers => {
            let currentTeacherIndex = _.findIndex(potentialTeachers, {user_id: user_id});
            // Another try, returned field might change on the server
            if (currentTeacherIndex === -1) {
                currentTeacherIndex = _.findIndex(potentialTeachers, {$id: user_id});
            }
            if (currentTeacherIndex > -1) {
                // Teacher is found in potential teachers
                potential_tutors[currentTeacherIndex].status_update_date = Firebase.ServerValue.TIMESTAMP;

                if (typeof potential_tutors[currentTeacherIndex].post_status !== 'undefined' &&
                    potential_tutors[currentTeacherIndex].post_status === 'accepted')
                {
                    potential_tutors[currentTeacherIndex].post_status = 'declined';
                    acceptedByField.remove();
                } else {
                    potential_tutors[currentTeacherIndex].post_status = 'accepted';
                    post.acceptedBy                                 = user_id;
                    post.$save();
                    $state.go('viewPost', {firebase_id: firebase_id});
                }
                potential_tutors.$save(currentTeacherIndex); // Index of modified thing
            } else {
                // Error
                $log.log('Error: teacher [' + user_id + '] was not found is potential teachers array');
                $log.log('potentialTeachers', potentialTeachers);
            }
        });
    };

    Post.reportConversation = (post, report, ref, customMessage) => {
        if (window.cordova && !$cordovaNetwork.isOnline()) {
            return alert($translate.instant('CHECK_INTERNET'));
        }
        let scope = $rootScope.$new();
        report.customMessage = typeof customMessage !== 'undefined' ? customMessage : '';
        scope.report = report;

        $ionicPopup.show({
            templateUrl : 'templates/partials/conversation-report-popup.html',
            scope       : scope,
            title       : $translate.instant('REPORT_QUESTION'),
            buttons     : [{
                text: '<span>' + $translate.instant('CANCEL') + '</span>',
                type: 'button-default button-block'
            }, {
                text: '<span>' + $translate.instant('SEND') + '</span>',
                type: 'button-positive button-block',
                onTap: () => {
                    if (!report.content.trim()) {
                        return;
                    }
                    post.$loaded().then(() => {
                        let complaints = $firebaseArray(ref.child('complaints'));
                        complaints.$loaded().then(post => {
                            complaints.$add({
                                user                : $rootScope.user.name,
                                body                : report.content,
                                create_date         : Firebase.ServerValue.TIMESTAMP,
                                create_date_human   : moment().format('D/M/YY H:mm:ss'),
                                is_teacher          : $rootScope.user.is_teacher
                            });
                            report.content = '';
                            post.$save();
                            $timeout(() => {
                                $ionicPopup.alert({
                                    title   : $translate.instant('SUCCESS'),
                                    template: $translate.instant('REPORT_SENT'),
                                    okText  : $translate.instant('OK')
                                });
                            }, 0);
                        });
                    });
                }
            }
            ]
        });
    };

    return Post;
});