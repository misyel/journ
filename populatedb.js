// Get arguments passed on command line
var userArgs = process.argv.slice(2);

var async = require('async')

//import models
var Entry = require('./models/entry')
var Mood = require('./models/mood')
var Author = require('./models/author')

//connect to mongoose
var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var entries = []
var moods = []
var authors = []

//create mood instance
function moodCreate(feeling, description, author, cb) {
    moodDetail = {
        feeling: feeling, 
        description: description,
        author: author
    }
    
    var mood = new Mood(moodDetail); //create mood instance
         
    mood.save(function (err) {
      if (err) {
        cb(err, null)
        return
      }
      console.log('New mood: ' + mood);
      moods.push(mood)
      cb(null, mood)
    }  );
  }

//create authors
function authorCreate(firstName, lastName, cb){
    authorDetail = {
        firstName: firstName,
        lastName: lastName
    };

    var author = new Author(authorDetail); //create author instance

    author.save(function (err) {
        if (err) {
          cb(err, null)
          return
        }
        console.log('New Author: ' + author);
        authors.push(author)
        cb(null, author)
      }  );
}

//create entry instance
function entryCreate(title, note, date, author, cb) {
    entryDetail = {
        title: title, 
        note: note, 
        date: date, 
        author: author
     }

    var entry = new Entry(entryDetail);
    
    entry.save(function (err) {
      if (err) {
        cb(err, null)
        return
      }
      //save to db if no err
      console.log('New entry: ' + entry);
      entries.push(entry)
      cb(null, entry)
    }  );
}

//create a bunch of mood instances
function createMoods(cb) {
    async.series([
        (callback) => {
            moodCreate('happy', 'got my license today!', authors[1], callback);
        },
        (callback) => {
            moodCreate('sad', 'failed my license again ):', authors[0], callback);
        },
        (callback) => {
            moodCreate('angry', 'burnt my cookies in the oven', authors[1], callback);
        },
        (callback) => {
            moodCreate('ok', 'another average day',authors[3], callback);
        },
    ], cb)
}

//create a bunch of author instances
function createAuthors(cb) {
    async.series([
        (callback) => {
            authorCreate('kate', 'ballard', callback);
        },
        (callback) => {
            authorCreate('bob', 'dodson', callback);
        },
        (callback) => {
            authorCreate('cody', 'valencia', callback);
        },
        (callback) => {
            authorCreate('kris', 'willis', callback);
        },
    ], cb)
}

//create a bunch of entry instances
function createEntries(cb) {
    async.series([
        (callback) => {
            entryCreate('covid19', '4mil+ cases and counting', 'july 25, 2020', authors[0], callback)
        },
        (callback) => {
            entryCreate('on online learning', 'online learning extended until winter 2021 at least', 'july 5, 2020', authors[3], callback);
        },
        (callback) => {
            entryCreate('BLM', 'placeholder note', 'june 23, 2020', authors[2], callback)
        }
    ], cb)
}


//run functions to moods&entries
async.series([
    createAuthors,
    createMoods,
    createEntries
], 
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    // All done, disconnect from database
    mongoose.connection.close();
});
