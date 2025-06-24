const router = require('express').Router();
const isSignedIn = require('../middleware/is-signed-in');
const Lesson = require('../models/lesson');
const Club = require('../models/club');

router.get('/', async (req, res) => {
  const lessons = await Lesson.find();
  res.render('lessons/index.ejs', { lessons });
});

// Add New Lesson
router.get('/new', async (req, res) => {
  const clubs = await Club.find(); 
  res.render('lessons/new.ejs', { error: null, clubs });
});

router.post('/', async (req, res) => {
  req.body.owner = req.session.user._id;

  if (!Array.isArray(req.body.clubs)) {
    req.body.clubs = req.body.clubs ? [req.body.clubs] : [];
  }

  const trimmedName = req.body.lessonName.trim();

  const existing = await Lesson.findOne({
    lessonName: new RegExp(`^${trimmedName}$`, 'i'), clubs: { $in: req.body.clubs }});
  if (existing) {
    const clubs = await Club.find();
    return res.render('lessons/new.ejs', {
      error: "Lesson with this name already exists for the selected club.", clubs
    });
  }
    const lesson = await Lesson.create(req.body);
    const clubId = req.body.clubs;
    if (clubId) {
      await Club.findByIdAndUpdate(clubId, {
        $push: { classes: lesson._id }
      });
    }
    res.redirect('/lessons');
});

// Show One Lesson
router.get('/:lessonId', async (req, res) => {
  const lesson = await Lesson.findById(req.params.lessonId).populate('clubs').populate('players');
   const userHasEnrolled = lesson.players.some((user) => (
        user.equals(req.session.user._id)
    ));

  res.render('lessons/show.ejs', { lesson, userHasEnrolled });
});

// Lesson Enrolled by Player
router.post('/:lessonId/enrolled-by/:userId', async (req,res) => {
    await Lesson.findByIdAndUpdate(req.params.lessonId, {
        $push: {players: req.params.userId}
    });
    res.redirect(`/lessons/${req.params.lessonId}`);
});

// Lesson Withdraw by Player
router.delete('/:lessonId/enrolled-by/:userId', async (req,res) => {
    await Lesson.findByIdAndUpdate(req.params.lessonId, {
        $pull: {players: req.params.userId}
    });
    res.redirect(`/lessons/${req.params.lessonId}`);
});

// Edit a Lesson
router.get('/:lessonId/edit', async (req, res) => {
  const lesson = await Lesson.findById(req.params.lessonId);
  res.render('lessons/edit.ejs', { lesson });
});

router.put('/:lessonId', async (req, res) => {
  await Lesson.findByIdAndUpdate(req.params.lessonId, req.body);
  res.redirect('/lessons');
});

// Delete a lesson
router.delete('/:lessonId', async (req, res) => {
  await Lesson.findByIdAndDelete(req.params.lessonId);
  res.redirect('/lessons');
});

module.exports = router;
