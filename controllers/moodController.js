var Mood = require('../models/mood');
const Author = require('../models/author');
const async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

//all moods
exports.moodList = (req, res) => {
    Mood.find()
    .populate('author')
    .exec(function(err, moodList){
        if(err) {return next(err)}
        res.render('moodList', {title: 'moods', moods: moodList})
    })
}

exports.moodDetail = (req, res, next) => {
    async.parallel({
        mood: function(callback){
            Mood.findById(req.params.id)
            .populate('author')
            .exec(callback)
        },
    }, function(err, results){
        if(err) {return next(err)}
        if(results.mood == null){
            var err = new Error('mood not found');
            err.status = 404;
            return next(err);
        }
        //successful
        res.render('moodDetail', {result: results.mood})
    });
}

exports.moodCreateGet = (req, res) => {
    res.render('moodForm', {title: 'add mood'})
}

exports.moodCreatePost = [
    //res.send('not implemented: mood create post');

    //validate form entry
    body('feeling').isLength({min: 1}).trim().withMessage('feeling is required'),
    body('description').isLength({min: 1}).trim().withMessage('description is required'),
    body('firstName').isLength({min: 1}).trim().withMessage('first name is required')
        .isAlphanumeric().withMessage('first name: letters only'),
    body('lastName').isLength({min: 1}).trim().withMessage('last name is required')
        .isAlphanumeric().withMessage('last name: letters only'),


    //sanitize fields
    sanitizeBody('feeling').escape(),
    sanitizeBody('description').escape(),
    sanitizeBody('firstName').escape(),
    sanitizeBody('lastName').escape(),

    //handle req
    (req, res, next) => {

        //get errors
        const errors = validationResult(req);

        //there are errors
        if(!errors.isEmpty()){
            
            //render w/ error msg
            console.log(req.body)
            res.render('moodForm', {title: 'create mood', mood: req.body, errors: errors.array()});
            return;
            
        }
        else{
            //res.send('no error')
            var mood = new Mood({
                feeling: req.body.feeling,
                description: req.body.description,
            })

            //find author
            Author.findOne({firstName: req.body.firstName, lastName: req.body.lastName})
            .exec(function(err,result){
                if(err){next(err)}

                //author doesn't exist
                if(result===null){
                    var author = new Author({
                        firstName: req.body.firstName,
                        lastName: req.body.lastName
                    });
                    author.save(function(err){
                        if(err){return next(err);}
                    })
                    mood.author = author
                    mood.save(function(err){
                        if(err){return next(err);}
                        res.redirect(mood.url); //redirect to new mood page
                    })
                }

                //author exists
                mood.author = result
                mood.save(function(err){
                    if(err){return next(err);}
                    res.redirect(mood.url) //redirect to new mood page
                })
            })
        }

    }

]

exports.moodDeleteGet = (req, res) => {
    //res.send('not implemented: mood delete get');
    async.parallel({
        mood: function(callback){
            Mood.findById(req.params.id)
            .exec(callback)
        },
    }, function(err, results){
        if(err) {return next(err);}
        if(results.mood==null){
            res.redirect('/journal/moods')
        }
        res.render('moodDelete', {title: 'delete mood', mood: results.mood})
    })
}

exports.moodDeletePost = (req, res) => {
    //res.send('not implemented: mood delete post');
    Mood.findByIdAndRemove(req.body.moodid, function(err){
        if(err){return next(err);}
        res.redirect('/journal/moods') //redirect to mood list if successful
    })
}

exports.moodUpdateGet = (req, res) => {
    //res.send('not implemented: mood update get');
    async.parallel({
        mood: function(callback){
            Mood.findById(req.params.id)
            .populate('author')
            .exec(callback);
        },
        author: function(callback){
            Author.find(callback);
        },
    }, function(err, results){
        if(err) {return next(err);}
        if(results.mood==null){
            var err = new Error('mood not found')
            err.status = 404;
            return next(err);
        }
        //success; found entry
        //res.send(results.mood);
        res.render('moodForm', {title: 'update mood', mood: results.mood})
    
    })
}

exports.moodUpdatePost = [
    //res.send('not implemented: mood update post');

    //validate form entry
    body('feeling').isLength({min: 1}).trim().withMessage('feeling is required'),
    body('description').isLength({min: 1}).trim().withMessage('description is required'),
    body('firstName').isLength({min: 1}).trim().withMessage('first name is required')
        .isAlphanumeric().withMessage('first name: letters only'),
    body('lastName').isLength({min: 1}).trim().withMessage('last name is required')
        .isAlphanumeric().withMessage('last name: letters only'),


    //sanitize fields
    sanitizeBody('feeling').escape(),
    sanitizeBody('description').escape(),
    sanitizeBody('firstName').escape(),
    sanitizeBody('lastName').escape(),

    //handle req
    (req, res, next) => {

        //get errors
        const errors = validationResult(req);

        //create new mood w/ updated values
        var mood = new Mood({
            feeling: req.body.feeling,
            description: req.body.description,
            author: req.body.author,
            _id: req.params.id //use old id
        })

        //there are errors
        if(!errors.isEmpty()){
            
            //render w/ error msg
            console.log(req.body)
            res.render('moodForm', {title: 'create mood', mood: req.body, errors: errors.array()});
            return;
        }
        else{

            //find author
            Author.findOne({firstName: req.body.firstName, lastName: req.body.lastName})
            .exec(function(err,result){
                if(err){next(err)}

                //author doesn't exist
                if(result===null){
                    var author = new Author({
                        firstName: req.body.firstName,
                        lastName: req.body.lastName
                    });
                    author.save(function(err){
                        if(err){return next(err);}
                    })
                    mood.save(function(err){
                        if(err){return next(err);}
                    })

                    mood.author = author //set mood author to new author

                    //update mood
                    Mood.findByIdAndUpdate(req.params.id, mood, {}, function(err,result){
                        if(err){return next(err);}

                        //redirect to updated mood
                        res.redirect(result.url);
                    })


                }

                //author exists
                else{

                    mood.author = result

                    //update mood
                    Mood.findByIdAndUpdate(req.params.id, mood, {}, function(err,result){
                        if(err){return next(err);}

                        //redirect to updated mood
                        res.redirect(result.url);
                    })
                }   
            
            })
        }

    }
]