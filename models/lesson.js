const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  lessonName: { 
    type: String, 
    required: true 
},
  lessonPrice: { 
    type: Number 
},
  lessonType: { 
    type: String 
},
  lessonDuration: { 
    type: String 
},
lessonInstructions: { 
    type: String 
},
  clubs: { 
    type: mongoose.Schema.Types.ObjectId, ref: 'Club' 
},
instructors: [{ 
    type: mongoose.Schema.Types.ObjectId, ref: 'User' 
}],
  players: [{ 
    type: mongoose.Schema.Types.ObjectId, ref: 'User' 
}]
});

module.exports = mongoose.model('Lesson', lessonSchema);