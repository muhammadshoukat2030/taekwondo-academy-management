import mongoose from 'mongoose';

const feeLedgerSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true
    },
    monthYear: {
      type: String, // e.g. "2026-10"
      required: true,
      index: true
    },
    monthName: {
      type: String, // e.g. "October 2026"
      required: true
    },
    month: {
      type: Number,
      required: true
    },
    year: {
      type: Number,
      required: true
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
    totalDue: {
      type: Number,
      required: true
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    remainingBalance: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['PAID', 'PARTIAL', 'UNPAID', 'OVERDUE'],
      default: 'UNPAID',
      index: true
    },
    dueDate: {
      type: Date,
      default: () => {
        const d = new Date();
        d.setDate(10);
        return d;
      }
    },
    lastPaymentDate: {
      type: Date
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

feeLedgerSchema.index({ student: 1, monthYear: 1 }, { unique: true });

export const FeeLedger = mongoose.model('FeeLedger', feeLedgerSchema);
