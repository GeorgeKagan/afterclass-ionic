angular.module('afterclass.services').factory('Rating', function($rootScope, $firebaseArray, MyFirebase, User) {
    'use strict';

    var Rating = function(fbReplies) {

        this.allReplies = fbReplies;
        this.tutorReplies = _.filter(this.allReplies,function(r){ return r.user !== $rootScope.user.$id; });
        this.lastTutorReply = _.reverse(_.sortBy(this.tutorReplies, function(r) { return r.create_date; }))[0];

        console.log('Rating instantiated for reply ',this.lastTutorReply);

    };

    Rating.prototype.rate = function(stars) {


        //Rate reply
        this.lastTutorReply.rating = stars;
        this.allReplies.$save(0).then(function(res){ //TODO: Instead of 0, find the actual id of the reply!!
           console.log('Rating saved!', res);
        });

        //Update tutors rating
    };

    Rating.prototype.ratedUser = function() {
      //TODO: Return the currently being rated
    };

    return {
        getInstance: function(post, user) {
            return new Rating(post, user);
        }
    };

});