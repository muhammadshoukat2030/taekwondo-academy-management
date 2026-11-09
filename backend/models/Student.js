import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    registrationNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    fullName: {
      type: String,
      required: [true, 'Student full name is required'],
      trim: true
    },
    fatherName: {
      type: String,
      required: [true, "Father's name is required"],
      trim: true
    },
    dob: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    age: {
      type: Number,
      required: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male'
    },
    nationalityCast: {
      type: String,
      default: 'Pakistani / Bangash',
      trim: true
    },
    cnicFormB: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true
    },
    whatsapp: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      default: ''
    },
    emergencyContact: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    },
    permanentAddress: {
      type: String,
      required: [true, 'Address is required'],
      default: 'Kohat, KPK'
    },
    education: {
      type: String,
      default: 'Matric'
    },
    hasPlayedBefore: {
      type: Boolean,
      default: false
    },
    hasIllnessInjury: {
      type: Boolean,
      default: false
    },
    medicalNotes: {
      type: String,
      default: ''
    },
    admissionDate: {
      type: Date,
      default: Date.now
    },
    fixedMonthlyFee: {
      type: Number,
      default: 1000
    },
    admissionFee: {
      type: Number,
      default: 1500
    },
    currentBelt: {
      type: String,
      enum: ['White', 'Yellow', 'Green', 'Blue', 'Red', 'Black', '1st Dan', '2nd Dan', '3rd Dan', '4th Dan', '5th Dan', '6th Dan', '7th Dan'],
      default: 'White'
    },
    danRank: {
      type: String,
      default: ''
    },
    totalPaid: {
      type: Number,
      default: 0
    },
    remainingBalance: {
      type: Number,
      default: 1000
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'On Leave'],
      default: 'Active',
      index: true
    },
    photo: {
      type: String,
      default: ''
    },
    faceDescriptor: {
      type: [Number],
      default: []
    },
    isFaceEnrolled: {
      type: Boolean,
      default: false
    },
    fingerprintTemplateId: {
      type: String,
      default: ''
    },
    isFingerprintEnrolled: {
      type: Boolean,
      default: false
    },
    guardianConsent: {
      type: Boolean,
      default: true
    },
    guardianSignature: {
      type: String,
      default: ''
    },
    instructorSignature: {
      type: String,
      default: 'Murtaza Hassan Bangash'
    }
  },
  { timestamps: true }
);

studentSchema.index({ fullName: 'text', fatherName: 'text', phone: 'text' });

export const Student = mongoose.model('Student', studentSchema);
