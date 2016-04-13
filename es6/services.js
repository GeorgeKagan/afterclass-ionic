angular.module('afterclass.services', [])

    .factory('MyFirebase', ($log) => {
        let env = localStorage.getItem('env'),
            obj = {},
            ref = null;

        if (env && env === 'dev') {
            ref = new Firebase('https://spankin-butts.firebaseio.com/');
            $log.info('Firebase env: DEV');
        } else {
            ref = new Firebase('https://torrid-torch-3186.firebaseio.com/');
            $log.warn('Firebase env: PROD');
        }
        obj.getRef = () => ref;
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