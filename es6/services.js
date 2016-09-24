angular.module('afterclass.services', [])

    .factory('MyFirebase', ($log) => {
        let env = localStorage.getItem('env'),
            obj = {},
            config = {},
            ref = null;

        if (env && env === 'dev') {
            config = {
                apiKey: "AIzaSyCvSWGEAaHPLteW08UbHdBzwAQggrM40SY",
                authDomain: "spankin-butts.firebaseapp.com",
                databaseURL: "https://spankin-butts.firebaseio.com",
                storageBucket: "spankin-butts.appspot.com",
                messagingSenderId: "322774520226"
            };
            $log.info('Firebase env: DEV');
        } else {
            // Prod
            // config = {
            //     apiKey: "AIzaSyCvSWGEAaHPLteW08UbHdBzwAQggrM40SY",
            //     authDomain: "spankin-butts.firebaseapp.com",
            //     databaseURL: "https://spankin-butts.firebaseio.com"
            // };
            // $log.warn('Firebase env: PROD');
        }
        firebase.initializeApp(config);
        obj.getRef = () => firebase.database().ref();
        obj.getFb = () => firebase;
        return obj;
    })

    .factory('Institutes', ($q, $rootScope, $http, $translate, $log, AppConfig) => {
        let obj = {};
        obj.getSubjectsByInstituteAndDegree = institute => {
            if (!institute) {
                return $log.error('Ask question: no institute in user data!');
            }
            return AppConfig.loadConfig().then(() => {
                let subjects = [];
                AppConfig.getConfig().subjects.forEach(item => subjects.push({key: item, value: $translate.instant('SUBJECTS.' + item)}));
                return angular.copy(subjects);
            });
        };
        return obj;
    })
;