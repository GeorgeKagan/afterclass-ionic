angular.module('afterclass.services').factory('TeacherDetails', ($log, User) => {
    let UserDetails = {}, degrees, courses, payload = {};

    UserDetails.getDegreesBySelectedInstitutes = (selInstitutes, institutes) => {
        let data = {};
        angular.forEach(selInstitutes, (isSelected, institute) => {
            let degrees = [];
            if (!isSelected) { return; }

            angular.forEach(institutes[institute], degree => degrees.push(degree));
            degrees         = _.uniq(degrees, 'name');
            data[institute] = degrees;
        });
        return data;
    };

    UserDetails.getCoursesBySelectedDegrees = (selDegrees, degrees) => {
        let data = {};
        angular.forEach(selDegrees, (isSelected, selDegree) => {
            let selInstitute = selDegree.split('|||')[0];
            selDegree = selDegree.split('|||')[1];
            if (!isSelected) { return; }

            angular.forEach(degrees, (degreeGroup, instituteName) => {
                let courses = [];
                angular.forEach(degreeGroup, degree => {
                    if (degree.name === selDegree && instituteName === selInstitute) {
                        angular.forEach(degree.subjects, course => courses.push(course));
                    }
                });
                if (courses.length) {
                    data[instituteName + '|||' + selDegree] = _.uniq(courses);
                }
            });
        });
        return data;
    };

    UserDetails.saveSelectedData = () => {
        $log.log('Save teacher details payload', payload);
        User.updateUser({
            is_choose_type_finished: true,
            is_teacher             : true,
            degree                 : null,
            institute              : null,
            target_institutes      : payload.institutes
        });
    };

    UserDetails.setDegrees = _degrees => degrees = _degrees;

    UserDetails.getDegrees = () => degrees;

    UserDetails.setCourses = _courses => courses = _courses;

    UserDetails.setPayloadInstitutes = institutes => {
        let hash = {};
        angular.forEach(_.keys(institutes), institute => {
            if (institutes[institute]) {
                hash[institute] = {};
            }
        });
        payload.institutes = hash;
    };

    UserDetails.setPayloadDegrees = (degrees, dummy3rdLevel = false) => {
        angular.forEach(degrees, (isSelected, degree) => {
            if (!isSelected) { return; }
            let institute   = degree.split('|||')[0],
                degree_name = degree.split('|||')[1];
            if (payload.institutes[institute]) {
                payload.institutes[institute][degree_name] = dummy3rdLevel ? ['dummy'] : [];
            }
        });
    };

    return UserDetails;
});