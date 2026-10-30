import { FeeReceipt } from '../models/FeeReceipt.js';
import { FeeLedger } from '../models/FeeLedger.js';
import { Student } from '../models/Student.js';

const getNextReceiptNo = async () => {
  const latest = await FeeReceipt.findOne().sort({ receiptNo: -1 });
  return latest ? latest.receiptNo + 1 : 100;
};

export const getFees = async (req, res) => {
  try {
    const { studentId } = req.query;
    const query = {};
    if (studentId) query.student = studentId;

    const receipts = await FeeReceipt.find(query).sort({ receiptNo: -1 });
    res.json({ success: true, count: receipts.length, data: receipts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const collectFee = async (req, res) => {
  try {
    const {
      studentId,
      amountReceived,
      receivedAmount,
      billingMonthYear,
      monthYear,
      paymentMethod,
      receivedBy,
      notes
    } = req.body;

    const amount = Number(amountReceived !== undefined ? amountReceived : receivedAmount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid received amount is required' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const targetMonthYear = billingMonthYear || monthYear || `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`;
    const parts = targetMonthYear.split('-');
    const y = parseInt(parts[0]);
    const m = parseInt(parts[1]);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = `${monthNames[m - 1]} ${y}`;

    let ledger = await FeeLedger.findOne({ student: student._id, monthYear: targetMonthYear });

    if (!ledger) {
      const prevBal = student.remainingBalance || 0;
      const monthlyFee = student.fixedMonthlyFee || 1000;
      const totalDue = monthlyFee + prevBal;

      ledger = new FeeLedger({
        student: student._id,
        monthYear: targetMonthYear,
        monthName,
        month: m,
        year: y,
        monthlyFee,
        admissionFee: 0,
        previousBalance: prevBal,
        totalDue,
        paidAmount: 0,
        remainingBalance: totalDue,
        status: 'UNPAID'
      });
    }

    const newPaidAmount = ledger.paidAmount + amount;
    const newRemainingBalance = Math.max(0, ledger.totalDue - newPaidAmount);

    ledger.paidAmount = newPaidAmount;
    ledger.remainingBalance = newRemainingBalance;
    ledger.lastPaymentDate = new Date();

    if (newRemainingBalance === 0) {
      ledger.status = 'PAID';
    } else if (newPaidAmount > 0) {
      ledger.status = 'PARTIAL';
    } else {
      ledger.status = 'UNPAID';
    }
    await ledger.save();

    // Auto-update student master record Remaining Balance and Total Paid
    student.remainingBalance = newRemainingBalance;
    student.totalPaid = (student.totalPaid || 0) + amount;
    await student.save();

    // Generate Receipt #100+
    const receiptNo = await getNextReceiptNo();
    const receipt = new FeeReceipt({
      receiptNo,
      student: student._id,
      date: new Date(),
      billingMonthYear: targetMonthYear,
      studentName: student.fullName,
      fatherName: student.fatherName,
      cellNo: student.phone,
      address: student.permanentAddress || 'Kohat',
      monthlyFee: ledger.monthlyFee,
      admissionFee: ledger.admissionFee || 0,
      previousBalance: ledger.previousBalance || 0,
      totalPayable: ledger.totalDue,
      amountReceived: amount,
      remainingBalance: newRemainingBalance,
      paymentMethod: paymentMethod || 'Cash',
      receivedBy: receivedBy || 'Instructor Murtaza Hassan Bangash',
      notes: notes || ''
    });

    await receipt.save();

    res.status(201).json({
      success: true,
      message: `Fee of PKR ${amount} collected successfully. Receipt #${receiptNo} generated.`,
      receipt,
      ledger,
      student
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDefaulters = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetYear = parseInt(year) || now.getFullYear();
    const targetMonth = parseInt(month) || now.getMonth() + 1;
    const monthYear = `${targetYear}-${targetMonth.toString().padStart(2, '0')}`;

    const defaulters = await FeeLedger.find({
      monthYear,
      remainingBalance: { $gt: 0 }
    }).populate('student', 'fullName fatherName phone whatsapp registrationNo currentBelt status remainingBalance');

    res.json({
      success: true,
      count: defaulters.length,
      data: defaulters
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFinancialSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetYear = parseInt(year) || now.getFullYear();
    const targetMonth = parseInt(month) || now.getMonth() + 1;
    const monthYear = `${targetYear}-${targetMonth.toString().padStart(2, '0')}`;

    const ledgers = await FeeLedger.find({ monthYear }).populate('student', 'fullName fatherName status phone');

    let totalExpected = 0;
    let totalCollected = 0;
    let totalRemaining = 0;
    let paidCount = 0;
    let partialCount = 0;
    let unpaidCount = 0;

    ledgers.forEach(l => {
      totalExpected += l.totalDue;
      totalCollected += l.paidAmount;
      totalRemaining += l.remainingBalance;

      if (l.status === 'PAID') paidCount++;
      else if (l.status === 'PARTIAL') partialCount++;
      else unpaidCount++;
    });

    res.json({
      success: true,
      monthYear,
      metrics: {
        totalExpected,
        totalCollected,
        totalRemaining,
        paidCount,
        partialCount,
        unpaidCount,
        totalBilledStudents: ledgers.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateMonthlyDues = async (req, res) => {
  try {
    const { month, year } = req.body;
    const now = new Date();
    const targetYear = parseInt(year) || now.getFullYear();
    const targetMonth = parseInt(month) || now.getMonth() + 1;
    const monthYear = `${targetYear}-${targetMonth.toString().padStart(2, '0')}`;

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = `${monthNames[targetMonth - 1]} ${targetYear}`;

    const activeStudents = await Student.find({ status: 'Active' });
    let createdCount = 0;
    let existingCount = 0;

    for (const st of activeStudents) {
      const existing = await FeeLedger.findOne({ student: st._id, monthYear });
      if (existing) {
        existingCount++;
        continue;
      }

      const prevBal = st.remainingBalance || 0;
      const monthlyFee = st.fixedMonthlyFee || 1000;
      const totalDue = monthlyFee + prevBal;

      const newLedger = new FeeLedger({
        student: st._id,
        monthYear,
        monthName,
        month: targetMonth,
        year: targetYear,
        monthlyFee,
        admissionFee: 0,
        previousBalance: prevBal,
        totalDue,
        paidAmount: 0,
        remainingBalance: totalDue,
        status: 'UNPAID',
        notes: prevBal > 0 ? `Carried forward PKR ${prevBal} Baqaya from previous month` : 'Regular monthly fee'
      });

      await newLedger.save();
      createdCount++;
    }

    res.json({
      success: true,
      message: `Billing completed for ${monthName}. Generated ${createdCount} new ledgers (${existingCount} already existed).`,
      createdCount,
      existingCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
