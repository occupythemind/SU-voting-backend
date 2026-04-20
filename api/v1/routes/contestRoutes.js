const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contestController');
const isAuthenticated = require('../../../middleware/isAuthenticated');
const { route } = require('./authRoutes');

// PRIVATE: Authenticated Users only
router.get('', isAuthenticated,contestController.listContestCategories);
router.get('/:id/contestants', isAuthenticated, contestController.listCategoryContestants);
router.get('/:id/vote', isAuthenticated, contestController.voteCategoryContestant);
router.get('/:id/unvote', isAuthenticated, contestController.unvoteCategoryContestant);

module.exports = router;
