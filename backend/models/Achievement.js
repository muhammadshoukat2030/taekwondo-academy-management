import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['BeltPromotion', 'Tournament', 'Medal', 'SpecialAward'],
      default: 'BeltPromotion'
    },
    previousBelt: {
      type: String,
      default: ''
    },
    beltPromotedTo: {
      type: String,
      default: ''
    },
    marks: {
      type: String,
      default: ''
    },
    result: {
      type: String,
      default: 'Pass'
    },
    examiner: {
      type: String,
      default: 'Murtaza Hassan Bangash (6th Dan WTF)'
    },
    medal: {
      type: String,
      enum: ['Gold', 'Silver', 'Bronze', 'None'],
      default: 'None'
    },
    date: {
      type: Date,
      default: Date.now
    },
    venue: {
      type: String,
      default: 'Kohat Sports Complex / Al Murtaza Shah TKD Dojang'
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export const Achievement = mongoose.model('Achievement', achievementSchema);
