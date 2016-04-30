angular.module('afterclass.services').factory('Rating', ($rootScope, $q, $firebaseArray, $firebaseObject, MyFirebase) => {
    'use strict';

    let Rating = function(replies) {

        //Fields
        this.replies        = replies;
        this.ratedReply     = null;
        this.rateReplyIndex = null;
        this.rating         = 0;
        this.ratedTeacher     = null;
        this._deferred      = $q.defer();
        this.loaded         = this._deferred.promise; //A promise to tell when the rating service was properly loaded

        //Find the last teacher reply and it's index
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
            //Get the rated teacher
            let teacherRef = MyFirebase.getRef().child('/users/' + this.ratedReply.user); //Load teacher for updating his score
            $firebaseObject(teacherRef).$loaded().then((teacher) => {
                this._setTeacher(teacher);
                this._deferred.resolve();
            });
        } else {
            this._deferred.resolve();
        }
    };

    //Properties
    Rating.prototype._setTeacher = function(teacher) {
        this.ratedTeacher = teacher;

        if (typeof this.ratedTeacher.rating === 'undefined') {
            this.ratedTeacher.rating = {
                stars: 0,
                ratedAnswers: 0
            };
        }
    };

    Rating.prototype.getRating = function() {
        return this.rating;
    };

    Rating.prototype.getRatedTeacher = function() {
        return this.ratedTeacher;
    };

    Rating.prototype.getRatedTeacherId = function() {
        if (this.ratedTeacher) {
            return this.ratedTeacher.$id;
        } else {
            return '';
        }
    };

    Rating.prototype.hasRepliesToRate = function() {
        return this.ratedTeacher !== null;
    };

    //Methods
    Rating.prototype.rate = function(stars) {
        this.rating = stars;

        //Update teachers rating
        if (typeof this.ratedReply.rating === 'undefined') { //Was this reply rated already?
            //Add current rating to teacher
            this.ratedTeacher.rating.stars += stars;
            this.ratedTeacher.rating.ratedAnswers++;
        } else { //Teacher already rated, update the amount of stars
            //Update previous rating with new one
            this.ratedTeacher.rating.stars = this.ratedTeacher.rating.stars - this.ratedReply.rating + stars;
        }
        this.ratedTeacher.$save(); //Done with teacher

        //Rate reply
        this.ratedReply.rating = stars;
        this.replies.$save(this.rateReplyIndex);

    };

    //Return new instance
    return {
        getInstance: post => new Rating(post)
    };
});