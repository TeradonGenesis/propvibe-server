const express = require('express');
const router = express.Router();
const scrapperController = require('../controllers/scrapper.controller');

//get the posts
router.get('/topic/:topicId/', scrapperController.scrapPosts);

//post the search
router.post('/search', scrapperController.scrapGoogleSearch);
  

module.exports = router;