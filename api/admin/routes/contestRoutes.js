const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contestController');
const isAdmin = require('../../../middleware/isAdmin');

router.post('', isAdmin, contestController.createContestCategory);
router.put('/:id', isAdmin, contestController.updateContestCategory);
router.delete('/:id', isAdmin, contestController.deleteContestCategory);
router.post('/addContestant', isAdmin, contestController.addUserToContest);
router.post('/removeContestant', isAdmin, contestController.removeUserFromContest);
router.get('/results', isAdmin, contestController.listContestResult);
router.get('/categories/:id/results', isAdmin, contestController.getCategoryContestResultVisual);
router.get('/audit-logs', isAdmin, contestController.listAuditLogs);

module.exports = router;
