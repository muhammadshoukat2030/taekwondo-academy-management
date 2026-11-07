import { AcademySettings } from '../models/AcademySettings.js';

// Default Academy Settings values as defined by requirement
export const DEFAULT_SETTINGS = {
  academyName: 'Al Murtaza Shah Taekwondo Academy',
  shortName: 'Al Murtaza Shah',
  subtitle: 'PTF & KPK Recognized Martial Arts Training Academy',
  recognition: 'PTF Recognized',
  address: 'Abdur Rehman Plaza, Chogi No.7, Kohat',
  city: 'Kohat',
  phone: '0335-9117230',
  whatsapp: '0335-9117230',
  email: 'info@almurtazataekwondo.com',
  website: 'https://almurtazataekwondo.com',
  logo: '',
  dashboardHeading: 'Academy Overview Dashboard',
  dashboardSubtitle: 'Al Murtaza Shah Taekwondo • Abdur Rehman Plaza, Chogi No.7, Kohat • PTF/KPK Recognized',
  instructorName: 'Instructor Murtaza Hassan Bangash'
};

/**
 * @desc Get Academy Settings (Singleton)
 * @route GET /api/settings
 * @access Public / Admin
 */
export const getSettings = async (req, res) => {
  try {
    let settings = await AcademySettings.findOne();

    if (!settings) {
      settings = await AcademySettings.create(DEFAULT_SETTINGS);
    }

    return res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('❌ [Settings Controller] Error fetching settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve academy settings',
      error: error.message
    });
  }
};

/**
 * @desc Update Academy Settings
 * @route PUT /api/settings
 * @access Protected (Admin only)
 */
export const updateSettings = async (req, res) => {
  try {
    const {
      academyName,
      shortName,
      subtitle,
      recognition,
      address,
      city,
      phone,
      whatsapp,
      email,
      website,
      logo,
      dashboardHeading,
      dashboardSubtitle,
      instructorName
    } = req.body;

    // Validation
    if (!academyName || !academyName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Academy Name is required.'
      });
    }

    if (!address || !address.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Academy Address is required.'
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Contact Phone Number is required.'
      });
    }

    let settings = await AcademySettings.findOne();

    const updateData = {
      academyName: academyName.trim(),
      shortName: (shortName || academyName.split(' ')[0] || 'AMS').trim(),
      subtitle: (subtitle || '').trim(),
      recognition: (recognition || 'PTF Recognized').trim(),
      address: address.trim(),
      city: (city || 'Kohat').trim(),
      phone: phone.trim(),
      whatsapp: (whatsapp || phone).trim(),
      email: (email || '').trim(),
      website: (website || '').trim(),
      logo: logo !== undefined ? logo : (settings ? settings.logo : ''),
      dashboardHeading: (dashboardHeading || 'Academy Overview Dashboard').trim(),
      dashboardSubtitle: (dashboardSubtitle || `${academyName} • ${address} • ${recognition}`).trim(),
      instructorName: (instructorName || 'Instructor Murtaza Hassan Bangash').trim(),
      updatedBy: req.admin ? req.admin._id : undefined
    };

    if (settings) {
      settings = await AcademySettings.findByIdAndUpdate(
        settings._id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    } else {
      settings = await AcademySettings.create(updateData);
    }

    return res.status(200).json({
      success: true,
      message: 'Academy settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('❌ [Settings Controller] Error updating settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update academy settings',
      error: error.message
    });
  }
};

/**
 * @desc Reset Academy Settings to System Defaults
 * @route POST /api/settings/reset
 * @access Protected (Admin only)
 */
export const resetSettings = async (req, res) => {
  try {
    let settings = await AcademySettings.findOne();

    const resetData = {
      ...DEFAULT_SETTINGS,
      updatedBy: req.admin ? req.admin._id : undefined
    };

    if (settings) {
      settings = await AcademySettings.findByIdAndUpdate(
        settings._id,
        { $set: resetData },
        { new: true }
      );
    } else {
      settings = await AcademySettings.create(resetData);
    }

    return res.status(200).json({
      success: true,
      message: 'Academy settings restored to system defaults',
      data: settings
    });
  } catch (error) {
    console.error('❌ [Settings Controller] Error resetting settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset academy settings',
      error: error.message
    });
  }
};
