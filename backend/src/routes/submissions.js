const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { authenticate, isAdmin } = require('../middleware/auth');

// RUN CODE (test với custom input)
router.post('/run', authenticate, submissionController.runCode);

// Existing routes
router.post('/', authenticate, submissionController.submitSolution);
router.get('/my', authenticate, submissionController.getUserSubmissions);
router.get('/:id', authenticate, submissionController.getSubmissionStatus);
router.get('/admin/all', authenticate, isAdmin, submissionController.getAllSubmissions);

module.exports = router;