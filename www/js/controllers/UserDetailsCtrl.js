angular.module('afterclass.controllers').

    controller('UserDetailsChooseTypeCtrl', function ($scope, $state, $http, $ionicHistory, UserCollection, InstitutePopup) {
        $scope.student = function () {
            UserCollection.updateUser({
                is_choose_type_finished: true,
                is_teacher: false,
                target_institutes: null,
                target_degrees: null,
                target_courses: null
            });
            $state.go('home');
            $ionicHistory.nextViewOptions({disableBack: true});
            InstitutePopup.show();
        };
        $scope.tutor = function () {
            $state.go('userDetails_tutorStep1');
        };
    }).

    controller('UserDetailsTutorStep1Ctrl', function ($scope, $state, $http, UserCollection, TutorDetails) {
        $scope.selInstitutes = {};
        $http.get('json/institutes-degrees.json').success(function(data) {
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

    controller('UserDetailsTutorStep2Ctrl', function ($scope, $state, $http, UserCollection, TutorDetails) {
        $scope.selDegrees = {};
        $scope.degrees = TutorDetails.getDegrees();
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

    controller('UserDetailsTutorStep3Ctrl', function ($scope, $state, $http, $ionicHistory, UserCollection, TutorDetails) {
        $scope.selCourses = {};
        $scope.courses = TutorDetails.getCourses();
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