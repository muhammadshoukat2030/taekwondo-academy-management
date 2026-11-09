import { Achievement } from '../models/Achievement.js';
import { Student } from '../models/Student.js';

export const getAchievements = async (req, res) => {
  try {
    const { studentId, category } = req.query;
    const query = {};
    if (studentId) query.student = studentId;
    if (category) query.category = category;

    const achievements = await Achievement.find(query)
      .populate('student', 'fullName fatherName registrationNo currentBelt photo')
      .sort({ date: -1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: achievements.length,
      data: achievements
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAchievement = async (req, res) => {
  try {
    const {
      studentId,
      student: studentBodyId,
      title,
      category,
      beltPromotedTo,
      promotedBelt,
      previousBelt,
      marks,
      result,
      examiner,
      medal,
      date,
      dateAwarded,
      venue,
      eventOrVenue,
      remarks
    } = req.body;

    const targetStudentId = studentId || studentBodyId;
    if (!targetStudentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    const student = await Student.findById(targetStudentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const finalBelt = beltPromotedTo || promotedBelt || '';
    const finalDate = date || dateAwarded || new Date();
    const finalVenue = venue || eventOrVenue || 'Kohat Sports Complex / Al Murtaza Shah TKD Dojang';

    const achievement = new Achievement({
      student: student._id,
      title: title || (category === 'BeltPromotion' ? `Promotion to ${finalBelt} Belt` : 'Achievement Honor'),
      category: category || 'BeltPromotion',
      previousBelt: previousBelt || student.currentBelt,
      beltPromotedTo: finalBelt,
      marks: marks || '',
      result: result || 'Pass',
      examiner: examiner || 'Murtaza Hassan Bangash (6th Dan WTF)',
      medal: medal || 'None',
      date: finalDate,
      venue: finalVenue,
      remarks: remarks || ''
    });

    await achievement.save();

    // If belt promotion was awarded, automatically update the student's current belt rank
    if (category === 'BeltPromotion' && finalBelt) {
      let beltToSet = finalBelt;
      if (finalBelt.toLowerCase().includes('black')) beltToSet = 'Black';
      else if (finalBelt.toLowerCase().includes('red')) beltToSet = 'Red';
      else if (finalBelt.toLowerCase().includes('blue')) beltToSet = 'Blue';
      else if (finalBelt.toLowerCase().includes('green')) beltToSet = 'Green';
      else if (finalBelt.toLowerCase().includes('yellow')) beltToSet = 'Yellow';
      else if (finalBelt.toLowerCase().includes('white')) beltToSet = 'White';

      student.currentBelt = beltToSet;
      if (finalBelt.toLowerCase().includes('dan')) {
        const match = finalBelt.match(/\d+(?:st|nd|rd|th)?\s*dan/i);
        if (match) student.danRank = match[0];
      }
      await student.save();
    }

    res.status(201).json({
      success: true,
      message: category === 'BeltPromotion'
        ? `Belt promotion to ${finalBelt} recorded successfully for ${student.fullName}`
        : `Achievement "${achievement.title}" recorded successfully`,
      data: achievement,
      student
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndDelete(req.params.id);
    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement record not found' });
    }
    res.json({ success: true, message: 'Achievement deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
