var Entry = require('../models/entry');
var Author = require('../models/author')
const async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

//all entries
exports.entryList = (req, res) => {
    Entry.find({}, 'title author')
    .populate('author') //replace id w/ author info
    .exec(function (err, entryList){
        if(err) { return next(err)}
        //successful
        //res.send(entryList)
        res.render('entryList', {title: 'entries', entries: entryList})
    })
}

exports.entryDetail = (req, res, next) => {
    async.parallel({
        entry: function(callback){
            Entry.findById(req.params.id)
            .populate('author')
            .exec(callback)
        },
    }, function(err,results) {
        if(err) {return next(err)}
        if(results.entry == null){
            var err = new Error('entry not found');
            err.status = 404;
            return next(err);
        }
        //successful
        res.render('entryDetail', {title: results.entry.title, content: results.entry.note, author: results.entry.author, entry: results.entry})
    });
}

exports.entryCreateGet = (req, res) => {
    res.render('entryForm', {title: 'create entry'})
}

exports.entryCreatePost = [
    //res.send('not implemented: entry create post');

    

    //validate form fields
    body('title').isLength({min: 1}).trim().withMessage('title must be included'),
    body('note').isLength({min: 1}).trim().withMessage('note is required'),
    body('firstName').isLength({min: 1}).trim().withMessage('first name is required')
        .isAlphanumeric().withMessage('first name: letters only'),
    body('lastName').isLength({min: 1}).trim().withMessage('last name is required')
        .isAlphanumeric().withMessage('last name: letters only'),

    //sanitize fields
    sanitizeBody('title').escape(),
    sanitizeBody('note').escape(),
    sanitizeBody('firstName').escape(),
    sanitizeBody('lastName').escape(),

    //handle req 
    (req, res,next) => {

        //get errors from req
        const errors = validationResult(req);

        console.log(errors)

        //there are errors
        if(!errors.isEmpty()){
            
            //render w/ error msg
            console.log(req.body)
            res.render('entryForm', {title: 'create entry', entry: req.body, errors: errors.array()});
            return;
            
        }
        else{
            //res.send('no error')
            var entry = new Entry({
                title: req.body.title,
                note: req.body.note,
                date: new Date()
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
                    entry.author = author
                    entry.save(function(err){
                        if(err){return next(err);}
                        res.redirect(entry.url); //redirect to new entry page
                    })
                }

                //author exists
                entry.author = result
                entry.save(function(err){
                    if(err){return next(err);}
                    res.redirect(entry.url) //redirect to new entry page
                })
            })
        }

    }
    

]

exports.entryDeleteGet = (req, res, next) => {
    //res.send('not implemented: entry delete get');

    async.parallel({
        entry: function(callback){
            Entry.findById(req.params.id)
            .exec(callback)
        },
    }, function(err, results){
        if(err) {return next(err);}
        if(results.entry==null){
            res.redirect('/journal/entries')
        }
        res.render('entryDelete', {title: 'delete entry', entry: results.entry})
    })
}

exports.entryDeletePost = (req, res, next) => {
    //res.send('not implemented: entry delete post');

    //find entry and delete
    Entry.findByIdAndRemove(req.body.entryid, function(err){
        if(err){return next(err);}
        res.redirect('/journal/entries') //redirect to entry list if successful
    })
}

exports.entryUpdateGet = (req, res) => {
    //res.send('not implemented: entry update get');

    async.parallel({
        entry: function(callback){
            Entry.findById(req.params.id)
            .populate('author')
            .exec(callback);
        },
        author: function(callback){
            Author.find(callback);
        },
    }, function(err, results){
        if(err) {return next(err);}
        if(results.entry==null){
            var err = new Error('entry not found')
            err.status = 404;
            return next(err);
        }
        //success; found entry
        res.render('entryForm', {title: 'update entry', entry: results.entry, author: results.author})
    
    })
}

exports.entryUpdatePost = [
    //res.send('not implemented: entry update post');

    //validate form fields
    body('title').isLength({min: 1}).trim().withMessage('title must be included'),
    body('note').isLength({min: 1}).trim().withMessage('note is required'),
    body('firstName').isLength({min: 1}).trim().withMessage('first name is required')
        .isAlphanumeric().withMessage('first name: letters only'),
    body('lastName').isLength({min: 1}).trim().withMessage('last name is required')
        .isAlphanumeric().withMessage('last name: letters only'),

    //sanitize fields
    sanitizeBody('title').escape(),
    sanitizeBody('note').escape(),
    sanitizeBody('firstName').escape(),
    sanitizeBody('lastName').escape(),

    (req, res, next) => {
        
        //get errors
        const errors = validationResult(req);

        //create new entry w/ updated values
        var entry = new Entry({
            title: req.body.title,
            note: req.body.note,
            date: new Date(),
            //author: req.body.author,
            _id: req.params.id //use old id
        });

        if(!errors.isEmpty()){
            //rerender form if there are errors
            res.render('entryForm', {title: 'create entry', entry: req.body, errors: errors.array()});
            return;
        }
        else{
            //check if they updated author

            //find author
            Author.findOne({firstName: req.body.firstName, lastName: req.body.lastName})
            .exec(function(err,result){
                if(err){next(err)}

                //author doesn't exist
                if(result==null){
                    console.log('author doesnt exist')
                    var author = new Author({
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        //_id: req.params.id //use old id
                    });
                    author.save(function(err){
                        if(err){return next(err);}
                    })
                    entry.author = author

                    //update entry
                    Entry.findByIdAndUpdate(req.params.id, entry, {}, function(err, result){
                        if(err){return next(err);}
                        //res.send(entry.author.url)

                        //redirect to updated entry
                        res.redirect(result.url);
                    });

                    
                }

                //author exists
                else{
                    entry.author = result
                    Entry.findByIdAndUpdate(req.params.id, entry, {}, function(err, result){
                        if(err){return next(err);}
        
                        //redirect to updated entry
                        res.redirect(result.url);
                    })
                }


            })
        }

    }
]