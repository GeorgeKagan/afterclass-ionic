angular.module('afterclass.services').factory('TutorDetails', User => {
    let obj = {}, degrees, courses, payload = {};

    obj.getDegreesBySelectedInstitutes = (selInstitutes, institutes) => {
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

    obj.getCoursesBySelectedDegrees = (selDegrees, degrees) => {
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

    obj.saveSelectedData = () => {
        console.log('Save tutor details payload', payload);
        User.updateUser({
            is_choose_type_finished: true,
            is_teacher             : true,
            degree                 : null,
            institute              : null,
            target_institutes      : payload.institutes
        });
    };

    obj.isChecked = entities => {
        let notChecked = true;
        angular.forEach(entities, isChecked => notChecked = isChecked ? false : true);
        return notChecked;
    };

    obj.setDegrees = _degrees => degrees = _degrees;

    obj.getDegrees = () => degrees;

    obj.setCourses = _courses => courses = _courses;

    obj.getCourses = () => courses;

    obj.setPayloadInstitutes = institutes => {
        let hash = {};
        angular.forEach(_.keys(institutes), institute => {
            if (institutes[institute]) {
                hash[institute] = {};
            }
        });
        payload.institutes = hash;
    };

    obj.setPayloadDegrees = (degrees, dummy3rdLevel = false) => {
        angular.forEach(degrees, (isSelected, degree) => {
            if (!isSelected) { return; }
            let institute   = degree.split('|||')[0],
                degree_name = degree.split('|||')[1];
            if (payload.institutes[institute]) {
                payload.institutes[institute][degree_name] = dummy3rdLevel ? ['dummy'] : [];
            }
        });
    };

    obj.setPayloadCourses = courses => {
        angular.forEach(courses, (isSelected, course) => {
            if (!isSelected) { return; }
            let institute   = course.split('|||')[0],
                degree      = course.split('|||')[1],
                course_name = course.split('|||')[2];
            if (payload.institutes[institute] && payload.institutes[institute][degree]) {
                payload.institutes[institute][degree].push(course_name);
            }
        });
    };

    return obj;
});