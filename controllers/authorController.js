var Author = require('../models/author');
const async = require('async');
var Entry = require('../models/entry');
var Mood = require('../models/mood');


//display authors
exports.authorList = (req, res) => {
    Author.find()
    //.populate('author')
    .sort([['lastName', 'ascending']])
    .exec(function (err, list_authors) {
        if(err) {return next(err)}
        res.render('authorList', {title: 'author list', authors: list_authors});
    })
}

//author details 
exports.authorDetail = (req, res, next) => {
    async.parallel({
        author: function(callback){
            Author.findById(req.params.id) //find author by id
                .exec(callback)
        },
        //find all entries
        author_entries: function(callback){ 
            Entry.find({'author': req.params.id}, 'title')
                .populate('author')
                .exec(callback)
        },
        //find all moods
        author_moods: function(callback){
            Mood.find({'author': req.params.id}, 'feeling')
                .populate('author')
                .exec(callback)
        },
    }, function(err, results){
        if(err) {return next(err); }
        if(results.author==null){ //no author
            var err = new Error('author not found')
            err.status = 404;
            return next(err)
        }
        //successful
        //console.log(results)
        res.render('authorDetail', {title: 'author details', author: results.author, authorEntries: results.author_entries, authorMoods: results.author_moods})
    })
}

//author create on get
exports.authorCreateGet = (req, res) => {
    res.render('authorForm', {title: 'create author'})
}

//handle author create on post
exports.authorCreatePost = (req, res) => {
    res.send('not implemented: author create post');
}