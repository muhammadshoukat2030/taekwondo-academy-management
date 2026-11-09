import mongoose from 'mongoose';
import { Student } from '../models/Student.js';
import { FeeLedger } from '../models/FeeLedger.js';
import { Attendance } from '../models/Attendance.js';
import { Achievement } from '../models/Achievement.js';
import { Certificate } from '../models/Certificate.js';

const generateRegNo = async () => {
  const currentYear = new Date().getFullYear();
  const count = await Student.countDocuments();
  const nextNumber = (count + 1).toString().padStart(3, '0');
  return `AMS-${currentYear}-${nextNumber}`;
};

export const getStudents = async (req, res) => {
  try {
    const { search, belt, status } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }
    if (belt && belt !== 'All') {
      query.currentBelt = belt;
    }
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { fatherName: { $regex: search, $options: 'i' } },
        { registrationNo: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(query).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    let student = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      student = await Student.findById(id).lean();
    }
    if (!student) {
      student = await Student.findOne({ registrationNo: id }).lean();
    }
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const [feeLedgers, attendances, achievements, certificates] = await Promise.all([
      FeeLedger.find({ student: student._id }).sort({ year: -1, month: -1 }).lean(),
      Attendance.find({ student: student._id }).sort({ date: -1 }).lean(),
      Achievement.find({ student: student._id }).sort({ date: -1 }).lean(),
      Certificate.find({ student: student._id }).sort({ issueDate: -1 }).lean()
    ]);

    const totalBilled = feeLedgers.reduce((sum, item) => sum + item.totalDue, 0);
    const totalPaid = feeLedgers.reduce((sum, item) => sum + item.paidAmount, 0);
    const totalRemaining = feeLedgers.reduce((sum, item) => sum + item.remainingBalance, 0);

    const totalDaysPresent = attendances.filter(a => a.status === 'Present').length;
    const totalDaysAbsent = attendances.filter(a => a.status === 'Absent').length;
    const totalDaysLeave = attendances.filter(a => a.status === 'Leave').length;

    res.json({
      success: true,
      data: {
        student,
        financialSummary: {
          totalBilled: totalBilled || student.fixedMonthlyFee,
          totalPaid: totalPaid || student.totalPaid || 0,
          totalRemaining: totalRemaining || student.remainingBalance || 0
        },
        attendanceSummary: {
          totalDaysPresent,
          totalDaysAbsent,
          totalDaysLeave,
          totalLogs: attendances.length
        },
        feeLedgers,
        attendances,
        achievements,
        certificates
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createStudent = async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.registrationNo) {
      body.registrationNo = await generateRegNo();
    }

    if (body.dob && !body.age) {
      const birthDate = new Date(body.dob);
      const diff = Date.now() - birthDate.getTime();
      body.age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
    }

    if (body.faceDescriptor && body.faceDescriptor.length > 0) {
      body.isFaceEnrolled = true;
    }
    if (body.fingerprintTemplateId) {
      body.isFingerprintEnrolled = true;
    }

    const monthlyFee = Number(body.fixedMonthlyFee || 1000);
    const admissionFee = Number(body.admissionFee || 1500);
    body.remainingBalance = monthlyFee + admissionFee;
    body.totalPaid = 0;

    const student = new Student(body);
    await student.save();

    // Auto-initialize Current Month Fee Ledger
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const monthYear = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = `${monthNames[currentMonth - 1]} ${currentYear}`;
    const totalDue = monthlyFee + admissionFee;

    const initialLedger = new FeeLedger({
      student: student._id,
      monthYear,
      monthName,
      month: currentMonth,
      year: currentYear,
      monthlyFee,
      admissionFee,
      previousBalance: 0,
      totalDue,
      paidAmount: 0,
      remainingBalance: totalDue,
      status: 'UNPAID',
      notes: 'Initial admission & monthly fee dues'
    });
    await initialLedger.save();

    res.status(201).json({
      success: true,
      message: 'Student registered successfully and ledger initialized',
      data: student,
      ledger: initialLedger
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const body = { ...req.body };

    // Auto calculate age if dob was updated and age is not explicitly set
    if (body.dob && !body.age) {
      const birthDate = new Date(body.dob);
      const diff = Date.now() - birthDate.getTime();
      body.age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
    }

    const updated = await Student.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({
      success: true,
      message: `Student ${updated.fullName} updated successfully`,
      data: updated
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const enrollBiometrics = async (req, res) => {
  try {
    const { id } = req.params;
    const { faceDescriptor, photo, fingerprintTemplateId, isFaceEnrolled, isFingerprintEnrolled } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (faceDescriptor && Array.isArray(faceDescriptor)) {
      student.faceDescriptor = faceDescriptor;
      student.isFaceEnrolled = true;
    } else if (isFaceEnrolled !== undefined) {
      student.isFaceEnrolled = isFaceEnrolled;
    }

    if (photo) {
      student.photo = photo;
    }

    if (fingerprintTemplateId) {
      student.fingerprintTemplateId = fingerprintTemplateId;
      student.isFingerprintEnrolled = true;
    } else if (isFingerprintEnrolled !== undefined) {
      student.isFingerprintEnrolled = isFingerprintEnrolled;
    }

    await student.save();

    res.json({
      success: true,
      message: `Biometrics updated successfully for ${student.fullName}`,
      data: student
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
