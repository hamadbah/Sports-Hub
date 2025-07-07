const router = require('express').Router();
const Lesson = require('../models/lesson');
const Club = require('../models/club');
const User = require('../models/user');

router.get('/', async (req, res) => {
  const lessons = await Lesson.find();
  res.render('lessons/index.ejs', { lessons });
});

// Instructor Router
router.get('/instructor-page', async (req, res) => {
    const instructorId = req.session.user._id;
    const lessons = await Lesson.find({ instructors: instructorId }).populate('clubs').populate('players');
    res.render('lessons/instructor-page.ejs', { lessons });
});

// Add New Lesson
router.get('/new', async (req, res) => {
  const clubs = await Club.find(); 
  const instructors = await User.find({ role: 'Instructor' });
  res.render('lessons/new.ejs', { error: null, clubs, instructors });
});

router.post('/', async (req, res) => {
  req.body.owner = req.session.user._id;

  if (!Array.isArray(req.body.clubs)) {
    req.body.clubs = req.body.clubs ? [req.body.clubs] : [];
  }

  if (!Array.isArray(req.body.instructors)) {
    req.body.instructors = req.body.instructors ? [req.body.instructors] : [];
  }

  const trimmedName = req.body.lessonName.trim();

  const existing = await Lesson.findOne({
    lessonName: new RegExp(`^${trimmedName}$`, 'i'), clubs: { $in: req.body.clubs }});
  if (existing) {
    const clubs = await Club.find();
    const instructors = await User.find({ role: 'Instructor' });
    return res.render('lessons/new.ejs', {
      error: "Lesson with this name already exists for the selected club.", clubs, instructors
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
  const lesson = await Lesson.findById(req.params.lessonId).populate('clubs').populate('players').populate('instructors');
   const userHasEnrolled = lesson.players.some((user) => (
        user.equals(req.session.user._id) //Compares MongoDB ObjectIds
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
  const lesson = await Lesson.findById(req.params.lessonId).populate('clubs').populate('instructors');
  const clubs = await Club.find();
  const instructors = await User.find({ role: 'Instructor' });
  res.render('lessons/edit.ejs', { lesson, clubs,instructors, error: null });
});

router.put('/:id', async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  const allClubs = await Club.find();
  const {
    lessonName,lessonPrice,lessonType,lessonDuration,lessonInstructions,clubs: newClubId
    } = req.body;
    const oldClubId = lesson.clubs?.toString(); //? mark used to avoid null or undifined lesson.clubs
    // Check for duplicates
    const duplicate = await Lesson.findOne({
      _id: { $ne: req.params.id }, // $ne mean not equal
      lessonName: { $regex: new RegExp(`^${lessonName}$`, 'i') },
      clubs: newClubId
    });
    if (duplicate) {
      return res.render('lessons/edit.ejs', {
        lesson,
        clubs: allClubs,
        instructors,
        error: 'A lesson with this name already exists in the selected club.'
      });
    }
    // Update club associations
    if (oldClubId && oldClubId !== newClubId) {
      await Club.findByIdAndUpdate(oldClubId, { $pull: { classes: req.params.id } });
      await Club.findByIdAndUpdate(newClubId, { $push: { classes: req.params.id } });
    }
    if (!Array.isArray(req.body.instructors)) {
      req.body.instructors = req.body.instructors ? [req.body.instructors] : [];
    }

    
    // Update lesson
    await Lesson.findByIdAndUpdate(req.params.id, {
      lessonName,lessonPrice,lessonType,lessonDuration,lessonInstructions,clubs: newClubId, instructors: req.body.instructors
    });

    return res.redirect('/lessons');

});

// Delete a lesson
router.delete('/:lessonId', async (req, res) => {
  const lesson = await Lesson.findById(req.params.lessonId);
  if (lesson.clubs) {
      await Club.findByIdAndUpdate(
        lesson.clubs,
        { $pull: { classes: lesson._id } }
      );
    }
  // Delete the lesson itself
    await Lesson.findByIdAndDelete(req.params.lessonId);

    res.redirect('/lessons');
});

module.exports = router;
