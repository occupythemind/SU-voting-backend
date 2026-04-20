const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contestController');
const isAuthenticated = require('../../../middleware/isAuthenticated');

router.get('', isAuthenticated, contestController.listContestCategories);
router.get('/:id/contestants', isAuthenticated, contestController.listCategoryContestants);
router.post('/:id/vote', isAuthenticated, contestController.voteCategoryContestant);
router.post('/:id/unvote', isAuthenticated, contestController.unvoteCategoryContestant);

module.exports = router;
