import { Certificate } from '../models/Certificate.js';
import { Student } from '../models/Student.js';

const generateCertNo = async () => {
  const currentYear = new Date().getFullYear();
  const count = await Certificate.countDocuments();
  const serial = (count + 1).toString().padStart(4, '0');
  return `AMS-PKTKD-${currentYear}-${serial}`;
};

export const getCertificates = async (req, res) => {
  try {
    const { studentId } = req.query;
    const query = {};
    if (studentId) query.student = studentId;

    const certs = await Certificate.find(query).populate('student').sort({ issueDate: -1 });
    res.json({ success: true, count: certs.length, data: certs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCertificateById = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id).populate('student');
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }
    res.json({ success: true, data: cert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const issueCertificate = async (req, res) => {
  try {
    const {
      studentId,
      beltRank,
      beltLevel,
      issueDate,
      citationText,
      unit,
      presidentName,
      presidentTitle,
      secretaryName,
      secretaryTitle
    } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const rank = beltRank || beltLevel || (student.currentBelt + ' Belt');
    const certificateNo = await generateCertNo();

    const cert = new Certificate({
      certificateNo,
      student: student._id,
      studentName: student.fullName,
      fatherName: student.fatherName,
      nationality: student.nationalityCast || 'Pakistani',
      unit: unit || 'Al Murtaza Shah Taekwondo',
      beltRank: rank,
      dob: student.dob,
      issueDate: issueDate || new Date(),
      citationText:
        citationText ||
        `The above named person has successfully completed the PAKISTAN TAEKWONDO FEDERATION [${rank}] PAKISTAN TAEKWONDO Promotion Test.`,
      presidentSignatory: {
        name: presidentName || 'Murtaza Hassan Bangash',
        title:
          presidentTitle ||
          'President KPK Taekwondo Association, 6th Dan Black Belt WTF, 7th Dan Black Belt PTF'
      },
      secretarySignatory: {
        name: secretaryName || 'Waqas Ahmad',
        title: secretaryTitle || 'Secretary General KPK Taekwondo Association'
      },
      status: 'Issued'
    });

    await cert.save();

    // Update student belt if requested
    if (rank) {
      const beltClean = rank.replace(' Belt', '').trim();
      const validBelts = ['White', 'Yellow', 'Green', 'Blue', 'Red', 'Black'];
      if (validBelts.includes(beltClean)) {
        student.currentBelt = beltClean;
        await student.save();
      }
    }

    res.status(201).json({
      success: true,
      message: `Official Certificate ${certificateNo} issued successfully`,
      data: cert
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
