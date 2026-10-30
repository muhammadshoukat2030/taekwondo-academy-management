import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true
    },
    monthYear: {
      type: String, // YYYY-MM
      required: true,
      index: true
    },
    month: {
      type: Number,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Leave', 'Late'],
      default: 'Present',
      required: true
    },
    checkInTime: {
      type: String,
      default: () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    },
    method: {
      type: String,
      enum: ['FaceRecognition', 'Fingerprint', 'Manual'],
      default: 'Manual'
    },
    confidenceScore: {
      type: Number,
      default: 1.0
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
