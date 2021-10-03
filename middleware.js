const {campgroundSchema,reviewSchema, UserSchema} = require('./ValidationSchemas');
const Review = require('./models/Reviewmodel');
const Campground = require('./models/campgroundmodel');
const User = require('./models/Usermodel');
const mongoose = require('mongoose');
const ExpressError = require('./utils/ExpressError')


module.exports.ValidateCamp = function (req, res, next) {
    let campground = {...req.body.campground};
    if(req.files){
    const images = req.files.map(f=>({url:f.path,filename:f.filename}));
    campground = {...req.body.campground,images};
    }
    console.log(req.body)
    const { error } = campgroundSchema.validate({campground});
    if(error){
        const msg = error.details.map(err => err.message).join(',')
        throw new ExpressError(msg,404);
    }
    else
    next()
}

module.exports.ValidateId = function(req,res,next){
    if(mongoose.isValidObjectId(req.params.id))
    next();
    else{
        req.flash('error','Invalid campground Id');
        res.redirect('/campgrounds');
    }
}

module.exports.isOwner =  async function (req,res,next){
    try{
        const {id} = req.params;
        let camp = await Campground.findById(id);
        if(camp.author.equals(req.user._id))
        next();
        else{
            req.flash('error','You Shall not pass!');
            res.redirect(`/campgrounds/${id}`);
        }
    }catch(e){
        throw new ExpressError(err.message,501);
    }
}

module.exports.ValidateReview = function (req, res, next) {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(err => err.message).join(',')
        throw new ExpressError(msg,409);
    }
    else
    next()
}

module.exports.isLoggedIn = function(req,res,next){
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error','Would be so kind as to Log in');
        res.redirect('/login');
    }else
    next();
}

module.exports.isReviewOwner =  async function (req,res,next){
    try{
        const {campid,reviewid}= req.params
        const review = await Review.findById(reviewid);
        if(review.author.equals(req.user._id))
        next();
        else{
            req.flash('error','Free Speech! Delete Your Own Revviews..');
            res.redirect(`/campgrounds/${campid}`);
        }
    }catch(e){
    throw new ExpressError(e.message,501);
}
}

module.exports.ValidateUser = function (req, res, next) {
    const { error } = UserSchema.validate(req.body);
    if(error){
        const msg = error.details.map(err => err.message).join(',')
        throw new ExpressError(msg,404);
    }
    else
    next()
}
