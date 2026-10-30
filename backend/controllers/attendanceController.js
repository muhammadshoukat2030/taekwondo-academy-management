import { Attendance } from '../models/Attendance.js';
import { Student } from '../models/Student.js';
import { FeeLedger } from '../models/FeeLedger.js';

export const markAttendance = async (req, res) => {
  try {
    const { studentId, date, status, method, mode, remarks, confidenceScore } = req.body;

    const todayStr = date || new Date().toISOString().split('T')[0];
    const monthYear = todayStr.substring(0, 7);
    const parts = todayStr.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (student.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: `Attendance rejected: ${student.fullName} is currently marked as ${student.status || 'Inactive'}. Attendance can only be recorded for Active students.`
      });
    }

    const checkMethod = method || mode || 'Manual';

    let attendance = await Attendance.findOne({ student: student._id, date: todayStr });
    if (attendance) {
      attendance.status = status || 'Present';
      attendance.method = checkMethod;
      attendance.remarks = remarks || attendance.remarks;
      if (confidenceScore) attendance.confidenceScore = confidenceScore;
      await attendance.save();
    } else {
      attendance = new Attendance({
        student: student._id,
        date: todayStr,
        monthYear,
        month,
        year,
        status: status || 'Present',
        method: checkMethod,
        confidenceScore: confidenceScore || 1.0,
        remarks: remarks || ''
      });
      await attendance.save();
    }

    // Live Fee Status Warning Alert
    const currentLedger = await FeeLedger.findOne({ student: student._id, monthYear });
    let feeAlert = null;
    const remaining = currentLedger ? currentLedger.remainingBalance : (student.remainingBalance || 0);

    if (remaining > 0) {
      feeAlert = {
        hasDues: true,
        remainingBalance: remaining,
        status: currentLedger?.status || 'UNPAID',
        message: `Alert: PKR ${remaining} Fee Pending for this month`
      };
    } else {
      feeAlert = {
        hasDues: false,
        message: 'Fee Fully Paid for current month'
      };
    }

    res.json({
      success: true,
      message: `Attendance marked (${attendance.status}) for ${student.fullName}`,
      data: attendance,
      student: {
        id: student._id,
        fullName: student.fullName,
        fatherName: student.fatherName,
        registrationNo: student.registrationNo,
        currentBelt: student.currentBelt,
        photo: student.photo
      },
      feeAlert
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTodayAttendance = async (req, res) => {
  try {
    const todayStr = req.query.date || new Date().toISOString().split('T')[0];
    const records = await Attendance.find({ date: todayStr }).populate(
      'student',
      'fullName fatherName registrationNo currentBelt photo phone status'
    );

    const counts = {
      Present: 0,
      Absent: 0,
      Leave: 0,
      Late: 0,
      TotalMarked: records.length
    };

    records.forEach(r => {
      if (counts[r.status] !== undefined) {
        counts[r.status]++;
      }
    });

    res.json({
      success: true,
      date: todayStr,
      counts,
      data: records
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const batchMarkAttendance = async (req, res) => {
  try {
    const { date, records } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const monthYear = targetDate.substring(0, 7);
    const parts = targetDate.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);

    // Validate and enforce that only Active students can have attendance recorded
    const targetStudentIds = (records || []).map(r => r.studentId).filter(Boolean);
    const activeStudents = await Student.find({ _id: { $in: targetStudentIds }, status: 'Active' }).select('_id');
    const activeStudentIds = new Set(activeStudents.map(s => s._id.toString()));

    const results = [];
    let skippedCount = 0;
    for (const rec of (records || [])) {
      if (!activeStudentIds.has(rec.studentId?.toString())) {
        skippedCount++;
        continue;
      }
      const updated = await Attendance.findOneAndUpdate(
        { student: rec.studentId, date: targetDate },
        {
          student: rec.studentId,
          date: targetDate,
          monthYear,
          month,
          year,
          status: rec.status,
          method: 'Manual',
          remarks: rec.remarks || ''
        },
        { upsert: true, new: true }
      );
      results.push(updated);
    }

    res.json({
      success: true,
      count: results.length,
      skippedInactive: skippedCount,
      message: `Batch attendance saved for ${results.length} active students${skippedCount > 0 ? ` (${skippedCount} inactive students skipped)` : ''}`,
      data: results
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMonthlyAttendanceReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetYear = parseInt(year) || now.getFullYear();
    const targetMonth = parseInt(month) || now.getMonth() + 1;
    const monthYear = `${targetYear}-${targetMonth.toString().padStart(2, '0')}`;
    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();

    // Fetch and display only Active students for monthly attendance marking
    const students = await Student.find({ status: 'Active' }).sort({ registrationNo: 1 });
    const attendances = await Attendance.find({ monthYear });

    const lookup = {};
    attendances.forEach(att => {
      const sId = att.student.toString();
      if (!lookup[sId]) lookup[sId] = {};
      const dayNum = parseInt(att.date.split('-')[2]);
      lookup[sId][dayNum] = att.status;
    });

    const matrix = students.map(student => {
      const sId = student._id.toString();
      const studentDays = lookup[sId] || {};
      let presentCount = 0;
      let absentCount = 0;
      let leaveCount = 0;
      let lateCount = 0;

      const dailyRecords = {};
      for (let day = 1; day <= daysInMonth; day++) {
        const st = studentDays[day] || '-';
        dailyRecords[day] = st;
        if (st === 'Present') presentCount++;
        else if (st === 'Absent') absentCount++;
        else if (st === 'Leave') leaveCount++;
        else if (st === 'Late') lateCount++;
      }

      const totalRecordedDays = presentCount + absentCount + leaveCount + lateCount;
      const attendanceRatio = totalRecordedDays > 0 ? `${presentCount}/${totalRecordedDays}` : '0/0';
      const attendancePercentage = totalRecordedDays > 0 ? Math.round((presentCount / totalRecordedDays) * 100) : 0;

      return {
        student: {
          _id: student._id,
          registrationNo: student.registrationNo,
          fullName: student.fullName,
          fatherName: student.fatherName,
          currentBelt: student.currentBelt,
          photo: student.photo
        },
        dailyRecords,
        presentCount,
        absentCount,
        leaveCount,
        lateCount,
        totalRecordedDays,
        attendanceRatio,
        attendancePercentage
      };
    });

    res.json({
      success: true,
      monthYear,
      daysInMonth,
      totalStudents: students.length,
      data: matrix
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
