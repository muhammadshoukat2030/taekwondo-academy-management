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
    beltPromotedTo: {
      type: String,
      default: ''
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
