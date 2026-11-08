import { Student } from '../models/Student.js';
import { Attendance } from '../models/Attendance.js';
import { FeeLedger } from '../models/FeeLedger.js';

export const getDashboardKPIs = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const currentMonthYear = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

    // Build the date list for the last 7 days
    const dailyAttendanceTrendDates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      dailyAttendanceTrendDates.push({ dateStr, dayLabel });
    }
    const last7DateStrings = dailyAttendanceTrendDates.map(item => item.dateStr);

    // Build the month-year list for the last 6 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueTrendMonths = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = targetDate.getMonth() + 1;
      const y = targetDate.getFullYear();
      const mYear = `${y}-${m.toString().padStart(2, '0')}`;
      const mLabel = `${monthNames[m - 1]} ${y}`;
      revenueTrendMonths.push({ mYear, mLabel });
    }
    const last6MonthYearStrings = revenueTrendMonths.map(item => item.mYear);

    // Execute ALL database queries in parallel with .lean()
    const [
      totalStudents,
      activeStudents,
      inactiveStudents,
      onLeaveStudents,
      todayAttendances,
      ledgers,
      beltCounts,
      last7DaysAttendanceRecords,
      last6MonthsLedgerRecords
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: 'Active' }),
      Student.countDocuments({ status: 'Inactive' }),
      Student.countDocuments({ status: 'On Leave' }),
      Attendance.find({ date: todayStr }).lean(),
      FeeLedger.find({ monthYear: currentMonthYear }).lean(),
      Student.aggregate([
        { $match: { status: { $ne: 'Inactive' } } },
        { $group: { _id: '$currentBelt', count: { $sum: 1 } } }
      ]),
      Attendance.find({ date: { $in: last7DateStrings } }).lean(),
      FeeLedger.find({ monthYear: { $in: last6MonthYearStrings } }).lean()
    ]);

    const attendanceStats = {
      Present: 0,
      Absent: 0,
      Leave: 0,
      Late: 0,
      TotalMarked: todayAttendances.length,
      Unmarked: Math.max(0, activeStudents - todayAttendances.length)
    };
    todayAttendances.forEach(a => {
      if (attendanceStats[a.status] !== undefined) {
        attendanceStats[a.status]++;
      }
    });

    let totalExpectedFee = 0;
    let totalFeeCollected = 0;
    let totalRemainingBalance = 0;
    let paidCount = 0;
    let partialCount = 0;
    let unpaidCount = 0;

    ledgers.forEach(l => {
      totalExpectedFee += l.totalDue;
      totalFeeCollected += l.paidAmount;
      totalRemainingBalance += l.remainingBalance;

      if (l.status === 'PAID') paidCount++;
      else if (l.status === 'PARTIAL') partialCount++;
      else unpaidCount++;
    });

    const beltDistribution = {
      White: 0,
      Yellow: 0,
      Green: 0,
      Blue: 0,
      Red: 0,
      Black: 0
    };
    beltCounts.forEach(b => {
      if (b._id && beltDistribution[b._id] !== undefined) {
        beltDistribution[b._id] = b.count;
      }
    });

    // In-memory grouping for 7-day attendance trend
    const attByDate = {};
    last7DaysAttendanceRecords.forEach(r => {
      if (!attByDate[r.date]) attByDate[r.date] = { Present: 0, Absent: 0 };
      if (r.status === 'Present') attByDate[r.date].Present++;
      else if (r.status === 'Absent') attByDate[r.date].Absent++;
    });

    const dailyAttendanceTrend = dailyAttendanceTrendDates.map(({ dateStr, dayLabel }) => ({
      date: dateStr,
      label: dayLabel,
      Present: attByDate[dateStr]?.Present || 0,
      Absent: attByDate[dateStr]?.Absent || 0
    }));

    // In-memory grouping for 6-month revenue trend
    const ledgersByMonthYear = {};
    last6MonthsLedgerRecords.forEach(item => {
      if (!ledgersByMonthYear[item.monthYear]) {
        ledgersByMonthYear[item.monthYear] = { collected: 0, pending: 0, expected: 0 };
      }
      ledgersByMonthYear[item.monthYear].collected += (item.paidAmount || 0);
      ledgersByMonthYear[item.monthYear].pending += (item.remainingBalance || 0);
      ledgersByMonthYear[item.monthYear].expected += (item.totalDue || 0);
    });

    const revenueTrend = revenueTrendMonths.map(({ mYear, mLabel }) => {
      const stats = ledgersByMonthYear[mYear] || { collected: 0, pending: 0, expected: 0 };
      return {
        monthYear: mYear,
        month: mLabel,
        Collected: stats.collected,
        Pending: stats.pending,
        TotalExpected: stats.expected
      };
    });

    res.json({
      success: true,
      currentMonthYear,
      kpis: {
        students: {
          total: totalStudents,
          active: activeStudents,
          inactive: inactiveStudents,
          onLeave: onLeaveStudents
        },
        todayAttendance: attendanceStats,
        financial: {
          totalExpectedFee,
          totalFeeCollected,
          totalRemainingBalance,
          collectionRate: totalExpectedFee > 0 ? Math.round((totalFeeCollected / totalExpectedFee) * 100) : 0,
          breakdown: {
            paid: paidCount,
            partial: partialCount,
            unpaid: unpaidCount
          }
        }
      },
      visualAnalytics: {
        beltDistribution: Object.entries(beltDistribution).map(([belt, count]) => ({ belt, count })),
        dailyAttendanceTrend,
        revenueTrend
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMonthlyAudit = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetYear = parseInt(year) || now.getFullYear();
    const targetMonth = parseInt(month) || now.getMonth() + 1;
    const monthYear = `${targetYear}-${targetMonth.toString().padStart(2, '0')}`;

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = `${monthNames[targetMonth - 1]} ${targetYear}`;

    // Concurrently fetch students, attendances, and ledgers with .lean()
    const [students, attendances, feeLedgers] = await Promise.all([
      Student.find().sort({ registrationNo: 1 }).lean(),
      Attendance.find({ monthYear }).lean(),
      FeeLedger.find({ monthYear }).lean()
    ]);

    const attMap = {};
    attendances.forEach(att => {
      const sId = att.student.toString();
      if (!attMap[sId]) {
        attMap[sId] = { present: 0, absent: 0, leave: 0, late: 0, total: 0 };
      }
      attMap[sId].total++;
      if (att.status === 'Present') attMap[sId].present++;
      else if (att.status === 'Absent') attMap[sId].absent++;
      else if (att.status === 'Leave') attMap[sId].leave++;
      else if (att.status === 'Late') attMap[sId].late++;
    });

    const feeMap = {};
    feeLedgers.forEach(ledger => {
      feeMap[ledger.student.toString()] = ledger;
    });

    const auditRows = students.map(student => {
      const sId = student._id.toString();
      const att = attMap[sId] || { present: 0, absent: 0, leave: 0, late: 0, total: 0 };
      const ledger = feeMap[sId] || {
        paidAmount: student.totalPaid || 0,
        remainingBalance: student.remainingBalance || student.fixedMonthlyFee || 1000,
        totalDue: (student.fixedMonthlyFee || 1000) + (student.remainingBalance || 0),
        dueDate: new Date(targetYear, targetMonth - 1, 10),
        status: (student.remainingBalance === 0 ? 'PAID' : (student.totalPaid > 0 ? 'PARTIAL' : 'UNPAID'))
      };

      const attendancePercentage = att.total > 0 ? Math.round((att.present / att.total) * 100) : 0;
      const attendanceRatio = `${att.present}/${att.total || 0} Days`;

      return {
        student: {
          _id: student._id,
          registrationNo: student.registrationNo,
          fullName: student.fullName,
          fatherName: student.fatherName,
          phone: student.phone,
          whatsapp: student.whatsapp,
          currentBelt: student.currentBelt,
          photo: student.photo,
          status: student.status
        },
        attendance: {
          presentDays: att.present,
          absentDays: att.absent,
          leaveDays: att.leave,
          lateDays: att.late,
          totalWorkingDays: att.total,
          attendanceRatio,
          attendancePercentage
        },
        fee: {
          totalDue: ledger.totalDue,
          paidAmount: ledger.paidAmount,
          remainingBalance: ledger.remainingBalance,
          dueDate: ledger.dueDate,
          status: ledger.status
        }
      };
    });

    const totalStudentsCount = students.length;
    const totalExpected = auditRows.reduce((sum, r) => sum + r.fee.totalDue, 0);
    const totalCollected = auditRows.reduce((sum, r) => sum + r.fee.paidAmount, 0);
    const totalPending = auditRows.reduce((sum, r) => sum + r.fee.remainingBalance, 0);
    const paidStudents = auditRows.filter(r => r.fee.status === 'PAID').length;
    const partialStudents = auditRows.filter(r => r.fee.status === 'PARTIAL').length;
    const unpaidStudents = auditRows.filter(r => r.fee.status === 'UNPAID').length;

    res.json({
      success: true,
      monthYear,
      monthName,
      summary: {
        totalStudentsCount,
        totalExpected,
        totalCollected,
        totalPending,
        paidStudents,
        partialStudents,
        unpaidStudents,
        collectionRate: totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0
      },
      auditRows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
