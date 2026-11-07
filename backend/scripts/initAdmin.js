import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { Admin } from '../models/Admin.js';

dotenv.config();

export const initializeAdmin = async () => {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.error('❌ Could not connect to MongoDB. Aborting admin initialization.');
      process.exit(1);
    }

    const name = process.env.INITIAL_ADMIN_NAME || 'Murtaza Hassan Bangash';
    const email = (process.env.INITIAL_ADMIN_EMAIL || 'admin@almurtazatkd.com').toLowerCase().trim();
    const password = process.env.INITIAL_ADMIN_PASSWORD;

    if (!password) {
      console.error('❌ INITIAL_ADMIN_PASSWORD environment variable is missing.');
      console.error('👉 Please set INITIAL_ADMIN_PASSWORD in backend/.env before running setup.');
      process.exit(1);
    }

    // Check if admin already exists
    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log(`ℹ️ Admin account [${email}] already exists in database (ID: ${existing._id}).`);
      console.log('Skipping creation to prevent duplicates.');
      process.exit(0);
    }

    // Create new admin
    const newAdmin = new Admin({
      name,
      email,
      password, // Pre-save hook will securely hash with bcrypt
      role: 'superadmin',
      status: 'Active'
    });

    await newAdmin.save();
    console.log('========================================================');
    console.log('🥋 [SUCCESS] Initial Academy Admin created successfully:');
    console.log(`   Name:  ${newAdmin.name}`);
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Role:  ${newAdmin.role}`);
    console.log(`   ID:    ${newAdmin._id}`);
    console.log('========================================================');
    console.log('💡 TIP: For security, you may now clear INITIAL_ADMIN_PASSWORD from your .env');
    process.exit(0);
  } catch (error) {
    console.error('❌ [Error Initializing Admin]:', error.message);
    process.exit(1);
  }
};

// If run directly via node scripts/initAdmin.js
if (process.argv[1].endsWith('initAdmin.js')) {
  initializeAdmin();
}
