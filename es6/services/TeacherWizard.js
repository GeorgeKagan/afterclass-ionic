angular.module('afterclass.services').factory('TeacherWizard', ($rootScope, $log, User) => {
    let TeacherWizard = {}, subjects, payload = {};

    // CLASSES

    TeacherWizard.ifEditSelectChosenClasses = selClasses => {
        if ($rootScope.user.target_institutes) {
            Object.keys($rootScope.user.target_institutes).forEach(inst => {
                if (Object.keys($rootScope.user.target_institutes[inst]).length) {
                    selClasses[inst] = true;
                }
            });
        }
    };

    TeacherWizard.selectAllClasses = (classes, selClasses, isAllBtnSelected) => {
        Object.keys(classes).forEach(inst => selClasses[inst] = isAllBtnSelected);
    };

    TeacherWizard.updateSelectAllClassesBtnState = (classes, selClasses, allBtn) => {
        allBtn.isAllBtnSelected = Object.keys(classes).length === _.filter(selClasses).length;
    };

    TeacherWizard.setPayloadClasses = classes => {
        let hash = {};
        angular.forEach(_.keys(classes), classLabel => {
            if (classes[classLabel]) {
                hash[classLabel] = {};
            }
        });
        payload.classes = hash;
    };

    // SUBJECTS

    TeacherWizard.ifEditSelectChosenSubjects = (selSubjects) => {
        if ($rootScope.user.target_institutes) {
            Object.keys($rootScope.user.target_institutes).forEach(inst => {
                Object.keys($rootScope.user.target_institutes[inst]).forEach(subject => {
                    if ($rootScope.user.target_institutes[inst][subject].length) {
                        selSubjects[inst + '|||' + subject] = true;
                    }
                });
            });
        }
    };

    TeacherWizard.selectAllSubjects = (subjects, selSubjects, isAllBtnSelected) => {
        Object.keys(subjects).forEach(grade => {
            subjects[grade].forEach(subject => {
                selSubjects[grade + '|||' + subject.name] = isAllBtnSelected
            });
        });
    };

    TeacherWizard.updateSelectAllSubjectsBtnState = (subjects, selSubjects, allBtn) => {
        let count = 0;
        Object.keys(subjects).forEach(item => count += subjects[item].length);
        allBtn.isAllBtnSelected = count === _.filter(selSubjects).length;
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

    TeacherWizard.setSubjects = _subjects => subjects = _subjects;

    TeacherWizard.getSubjects = () => subjects;

    // COMMON

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

    return TeacherWizard;
});