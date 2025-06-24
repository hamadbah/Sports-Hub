const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  clubName: { 
    type: String, 
    required: true 
},
  phoneNo: { 
    type: String,
    required: true
},
  clubType: { 
    type: String,
    required: true
},
  openingHours: { 
    type: String,
    required: true
},
  owner: { 
    type: mongoose.Schema.Types.ObjectId, ref: 'User' 
},
  classes: [{ 
    type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' 
}]
});

module.exports = mongoose.model('Club', clubSchema);