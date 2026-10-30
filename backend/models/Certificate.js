import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    certificateNo: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true
    },
    studentName: {
      type: String,
      required: true
    },
    fatherName: {
      type: String,
      required: true
    },
    nationality: {
      type: String,
      default: 'Pakistani'
    },
    unit: {
      type: String,
      default: 'Al Murtaza Shah Taekwondo'
    },
    beltRank: {
      type: String,
      required: true // e.g., "BLUE BELT"
    },
    dob: {
      type: Date
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    citationText: {
      type: String,
      default: 'The above named person has successfully completed the PAKISTAN TAEKWONDO FEDERATION Promotion Test.'
    },
    presidentSignatory: {
      name: {
        type: String,
        default: 'Murtaza Hassan Bangash'
      },
      title: {
        type: String,
        default: 'President KPK Taekwondo Association, 6th Dan Black Belt WTF, 7th Dan Black Belt PTF'
      }
    },
    secretarySignatory: {
      name: {
        type: String,
        default: 'Waqas Ahmad'
      },
      title: {
        type: String,
        default: 'Secretary General KPK Taekwondo Association'
      }
    },
    status: {
      type: String,
      enum: ['Issued', 'Draft'],
      default: 'Issued'
    }
  },
  { timestamps: true }
);

export const Certificate = mongoose.model('Certificate', certificateSchema);
