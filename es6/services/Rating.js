angular.module('afterclass.services').factory('Rating', ($rootScope, $q, $firebaseArray, $firebaseObject, MyFirebase) => {
    'use strict';

    let Rating = function(replies) {

        //Fields
        this.replies        = replies;
        this.ratedReply     = null;
        this.rateReplyIndex = null;
        this.rating         = 0;
        this.ratedTutor     = null;
        this._deferred      = $q.defer();
        this.loaded         = this._deferred.promise; //A promise to tell when the rating service was properly loaded

        //Find the last tutor reply and it's index
        _.forEachRight(this.replies, (reply, i) => {
             if (reply.user !== $rootScope.user.$id) {
                this.ratedReply = reply;
                this.rateReplyIndex = i;
                return false; //Found the reply to rate, break
             }
        });

        if (this.ratedReply !== null) {
            //Get current rating if exists
            if (typeof this.ratedReply.rating !== 'undefined') {
                this.rating = this.ratedReply.rating;
            }
            //Get the rated tutor
            let tutorRef = MyFirebase.getRef().child('/users/' + this.ratedReply.user); //Load tutor for updating his score
            $firebaseObject(tutorRef).$loaded().then((tutor) => {
                this._setTutor(tutor);
                this._deferred.resolve();
            });
        } else {
            this._deferred.resolve();
        }
    };

    //Properties
    Rating.prototype._setTutor = function(tutor) {
        this.ratedTutor = tutor;

        if (typeof this.ratedTutor.rating === 'undefined') {
            this.ratedTutor.rating = {
                stars: 0,
                ratedAnswers: 0
            };
        }
    };

    Rating.prototype.getRating = function() {
        return this.rating;
    };

    Rating.prototype.getRatedTutor = function() {
        return this.ratedTutor;
    };

    Rating.prototype.getRatedTutorId = function() {
        if (this.ratedTutor) {
            return this.ratedTutor.$id;
        } else {
            return '';
        }
    };

    Rating.prototype.hasRepliesToRate = function() {
        return this.ratedTutor !== null;
    };

    //Methods
    Rating.prototype.rate = function(stars) {
        this.rating = stars;

        //Update tutors rating
        if (typeof this.ratedReply.rating === 'undefined') { //Was this reply rated already?
            //Add current rating to tutor
            this.ratedTutor.rating.stars += stars;
            this.ratedTutor.rating.ratedAnswers++;
        } else { //Tutor already rated, update the amount of stars
            //Update previous rating with new one
            this.ratedTutor.rating.stars = this.ratedTutor.rating.stars - this.ratedReply.rating + stars;
        }
        this.ratedTutor.$save(); //Done with tutor

        //Rate reply
        this.ratedReply.rating = stars;
        this.replies.$save(this.rateReplyIndex);

    };

    //Return new instance
    return {
        getInstance: post => new Rating(post)
    };
});