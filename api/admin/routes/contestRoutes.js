const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contestController');
const isAdmin = require('../../../middleware/isAdmin');
const { route } = require('./authRoutes');

// PRIVATE: Must be logged in
router.post('', isAdmin, contestController.createContestCategory);
router.put('/:id', isAdmin, contestController.updateContestCategory);
router.delete('/:id', isAdmin, contestController.deleteContestCategory);
router.post('/addContestant', isAdmin, contestController.addUserToContest);
router.post('/removeContestant', isAdmin, contestController.removeUserFromContest);

module.exports = router;
