const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', problemController.getAllProblems);
router.get('/slug/:slug', problemController.getProblemBySlug);
router.get('/:id', problemController.getProblemById);

// Admin routes
router.post('/', authenticate, isAdmin, problemController.createProblem);
router.put('/:id', authenticate, isAdmin, problemController.updateProblem);
router.delete('/:id', authenticate, isAdmin, problemController.deleteProblem);
router.get('/stats', authenticate, isAdmin, async (req, res) => {
  try {
    const totalProblems = await Problem.countDocuments();
    res.json({ totalProblems });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Test cases routes (admin only)
router.get('/:id/testcases', authenticate, isAdmin, problemController.getTestCases);
router.post('/:id/testcases', authenticate, isAdmin, problemController.addTestCase);
router.delete('/:id/testcases/:testCaseId', authenticate, isAdmin, problemController.deleteTestCase);

module.exports = router;