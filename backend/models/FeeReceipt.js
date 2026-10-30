import mongoose from 'mongoose';

const feeReceiptSchema = new mongoose.Schema(
  {
    receiptNo: {
      type: Number,
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
    date: {
      type: Date,
      default: Date.now
    },
    billingMonthYear: {
      type: String,
      required: true
    },
    studentName: {
      type: String,
      required: true
    },
    fatherName: {
      type: String,
      required: true
    },
    cellNo: {
      type: String,
      required: true
    },
    address: {
      type: String,
      default: 'Kohat'
    },
    monthlyFee: {
      type: Number,
      default: 1000
    },
    admissionFee: {
      type: Number,
      default: 0
    },
    previousBalance: {
      type: Number,
      default: 0
    },
    totalPayable: {
      type: Number,
      required: true
    },
    amountReceived: {
      type: Number,
      required: true
    },
    remainingBalance: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'EasyPaisa', 'JazzCash', 'Bank Transfer'],
      default: 'Cash'
    },
    receivedBy: {
      type: String,
      default: 'Instructor Murtaza Hassan Bangash'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export const FeeReceipt = mongoose.model('FeeReceipt', feeReceiptSchema);
