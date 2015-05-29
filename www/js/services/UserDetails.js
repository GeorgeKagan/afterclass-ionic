angular.module('afterclass.services')
    .factory('TutorDetails', function(UserCollection) {
        var obj = {}, degrees, courses, payload = {};
        obj.getDegreesBySelectedInstitutes = function (selInstitutes, institutes) {
            var data = {};
            angular.forEach(selInstitutes, function (isSelected, institute) {
                var degrees = [];
                if (!isSelected) { return; }
                angular.forEach(institutes[institute], function (degree) {
                    degrees.push(degree);
                });
                degrees = _.uniq(degrees, 'name');
                data[institute] = degrees;
            });
            return data;
        };
        obj.getCoursesBySelectedDegrees = function (selDegrees, degrees) {
            var data = {};
            angular.forEach(selDegrees, function (isSelected, selDegree) {
                if (!isSelected) { return; }
                angular.forEach(degrees, function (degreeGroup, instituteName) {
                    var courses = [];
                    angular.forEach(degreeGroup, function (degree) {
                        if (degree.name === selDegree) {
                            angular.forEach(degree.subjects, function (course) {
                                courses.push(course);
                            });
                        }
                    });
                    if (courses.length) {
                        data[instituteName + ' - ' + selDegree] = _.uniq(courses);
                    }
                });
            });
            return data;
        };
        obj.saveSelectedData = function () {
            console.log('payload', payload);
            UserCollection.updateUser({
                is_choose_type_finished: true,
                is_teacher: true,
                target_institutes: payload.institutes,
                target_degrees: payload.degrees,
                target_courses: payload.courses
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
            payload.institutes = _.keys(institutes);
        };
        obj.setPayloadDegrees = function (degrees) {
            payload.degrees = _.keys(degrees);
        };
        obj.setPayloadCourses = function (courses) {
            payload.courses = _.keys(courses);
        };
        return obj;
    })
;