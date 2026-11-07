import mongoose from 'mongoose';

const academySettingsSchema = new mongoose.Schema(
  {
    academyName: {
      type: String,
      required: [true, 'Academy Name is required'],
      trim: true,
      default: 'Al Murtaza Shah Taekwondo Academy'
    },
    shortName: {
      type: String,
      trim: true,
      default: 'Al Murtaza Shah'
    },
    subtitle: {
      type: String,
      trim: true,
      default: 'PTF & KPK Recognized Martial Arts Training Academy'
    },
    recognition: {
      type: String,
      trim: true,
      default: 'PTF Recognized'
    },
    address: {
      type: String,
      required: [true, 'Academy Address is required'],
      trim: true,
      default: 'Abdur Rehman Plaza, Chogi No.7, Kohat'
    },
    city: {
      type: String,
      trim: true,
      default: 'Kohat'
    },
    phone: {
      type: String,
      required: [true, 'Contact Phone Number is required'],
      trim: true,
      default: '0335-9117230'
    },
    whatsapp: {
      type: String,
      trim: true,
      default: '0335-9117230'
    },
    email: {
      type: String,
      trim: true,
      default: 'info@almurtazataekwondo.com'
    },
    website: {
      type: String,
      trim: true,
      default: 'https://almurtazataekwondo.com'
    },
    logo: {
      type: String,
      default: ''
    },
    dashboardHeading: {
      type: String,
      trim: true,
      default: 'Academy Overview Dashboard'
    },
    dashboardSubtitle: {
      type: String,
      trim: true,
      default: 'Al Murtaza Shah Taekwondo • Abdur Rehman Plaza, Chogi No.7, Kohat • PTF/KPK Recognized'
    },
    instructorName: {
      type: String,
      trim: true,
      default: 'Instructor Murtaza Hassan Bangash'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  },
  {
    timestamps: true
  }
);

export const AcademySettings = mongoose.model('AcademySettings', academySettingsSchema);
