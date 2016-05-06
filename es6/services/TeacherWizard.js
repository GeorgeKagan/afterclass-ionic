angular.module('afterclass.services').factory('TeacherWizard', ($log, User) => {
    let TeacherWizard = {}, subjects, payload = {};

    TeacherWizard.setPayloadClasses = classes => {
        let hash = {};
        angular.forEach(_.keys(classes), classLabel => {
            if (classes[classLabel]) {
                hash[classLabel] = {};
            }
        });
        payload.classes = hash;
    };

    TeacherWizard.setPayloadSubjects = (subjects, dummy3rdLevel = false) => {
        angular.forEach(subjects, (isSelected, subject) => {
            if (!isSelected) { return; }
            let classLabel   = subject.split('|||')[0],
                subjectName = subject.split('|||')[1];
            if (payload.classes[classLabel]) {
                payload.classes[classLabel][subjectName] = dummy3rdLevel ? ['dummy'] : [];
            }
        });
    };

    TeacherWizard.getSubjectsBySelectedClasses = (selClasses, classes) => {
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

    TeacherWizard.saveSelectedData = () => {
        $log.log('Save teacher details payload', payload);
        User.updateUser({
            is_choose_type_finished: true,
            is_teacher             : true,
            degree                 : null, // Should be "Subject"
            institute              : null, // Should be "Class"
            target_institutes      : payload.classes
        });
    };

    TeacherWizard.setSubjects = _subjects => subjects = _subjects;

    TeacherWizard.getSubjects = () => subjects;

    return TeacherWizard;
});