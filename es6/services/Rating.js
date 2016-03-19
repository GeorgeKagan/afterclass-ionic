angular.module('afterclass.services').factory('Rating', function($rootScope, $firebaseArray, $firebaseObject, MyFirebase) {
    'use strict';

    var Rating = function(fbReplies) {

        this.allReplies = fbReplies;
        this.ratedReply = null;
        this.rateReplyIndex = null;
        this.rating = 0;

        //Find the last tutor reply and it's index
        _.forEachRight(this.allReplies, (reply, i) => {
             if(reply.user !== $rootScope.user.$id) {
                 this.ratedReply = reply;
                 this.rateReplyIndex = i;

                 if(typeof this.ratedReply !== 'undefined') {
                     this.rating = this.ratedReply.rating;
                 }

             }
        });

    };

    Rating.prototype.rate = function(stars) {

        this.rating = stars;

        let tutorRef = MyFirebase.getRef().child('/users/' + this.ratedReply.user); //Load tutor for updating his score
        $firebaseObject(tutorRef).$loaded().then((tutor) => {

            //Update tutors rating
            if(typeof this.ratedReply.rating === 'undefined') { //Was this reply rated already?

                //Init rating object of non existent
                if(typeof tutor.rating === 'undefined') {
                    tutor.rating = {
                        stars: 0,
                        ratedAnswers: 0
                    };
                }

                //Add current rating to tutor
                tutor.rating.stars += stars;
                tutor.rating.ratedAnswers++;

            } else { //Tutor already rated, update the amount of stars

                tutor.rating.stars = tutor.rating.stars - this.ratedReply.rating + stars;

            }

            tutor.$save(); //Done with tutor

            //Rate reply
            this.ratedReply.rating = stars;
            this.allReplies.$save(this.rateReplyIndex);

        });

    };

    Rating.prototype.getRating = function(){
      return this.rating;
    };


    return {
        getInstance: function(post, user) {
            return new Rating(post, user);
        }
    };

});