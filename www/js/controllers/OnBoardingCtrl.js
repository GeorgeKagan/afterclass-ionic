angular.module('afterclass.controllers').controller('OnBoardingCtrl', function ($scope, $state, $ionicHistory,$cordovaPush, $ionicSlideBoxDelegate) {
    'use strict';





    $scope.next = function() {
        $ionicSlideBoxDelegate.next();

       /* alert("asking");
        var sns = new AWS.SNS({
            region: 'us-west-2',
            accessKeyId: 'AKIAIWZPMXE5FSUW7N6A',
            secretAccessKey: '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'
        });

        var iosConfig = {
            "badge": true,
            "sound": true,
            "alert": true
        };

        $cordovaPush.register(iosConfig).then(function(deviceToken) {
            // Success -- send deviceToken to server, and store for future use
            console.log("deviceToken: " + deviceToken);
            alert("deviceToken: " + deviceToken);
            //$http.post("http://server.co/", {user: "Bob", tokenID: deviceToken})
            var params = {
                PlatformApplicationArn: 'arn:aws:sns:us-west-2:859437719678:app/APNS_SANDBOX/afterclass_dev',
                Token: deviceToken
            };
            sns.createPlatformEndpoint(params, function(err, data) {

                q.resolve(data.EndpointArn);
            });
        }, function(err) {
            alert("Registration error: " + err)
        });*/

    };
    $scope.finish = function() {
    //    $ionicSlideBoxDelegate.previous();

        localStorage.setItem('finished_on_boarding', true);
        $ionicHistory.nextViewOptions({disableBack: true});
        $state.go('login');
    };
});
