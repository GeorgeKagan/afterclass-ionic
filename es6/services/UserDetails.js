angular.module('afterclass.services').factory('TutorDetails', function(User) {
    var obj = {}, degrees, courses, payload = {};

    obj.getDegreesBySelectedInstitutes = function (selInstitutes, institutes) {
        var data = {};
        angular.forEach(selInstitutes, function (isSelected, institute) {
            var degrees = [];
            if (!isSelected) { return; }
            angular.forEach(institutes[institute], function (degree) {
                degrees.push(degree);
            });
            degrees         = _.uniq(degrees, 'name');
            data[institute] = degrees;
        });
        return data;
    };

    obj.getCoursesBySelectedDegrees = function (selDegrees, degrees) {
        var data = {};
        angular.forEach(selDegrees, function (isSelected, selDegree) {
            var selInstitute = selDegree.split('|||')[0];
            selDegree = selDegree.split('|||')[1];
            if (!isSelected) { return; }
            angular.forEach(degrees, function (degreeGroup, instituteName) {
                var courses = [];
                angular.forEach(degreeGroup, function (degree) {
                    if (degree.name === selDegree && instituteName === selInstitute) {
                        angular.forEach(degree.subjects, function (course) {
                            courses.push(course);
                        });
                    }
                });
                if (courses.length) {
                    data[instituteName + '|||' + selDegree] = _.uniq(courses);
                }
            });
        });
        return data;
    };

    obj.saveSelectedData = function () {
        console.log('Save tutor details payload', payload);
        User.updateUser({
            is_choose_type_finished : true,
            is_teacher              : true,
            degree                  : null,
            institute               : null,
            target_institutes       : payload.institutes
        });
    };

    obj.isChecked = function (entities) {
        var notChecked = true;
        angular.forEach(entities, function (isChecked) {
            if (isChecked) {
                notChecked = false;
            }
        });
        return notChecked;
    };

    obj.setDegrees = function (_degrees) {
        degrees = _degrees;
    };

    obj.getDegrees = function () {
        return degrees;
    };

    obj.setCourses = function (_courses) {
        courses = _courses;
    };

    obj.getCourses = function () {
        return courses;
    };

    obj.setPayloadInstitutes = function (institutes) {
        var hash = {};
        angular.forEach(_.keys(institutes), function (institute) {
            if (institutes[institute]) {
                hash[institute] = {};
            }
        });
        payload.institutes = hash;
    };

    obj.setPayloadDegrees = function (degrees) {
        angular.forEach(degrees, function (isSelected, degree) {
            if (!isSelected) { return; }
            var institute   = degree.split('|||')[0],
                degree_name = degree.split('|||')[1];
            if (payload.institutes[institute]) {
                payload.institutes[institute][degree_name] = [];
            }
        });
    };

    obj.setPayloadCourses = function (courses) {
        angular.forEach(courses, function (isSelected, course) {
            if (!isSelected) { return; }
            var institute   = course.split('|||')[0],
                degree      = course.split('|||')[1],
                course_name = course.split('|||')[2];
            if (payload.institutes[institute] && payload.institutes[institute][degree]) {
                payload.institutes[institute][degree].push(course_name);
            }
        });
    };

    return obj;
});