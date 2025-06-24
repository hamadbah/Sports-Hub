const router = require('express').Router();

const Club = require('../models/club');
const Lesson = require('../models/lesson');

// API's / Routes / Main Functionality

router.get('/', async (req,res) => {
    const clubs = await Club.find().populate('owner');
    res.render('clubs/index.ejs', { clubs });
});

// Add New Club
router.get('/new', async (req, res) => {
  const allLessons = await Lesson.find();
  res.render('clubs/new.ejs', { allLessons });
});

router.post('/', async (req, res) => {
    req.body.owner = req.session.user._id;
    if (!Array.isArray(req.body.classes)) {
      req.body.classes = req.body.classes ? [req.body.classes] : [];
    }
    await Club.create(req.body);
    res.redirect('/clubs');
});

// Show One Club
router.get("/:clubId", async (req, res) => {
  const club = await Club.findById(req.params.clubId).populate('owner').populate('classes'); // populate classes objects
  if (!club) {
    return res.render('clubs/show.ejs', { error: 'Club not found', club: null });
  }
  res.render("clubs/show.ejs", { club });
});

// Edit a Club
router.get("/:clubId/edit", async (req, res) => {
  const club = await Club.findById(req.params.clubId).populate('owner');
  const allLessons = await Lesson.find();
  res.render('clubs/edit.ejs', { club, allLessons });
});

router.put('/:clubId', async (req, res) => {
  const currentClub = await Club.findById(req.params.clubId);
  let selectedLessonIds = req.body.classes;
  if (!Array.isArray(selectedLessonIds)) {
      selectedLessonIds = selectedLessonIds ? [selectedLessonIds] : [];
    }
  // Fetch lesson names for selected IDs
    const selectedLessons = await Lesson.find({ _id: { $in: selectedLessonIds } });
    const lessonNames = selectedLessons.map(lesson => lesson.lessonName);

    // Check for duplicate names
    const uniqueNames = new Set(lessonNames);
    if (uniqueNames.size !== lessonNames.length) {
      const allLessons = await Lesson.find();
      return res.render('clubs/edit.ejs', {
        club: currentClub,
        allLessons,
        error: 'Duplicate lesson names are not allowed for the same club.'
      });
    }

    req.body.classes = selectedLessonIds; // ensure it's an array
    await currentClub.updateOne(req.body);
    res.redirect('/clubs');
});

// Delete a Club
router.delete('/:clubId', async (req, res) => {
  const club = await Club.findById(req.params.clubId);
  // Delete all lessons linked to this club
  await Lesson.deleteMany({ _id: { $in: club.classes } });
  await club.deleteOne();
  res.redirect('/clubs');
});



module.exports = router;