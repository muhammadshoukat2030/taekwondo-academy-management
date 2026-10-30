import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Student } from './models/Student.js';
import { Attendance } from './models/Attendance.js';
import { FeeLedger } from './models/FeeLedger.js';
import { FeeReceipt } from './models/FeeReceipt.js';
import { Achievement } from './models/Achievement.js';
import { Certificate } from './models/Certificate.js';
import { connectDB } from './config/db.js';

dotenv.config();

const sampleStudents = [
  {
    registrationNo: 'AMS-2026-001',
    fullName: 'Abdul Basit',
    fatherName: 'Qari Sabir',
    dob: new Date('2007-04-12'),
    age: 19,
    gender: 'Male',
    nationalityCast: 'Pakistani / Bangash',
    cnicFormB: '14301-8923412-1',
    phone: '0335-9117230',
    whatsapp: '0335-9117230',
    email: 'abdulbasit.tkd@gmail.com',
    permanentAddress: 'Mohallah Mufti Shah, Near Chogi No. 7, Kohat',
    education: 'FSc Pre-Engineering',
    hasPlayedBefore: true,
    hasIllnessInjury: false,
    medicalNotes: 'Fit and athletic',
    admissionDate: new Date('2024-02-10'),
    fixedMonthlyFee: 1000,
    admissionFee: 1500,
    currentBelt: 'Blue',
    totalPaid: 1000,
    remainingBalance: 0,
    status: 'Active',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    isFaceEnrolled: true,
    fingerprintTemplateId: 'FP-AMS-001',
    isFingerprintEnrolled: true,
    guardianConsent: true,
    instructorSignature: 'Murtaza Hassan Bangash'
  },
  {
    registrationNo: 'AMS-2026-002',
    fullName: 'Muhammad Huzaifa',
    fatherName: 'Tariq Mehmood Bangash',
    dob: new Date('2008-08-15'),
    age: 18,
    gender: 'Male',
    nationalityCast: 'Pakistani / Bangash',
    cnicFormB: '14301-4432190-3',
    phone: '0333-9642011',
    whatsapp: '0333-9642011',
    email: 'huzaifa.bangash@gmail.com',
    permanentAddress: 'KDA Sector 4, Phase 1, Kohat',
    education: 'Matric (Science)',
    hasPlayedBefore: true,
    hasIllnessInjury: false,
    admissionDate: new Date('2024-03-01'),
    fixedMonthlyFee: 1000,
    admissionFee: 1500,
    currentBelt: 'Red',
    totalPaid: 1000,
    remainingBalance: 0,
    status: 'Active',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    isFaceEnrolled: true,
    fingerprintTemplateId: 'FP-AMS-002',
    isFingerprintEnrolled: true,
    guardianConsent: true,
    instructorSignature: 'Murtaza Hassan Bangash'
  },
  {
    registrationNo: 'AMS-2026-003',
    fullName: 'Shahzaib Orakzai',
    fatherName: 'Malik Noor Rehman',
    dob: new Date('2006-11-20'),
    age: 20,
    gender: 'Male',
    nationalityCast: 'Pakistani / Orakzai',
    cnicFormB: '14301-7891234-5',
    phone: '0345-9233400',
    whatsapp: '0345-9233400',
    email: 'shahzaib.orakzai@yahoo.com',
    permanentAddress: 'Bazaar-e-Mustafa, Hangu Road, Kohat',
    education: 'BS Computer Science',
    hasPlayedBefore: true,
    hasIllnessInjury: false,
    admissionDate: new Date('2023-09-15'),
    fixedMonthlyFee: 1200,
    admissionFee: 1500,
    currentBelt: 'Black',
    danRank: '1st Dan',
    totalPaid: 1200,
    remainingBalance: 0,
    status: 'Active',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    isFaceEnrolled: true,
    fingerprintTemplateId: 'FP-AMS-003',
    isFingerprintEnrolled: true,
    guardianConsent: true,
    instructorSignature: 'Murtaza Hassan Bangash'
  },
  {
    registrationNo: 'AMS-2026-004',
    fullName: 'Hamza Afridi',
    fatherName: 'Gulzar Khan Afridi',
    dob: new Date('2009-02-18'),
    age: 17,
    gender: 'Male',
    nationalityCast: 'Pakistani / Afridi',
    cnicFormB: '14301-1249912-7',
    phone: '0315-9988112',
    whatsapp: '0315-9988112',
    email: 'hamza.afridi@gmail.com',
    permanentAddress: 'Jungle Khel, Bannu Road, Kohat',
    education: '10th Class',
    hasPlayedBefore: false,
    hasIllnessInjury: false,
    admissionDate: new Date('2025-01-10'),
    fixedMonthlyFee: 1000,
    admissionFee: 1500,
    currentBelt: 'Green',
    totalPaid: 500,
    remainingBalance: 500,
    status: 'Active',
    photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    isFaceEnrolled: true,
    fingerprintTemplateId: 'FP-AMS-004',
    isFingerprintEnrolled: true,
    guardianConsent: true,
    instructorSignature: 'Murtaza Hassan Bangash'
  },
  {
    registrationNo: 'AMS-2026-005',
    fullName: 'Areeba Bibi',
    fatherName: 'Syed Murtaza Shah',
    dob: new Date('2010-06-05'),
    age: 16,
    gender: 'Female',
    nationalityCast: 'Pakistani / Syed',
    cnicFormB: '14301-6543210-2',
    phone: '0331-5544332',
    whatsapp: '0331-5544332',
    email: 'areeba.syed@gmail.com',
    permanentAddress: 'Abdur Rehman Plaza, Markaz Road, Chogi No. 7, Kohat',
    education: '9th Class',
    hasPlayedBefore: false,
    hasIllnessInjury: false,
    admissionDate: new Date('2025-03-01'),
    fixedMonthlyFee: 1000,
    admissionFee: 1500,
    currentBelt: 'Yellow',
    totalPaid: 500,
    remainingBalance: 1000, // Partial + Previous Baqaya
    status: 'Active',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    isFaceEnrolled: true,
    fingerprintTemplateId: 'FP-AMS-005',
    isFingerprintEnrolled: false,
    guardianConsent: true,
    instructorSignature: 'Murtaza Hassan Bangash'
  },
  {
    registrationNo: 'AMS-2026-006',
    fullName: 'Danyal Khattak',
    fatherName: 'Inam Ullah Khattak',
    dob: new Date('2011-09-14'),
    age: 15,
    gender: 'Male',
    nationalityCast: 'Pakistani / Khattak',
    cnicFormB: '14301-9988776-9',
    phone: '0300-8877665',
    whatsapp: '0300-8877665',
    email: 'danyal.khattak@gmail.com',
    permanentAddress: 'PAF Base Colony, Kohat Cantt',
    education: '8th Grade',
    hasPlayedBefore: false,
    hasIllnessInjury: false,
    admissionDate: new Date('2025-06-15'),
    fixedMonthlyFee: 1000,
    admissionFee: 1500,
    currentBelt: 'White',
    totalPaid: 0,
    remainingBalance: 1000, // Defaulter
    status: 'Active',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    isFaceEnrolled: false,
    fingerprintTemplateId: '',
    isFingerprintEnrolled: false,
    guardianConsent: true,
    instructorSignature: 'Murtaza Hassan Bangash'
  },
  {
    registrationNo: 'AMS-2026-007',
    fullName: 'Bilal Shinwari',
    fatherName: 'Sher Afzal Khan',
    dob: new Date('2008-01-25'),
    age: 18,
    gender: 'Male',
    nationalityCast: 'Pakistani / Shinwari',
    cnicFormB: '14301-2211443-3',
    phone: '0342-9900112',
    whatsapp: '0342-9900112',
    email: 'bilal.shinwari@gmail.com',
    permanentAddress: 'College Town, Kohat',
    education: 'Intermediate',
    hasPlayedBefore: true,
    hasIllnessInjury: false,
    admissionDate: new Date('2024-05-10'),
    fixedMonthlyFee: 1000,
    admissionFee: 1500,
    currentBelt: 'Blue',
    totalPaid: 0,
    remainingBalance: 2000, // Defaulter 2 months
    status: 'Active',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    isFaceEnrolled: true,
    fingerprintTemplateId: 'FP-AMS-007',
    isFingerprintEnrolled: true,
    guardianConsent: true,
    instructorSignature: 'Murtaza Hassan Bangash'
  },
  {
    registrationNo: 'AMS-2026-008',
    fullName: 'Usman Ali Paracha',
    fatherName: 'Zahid Paracha',
    dob: new Date('2009-12-10'),
    age: 17,
    gender: 'Male',
    nationalityCast: 'Pakistani / Paracha',
    cnicFormB: '14301-3322119-1',
    phone: '0334-7766554',
    whatsapp: '0334-7766554',
    email: 'usman.paracha@gmail.com',
    permanentAddress: 'Main Bazaar, Tehsil Road, Kohat',
    education: 'Matric',
    hasPlayedBefore: false,
    hasIllnessInjury: true,
    medicalNotes: 'Mild wrist strain treated last year',
    admissionDate: new Date('2024-11-01'),
    fixedMonthlyFee: 1000,
    admissionFee: 1500,
    currentBelt: 'Yellow',
    totalPaid: 1000,
    remainingBalance: 0,
    status: 'Active',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    isFaceEnrolled: true,
    fingerprintTemplateId: 'FP-AMS-008',
    isFingerprintEnrolled: true,
    guardianConsent: true,
    instructorSignature: 'Murtaza Hassan Bangash'
  }
];

