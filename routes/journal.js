var express = require('express');
var router = express.Router() //create router

//import controllers
var entryController = require('../controllers/entryController');
var moodController = require('../controllers/moodController');
var authorController = require('../controllers/authorController');

//entry routes
router.get('/entry/create', entryController.entryCreateGet);
router.post('/entry/create', entryController.entryCreatePost);
router.get('/entry/:id/delete', entryController.entryDeleteGet);
router.post('/entry/:id/delete', entryController.entryDeletePost);
router.get('/entry/:id/edit', entryController.entryUpdateGet);
router.post('/entry/:id/edit', entryController.entryUpdatePost);
router.get('/entry/:id', entryController.entryDetail);
router.get('/entries', entryController.entryList);

//mood routes
router.get('/mood/create', moodController.moodCreateGet);
router.post('/mood/create', moodController.moodCreatePost);
router.get('/mood/:id/delete', moodController.moodDeleteGet);
router.post('/mood/:id/delete', moodController.moodDeletePost);
router.get('/mood/:id/edit', moodController.moodUpdateGet);
router.post('/mood/:id/edit', moodController.moodUpdatePost);
router.get('/mood/:id', moodController.moodDetail);
router.get('/moods', moodController.moodList);

//author routes
router.get('/author/create', authorController.authorCreateGet);
router.post('/author/create', authorController.authorCreatePost);
router.get('/author/:id', authorController.authorDetail);
router.get('/authors', authorController.authorList);


//export router
module.exports = router;