angular.module('afterclass.services').factory('Rating', function($rootScope, $firebaseArray, $firebaseObject, MyFirebase) {
    'use strict';

    var Rating = function(fbReplies) {

        //Fields
        this.allReplies = fbReplies;
        this.ratedReply = null;
        this.rateReplyIndex = null;
        this.rating = 0;
        this.ratedTutor = null;

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

        //Get the rated tutor
        let tutorRef = MyFirebase.getRef().child('/users/' + this.ratedReply.user); //Load tutor for updating his score
        $firebaseObject(tutorRef).$loaded().then((tutor) => {
            this._setTutor(tutor);
        });

    };

    //Properties
    Rating.prototype._setTutor = function(tutor) {
        this.ratedTutor = tutor;

        if(typeof this.ratedTutor.rating === 'undefined') {
            this.ratedTutor.rating = {
                stars: 0,
                ratedAnswers: 0
            };
        }
    };

    Rating.prototype.getRating = function(){
        return this.rating;
    };

    Rating.prototype.getRatedTutor = function() {
        return this.ratedTutor;
    };

    //Methods
    Rating.prototype.rate = function(stars) {

        this.rating = stars;

        //Update tutors rating
        if(typeof this.ratedReply.rating === 'undefined') { //Was this reply rated already?

            //Add current rating to tutor
            this.ratedTutor.rating.stars += stars;
            this.ratedTutor.rating.ratedAnswers++;

        } else { //Tutor already rated, update the amount of stars

            this.ratedTutor.rating.stars = this.ratedTutor.rating.stars - this.ratedReply.rating + stars;

        }

        this.ratedTutor.$save(); //Done with tutor

        //Rate reply
        this.ratedReply.rating = stars;
        this.allReplies.$save(this.rateReplyIndex);


    };

    //Return new instance
    return {
        getInstance: function(post, user) {
            return new Rating(post, user);
        }
    };

});