export const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🥋 [Backend Seeder]: Clearing old database collections...');
    await Student.deleteMany({});
    await Attendance.deleteMany({});
    await FeeLedger.deleteMany({});
    await FeeReceipt.deleteMany({});
    await Achievement.deleteMany({});
    await Certificate.deleteMany({});

    console.log('🥋 [Backend Seeder]: Inserting Kohat students...');
    const insertedStudents = await Student.insertMany(sampleStudents);
    console.log(`🥋 [Backend Seeder]: Inserted ${insertedStudents.length} students.`);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const currentMonthYear = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
    const todayStr = now.toISOString().split('T')[0];

    // Seed Receipts starting from 100
    let receiptCounter = 100;

    for (let i = 0; i < insertedStudents.length; i++) {
      const st = insertedStudents[i];
      const monthlyFee = st.fixedMonthlyFee || 1000;
      let paidAmount = 0;
      let status = 'UNPAID';
      let previousBalance = 0;

      if (i <= 2 || i === 7) {
        paidAmount = monthlyFee;
        status = 'PAID';
        previousBalance = 0;
      } else if (i === 3) {
        paidAmount = 500;
        status = 'PARTIAL';
        previousBalance = 0;
      } else if (i === 4) {
        paidAmount = 500;
        status = 'PARTIAL';
        previousBalance = 500;
      } else if (i === 6) {
        paidAmount = 0;
        status = 'UNPAID';
        previousBalance = 1000;
      } else {
        paidAmount = 0;
        status = 'UNPAID';
        previousBalance = 0;
      }

      const totalDue = monthlyFee + previousBalance;
      const remainingBalance = totalDue - paidAmount;

      const ledger = await FeeLedger.create({
        student: st._id,
        monthYear: currentMonthYear,
        monthName: `October ${currentYear}`,
        month: currentMonth,
        year: currentYear,
        monthlyFee,
        admissionFee: 0,
        previousBalance,
        totalDue,
        paidAmount,
        remainingBalance,
        status,
        dueDate: new Date(currentYear, currentMonth - 1, 10),
        lastPaymentDate: paidAmount > 0 ? new Date() : null,
        notes: previousBalance > 0 ? `Carried forward PKR ${previousBalance} previous balance` : 'Monthly Academy Fee'
      });

      if (paidAmount > 0) {
        await FeeReceipt.create({
          receiptNo: receiptCounter++,
          student: st._id,
          date: new Date(),
          billingMonthYear: currentMonthYear,
          studentName: st.fullName,
          fatherName: st.fatherName,
          cellNo: st.phone,
          address: st.permanentAddress,
          monthlyFee: ledger.monthlyFee,
          admissionFee: 0,
          previousBalance,
          totalPayable: totalDue,
          amountReceived: paidAmount,
          remainingBalance,
          paymentMethod: 'Cash',
          receivedBy: 'Instructor Murtaza Hassan Bangash',
          notes: 'Fee deposited at office'
        });
      }
    }

    // Seed Attendance
    for (let day = 1; day <= 28; day++) {
      const dayStr = day.toString().padStart(2, '0');
      const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${dayStr}`;

      for (let i = 0; i < insertedStudents.length; i++) {
        const st = insertedStudents[i];
        let stStatus = 'Present';
        const rand = (day + i * 3) % 11;
        if (rand === 0) stStatus = 'Absent';
        else if (rand === 1) stStatus = 'Leave';
        else if (rand === 2 && day % 4 === 0) stStatus = 'Late';

        const methods = ['FaceRecognition', 'Fingerprint', 'Manual'];
        const method = methods[(day + i) % 3];

        await Attendance.create({
          student: st._id,
          date: dateStr,
          monthYear: currentMonthYear,
          month: currentMonth,
          year: currentYear,
          status: stStatus,
          checkInTime: '05:15 PM',
          method,
          confidenceScore: 0.98
        });
      }
    }

    // Seed today's records
    for (let i = 0; i < 5; i++) {
      const st = insertedStudents[i];
      await Attendance.findOneAndUpdate(
        { student: st._id, date: todayStr },
        {
          student: st._id,
          date: todayStr,
          monthYear: currentMonthYear,
          month: currentMonth,
          year: currentYear,
          status: i === 4 ? 'Leave' : 'Present',
          checkInTime: '05:00 PM',
          method: 'FaceRecognition',
          confidenceScore: 0.99
        },
        { upsert: true }
      );
    }

    // Seed Belt Achievements
    await Achievement.create([
      {
        student: insertedStudents[0]._id, // Abdul Basit
        title: 'Promotion to Blue Belt',
        category: 'BeltPromotion',
        beltPromotedTo: 'Blue',
        date: new Date('2025-08-14'),
        remarks: 'Demonstrated exceptional form in Taegeuk 4 & sparring combinations.'
      },
      {
        student: insertedStudents[0]._id,
        title: 'KPK Inter-District Championship',
        category: 'Tournament',
        medal: 'Gold',
        date: new Date('2025-11-20'),
        venue: 'Kohat Sports Complex',
        remarks: 'Under 58kg Sparring Gold Medalist.'
      },
      {
        student: insertedStudents[1]._id, // Huzaifa
        title: 'Promotion to Red Belt',
        category: 'BeltPromotion',
        beltPromotedTo: 'Red',
        date: new Date('2025-09-01'),
        remarks: 'Mastery over Taegeuk 6 and high-speed spinning kicks.'
      },
      {
        student: insertedStudents[2]._id, // Shahzaib
        title: '1st Dan Black Belt National Test',
        category: 'BeltPromotion',
        beltPromotedTo: 'Black (1st Dan)',
        date: new Date('2025-10-10'),
        venue: 'Pakistan Taekwondo Federation HQ, Islamabad',
        remarks: 'Certified Kukkiwon 1st Dan Black Belt by Grandmaster.'
      }
    ]);

    // Seed Official Certificates
    await Certificate.create([
      {
        certificateNo: 'AMS-PKTKD-2025-0042',
        student: insertedStudents[0]._id,
        studentName: 'Abdul Basit',
        fatherName: 'Qari Sabir',
        nationality: 'Pakistani / Bangash',
        unit: 'Al Murtaza Shah Taekwondo',
        beltRank: 'BLUE BELT',
        dob: insertedStudents[0].dob,
        issueDate: new Date('2025-08-15'),
        citationText:
          'The above named person has successfully completed the PAKISTAN TAEKWONDO FEDERATION BLUE BELT PAKISTAN TAEKWONDO Promotion Test.',
        presidentSignatory: {
          name: 'Murtaza Hassan Bangash',
          title: 'President KPK Taekwondo Association, 6th Dan Black Belt WTF, 7th Dan Black Belt PTF'
        },
        secretarySignatory: {
          name: 'Waqas Ahmad',
          title: 'Secretary General KPK Taekwondo Association'
        },
        status: 'Issued'
      },
      {
        certificateNo: 'AMS-PKTKD-2025-0068',
        student: insertedStudents[1]._id,
        studentName: 'Muhammad Huzaifa',
        fatherName: 'Tariq Mehmood Bangash',
        nationality: 'Pakistani / Bangash',
        unit: 'Al Murtaza Shah Taekwondo',
        beltRank: 'RED BELT',
        dob: insertedStudents[1].dob,
        issueDate: new Date('2025-09-05'),
        citationText:
          'The above named person has successfully completed the PAKISTAN TAEKWONDO FEDERATION RED BELT PAKISTAN TAEKWONDO Promotion Test.',
        presidentSignatory: {
          name: 'Murtaza Hassan Bangash',
          title: 'President KPK Taekwondo Association, 6th Dan Black Belt WTF, 7th Dan Black Belt PTF'
        },
        secretarySignatory: {
          name: 'Waqas Ahmad',
          title: 'Secretary General KPK Taekwondo Association'
        },
        status: 'Issued'
      }
    ]);

    console.log('✅ [Backend Seeder]: Database almurtaza_taekwondo successfully initialized & populated!');
    process.exit(0);
  } catch (error) {
    console.error('❌ [Backend Seeder Error]:', error);
    process.exit(1);
  }
};

if (process.argv[1].endsWith('seed.js')) {
  seedDatabase();
}
