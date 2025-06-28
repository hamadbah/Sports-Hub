// controllers/public-clubs.js
const router = require('express').Router();
const Club = require('../models/club');
const Lesson = require('../models/lesson');

// Public: Show all clubs (no login required)
router.get('/', async (req, res) => {
  const clubs = await Club.find().populate('classes');
  res.render('clubs/public-clubs', { clubs });
});

module.exports = router;
