angular.module('afterclass.controllers').

    controller('UserDetailsChooseTypeCtrl', function ($scope, $state, $ionicHistory, User, InstitutePopup) {
        $scope.student = function () {
            User.updateUser({
                is_choose_type_finished : true,
                is_teacher              : false,
                target_institutes       : null
            });
            $state.go('home');
            $ionicHistory.nextViewOptions({disableBack: true});
            InstitutePopup.show();
        };
        $scope.tutor = function () {
            $state.go('userDetails_tutorStep1');
        };
    }).

    controller('UserDetailsTutorStep1Ctrl', function ($scope, $state, $http, TutorDetails) {
        $scope.selInstitutes = {};
        $http.get('http://www.afterclass.org/json/institutes-degrees.json').success(function(data) {
            $scope.institutes = data;
        });
        $scope.submitTutorStep1 = function () {
            var degrees = TutorDetails.getDegreesBySelectedInstitutes($scope.selInstitutes, $scope.institutes);
            TutorDetails.setPayloadInstitutes($scope.selInstitutes);
            TutorDetails.setDegrees(degrees);
            $state.go('userDetails_tutorStep2');
        };
        $scope.isChecked = function(entities) {
            return TutorDetails.isChecked(entities);
        };
    }).

    controller('UserDetailsTutorStep2Ctrl', function ($scope, $state, TutorDetails) {
        $scope.selDegrees   = {};
        $scope.degrees      = TutorDetails.getDegrees();
        $scope.submitTutorStep2 = function () {
            var courses = TutorDetails.getCoursesBySelectedDegrees($scope.selDegrees, $scope.degrees);
            TutorDetails.setPayloadDegrees($scope.selDegrees);
            TutorDetails.setCourses(courses);
            $state.go('userDetails_tutorStep3');
        };
        $scope.isChecked = function(entities) {
            return TutorDetails.isChecked(entities);
        };
    }).

    controller('UserDetailsTutorStep3Ctrl', function ($scope, $state, $ionicHistory, TutorDetails) {
        $scope.selCourses   = {};
        $scope.courses      = TutorDetails.getCourses();
        $scope.submitTutorStep3 = function () {
            TutorDetails.setPayloadCourses($scope.selCourses);
            TutorDetails.saveSelectedData();
            $state.go('home');
            $ionicHistory.nextViewOptions({disableBack: true});
        };
        $scope.isChecked = function(entities) {
            return TutorDetails.isChecked(entities);
        };
    })
;