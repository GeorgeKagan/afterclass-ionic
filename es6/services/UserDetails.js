angular.module('afterclass.services').factory('TeacherDetails', ($log, User) => {
    let UserDetails = {}, subjects, courses, payload = {};

    UserDetails.getSubjectsBySelectedClasses = (selClasses, classes) => {
        let data = {};
        angular.forEach(selClasses, (isSelected, classLabel) => {
            let subjects = [];
            if (!isSelected) { return; }

            angular.forEach(classes[classLabel], subject => subjects.push(subject));
            subjects         = _.uniq(subjects, 'name');
            data[classLabel] = subjects;
        });
        return data;
    };

    UserDetails.getCoursesBySelectedSubjects = (selSubjects, subjects) => {
        let data = {};
        angular.forEach(selSubjects, (isSelected, selSubject) => {
            let selClass = selSubject.split('|||')[0];
            selSubject = selSubject.split('|||')[1];
            if (!isSelected) { return; }

            angular.forEach(subjects, (subjectGroup, classLabel) => {
                let courses = [];
                angular.forEach(subjectGroup, subject => {
                    if (subject.name === selSubject && classLabel === selClass) {
                        angular.forEach(subject.subjects, course => courses.push(course));
                    }
                });
                if (courses.length) {
                    data[classLabel + '|||' + selSubject] = _.uniq(courses);
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
            target_institutes      : payload.classes
        });
    };

    UserDetails.setSubjects = _subjects => subjects = _subjects;

    UserDetails.getSubjects = () => subjects;

    UserDetails.setCourses = _courses => courses = _courses;

    UserDetails.setPayloadClasses = classes => {
        let hash = {};
        angular.forEach(_.keys(classes), classLabel => {
            if (classes[classLabel]) {
                hash[classLabel] = {};
            }
        });
        payload.classes = hash;
    };

    UserDetails.setPayloadSubjects = (subjects, dummy3rdLevel = false) => {
        angular.forEach(subjects, (isSelected, subject) => {
            if (!isSelected) { return; }
            let classLabel   = subject.split('|||')[0],
                subjectName = subject.split('|||')[1];
            if (payload.classes[classLabel]) {
                payload.classes[classLabel][subjectName] = dummy3rdLevel ? ['dummy'] : [];
            }
        });
    };

    return UserDetails;
});