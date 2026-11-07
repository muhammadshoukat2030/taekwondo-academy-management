import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAcademy, DEFAULT_ACADEMY_SETTINGS } from '../../context/AcademyContext.jsx';
import {
  Building2,
  Image as ImageIcon,
  Eye,
  Save,
  RotateCcw,
  X,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Phone,
  MessageSquare,
  Mail,
  Globe,
  MapPin,
  Sparkles,
  Palette,
  Sun,
  Moon
} from 'lucide-react';

export const AcademySettingsView = () => {
  const { colors, mode, setMode } = useTheme();
  const { settings, updateAcademySettings, resetAcademySettings } = useAcademy();

  // Local form state for live editing and preview
  const [formData, setFormData] = useState({
    academyName: '',
    shortName: '',
    subtitle: '',
    recognition: '',
    address: '',
    city: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    logo: '',
    dashboardHeading: '',
    dashboardSubtitle: '',
    instructorName: ''
  });

  const [activeSubTab, setActiveSubTab] = useState('info'); // 'info' | 'branding' | 'appearance'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }
  const fileInputRef = useRef(null);

  // Sync form state when saved settings change or on initial load
  useEffect(() => {
    if (settings) {
      setFormData({
        academyName: settings.academyName || '',
        shortName: settings.shortName || '',
        subtitle: settings.subtitle || '',
        recognition: settings.recognition || 'PTF Recognized',
        address: settings.address || '',
        city: settings.city || 'Kohat',
        phone: settings.phone || '',
        whatsapp: settings.whatsapp || '',
        email: settings.email || '',
        website: settings.website || '',
        logo: settings.logo || '',
        dashboardHeading: settings.dashboardHeading || 'Academy Overview Dashboard',
        dashboardSubtitle: settings.dashboardSubtitle || '',
        instructorName: settings.instructorName || 'Instructor Murtaza Hassan Bangash'
      });
    }
  }, [settings]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Dynamically auto-generate dashboard subtitle if user hasn't explicitly customized it
      if (name === 'academyName' || name === 'address' || name === 'recognition') {
        const acName = name === 'academyName' ? value : prev.academyName;
        const addr = name === 'address' ? value : prev.address;
        const recog = name === 'recognition' ? value : prev.recognition;
        updated.dashboardSubtitle = `${acName} • ${addr} • ${recog}`;
      }

      return updated;
    });
  };

  // Logo file upload handler
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, SVG, WebP).', 'error');
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size must be less than 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({
        ...prev,
        logo: event.target.result
      }));
      showToast('Academy logo loaded in preview. Click "Save Changes" to apply.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({
      ...prev,
      logo: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showToast('Logo removed from preview.');
  };

  const handleCancel = () => {
    if (settings) {
      setFormData({
        academyName: settings.academyName || '',
        shortName: settings.shortName || '',
        subtitle: settings.subtitle || '',
        recognition: settings.recognition || 'PTF Recognized',
        address: settings.address || '',
        city: settings.city || 'Kohat',
        phone: settings.phone || '',
        whatsapp: settings.whatsapp || '',
        email: settings.email || '',
        website: settings.website || '',
        logo: settings.logo || '',
        dashboardHeading: settings.dashboardHeading || 'Academy Overview Dashboard',
        dashboardSubtitle: settings.dashboardSubtitle || '',
        instructorName: settings.instructorName || 'Instructor Murtaza Hassan Bangash'
      });
      showToast('Changes cancelled. Restored previously saved information.');
    }
  };

  const handleResetToDefaults = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset all Academy Settings to system defaults?\n\n• Academy Name will return to "Al Murtaza Shah Taekwondo Academy"\n• Recognition will return to "PTF Recognized"\n• Address & Phone will return to default Kohat headquarters.'
    );
    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      await resetAcademySettings();
      showToast('Academy settings successfully restored to system defaults.');
    } catch (err) {
      showToast(err.message || 'Failed to reset academy settings.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Input Validation
    if (!formData.academyName.trim()) {
      showToast('Academy Name is required.', 'error');
      return;
    }

    if (!formData.address.trim()) {
      showToast('Academy Address is required.', 'error');
      return;
    }

    if (!formData.phone.trim()) {
      showToast('Contact Phone Number is required.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateAcademySettings(formData);
      showToast('Academy settings and branding successfully saved and applied system-wide!');
    } catch (err) {
      console.error('Save error:', err);
      showToast(err.message || 'Failed to save academy settings.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-10">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl border shadow-xl flex items-center gap-2 text-xs font-semibold animate-fade-in ${
            toast.type === 'error'
              ? 'bg-rose-600 text-white border-rose-700'
              : 'bg-emerald-600 text-white border-emerald-700'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 lg:p-4 rounded-xl border shadow-xs transition-all"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.border
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span
              className="p-1.5 rounded-lg border flex items-center justify-center bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300"
            >
              <Building2 className="w-4 h-4" />
            </span>
            <h1
              className="text-[20px] sm:text-[22px] font-bold tracking-tight"
              style={{ color: colors.textHeading }}
            >
              Academy Settings & Branding
            </h1>
            <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700 uppercase tracking-wider">
              DYNAMIC SYNC
            </span>
          </div>
          <p
            className="text-[12px] sm:text-[13px] font-normal mt-0.5 leading-relaxed"
            style={{ color: colors.textSecondary }}
          >
            Manage academy identification, recognition status, address, contact details, and custom branding across the entire portal.
          </p>
        </div>

        {/* Global Save / Cancel Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-3 py-1.5 rounded-lg text-[12px] font-medium border transition hover:opacity-80 disabled:opacity-50 cursor-pointer"
            style={{
              backgroundColor: colors.bgSecondary,
              borderColor: colors.border,
              color: colors.textPrimary
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleResetToDefaults}
            disabled={isSubmitting}
            className="px-3 py-1.5 rounded-lg text-[12px] font-medium border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 transition hover:bg-rose-100 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            title="Reset to original Al Murtaza Shah defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-3.5 py-1.5 rounded-lg text-white text-[12.5px] font-semibold flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-white" />
            <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b pb-2.5 border-slate-300 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveSubTab('info')}
          className="px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
          style={{
            backgroundColor: activeSubTab === 'info' ? '#2563EB' : 'transparent',
            color: activeSubTab === 'info' ? '#FFFFFF' : colors.textSecondary,
            border: activeSubTab === 'info' ? '1px solid #2563EB' : '1px solid ' + colors.border
          }}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Academy Information</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('branding')}
          className="px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
          style={{
            backgroundColor: activeSubTab === 'branding' ? '#2563EB' : 'transparent',
            color: activeSubTab === 'branding' ? '#FFFFFF' : colors.textSecondary,
            border: activeSubTab === 'branding' ? '1px solid #2563EB' : '1px solid ' + colors.border
          }}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Branding & Logo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('appearance')}
          className="px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
          style={{
            backgroundColor: activeSubTab === 'appearance' ? '#2563EB' : 'transparent',
            color: activeSubTab === 'appearance' ? '#FFFFFF' : colors.textSecondary,
            border: activeSubTab === 'appearance' ? '1px solid #2563EB' : '1px solid ' + colors.border
          }}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Color & Theme Mode</span>
        </button>
      </div>

      {/* LIVE PREVIEW BANNER (Section C) */}
      <div
        className="rounded-xl p-3.5 sm:p-4 border shadow-xs space-y-3 transition-all"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.border
        }}
      >
        <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: colors.border }}>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-[14px] font-semibold tracking-tight" style={{ color: colors.textHeading }}>
              Live System Preview (Real-Time Synchronized View)
            </h3>
          </div>
          <span
            className="text-[11px] font-normal px-2 py-0.5 rounded border"
            style={{
              backgroundColor: colors.bgSecondary,
              borderColor: colors.border,
              color: colors.textSecondary
            }}
          >
            Shows how Header & Dashboard will look after saving
          </span>
        </div>

        {/* 1. Header Preview Box */}
        <div className="space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: colors.textSecondary }}>
            1. Global Top Header Preview:
          </div>
          <div
            className="p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              {formData.logo ? (
                <img
                  src={formData.logo}
                  alt="Academy Logo"
                  className="w-9 h-9 rounded-lg object-contain border p-0.5 flex-shrink-0"
                  style={{ borderColor: colors.border }}
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white text-lg flex-shrink-0 shadow-xs">
                  🥋
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[14.5px] font-bold tracking-tight" style={{ color: colors.textHeading }}>
                    {formData.academyName || 'Al Murtaza Shah Taekwondo Academy'}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700 uppercase tracking-wider">
                    {formData.recognition || 'PTF Recognized'}
                  </span>
                </div>
                <div className="text-[11.5px] font-normal truncate mt-0.5" style={{ color: colors.textSecondary }}>
                  {formData.address || 'Abdur Rehman Plaza, Chogi No.7, Kohat'} • {formData.phone || '0335-9117230'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-center">
              <span className="px-2 py-1 rounded text-[11px] font-semibold bg-blue-600 text-white shadow-2xs">
                + Admission
              </span>
            </div>
          </div>
        </div>

        {/* 2. Dashboard Header Preview Box */}
        <div className="space-y-1 pt-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: colors.textSecondary }}>
            2. Dashboard Overview Banner Preview:
          </div>
          <div
            className="p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
            style={{
              backgroundColor: colors.bgSecondary,
              borderColor: colors.border
            }}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🥋</span>
                <span className="text-[17px] font-bold tracking-tight" style={{ color: colors.textHeading }}>
                  {formData.dashboardHeading || 'Academy Overview Dashboard'}
                </span>
                <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded border bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700">
                  LIVE
                </span>
              </div>
              <p className="text-[12px] font-normal mt-0.5" style={{ color: colors.textSecondary }}>
                {formData.dashboardSubtitle || `${formData.academyName} • ${formData.address} • ${formData.recognition}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FORM SECTIONS */}
      <form onSubmit={handleSave} className="space-y-4">
        {/* TAB A: ACADEMY INFORMATION */}
        {activeSubTab === 'info' && (
          <div
            className="p-4 sm:p-5 rounded-xl border shadow-xs space-y-4 transition-all"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <div className="flex items-center gap-2 pb-2.5 border-b" style={{ borderColor: colors.border }}>
              <Building2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-[15px] font-semibold tracking-tight" style={{ color: colors.textHeading }}>
                Official Academy Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Academy Full Name */}
              <div className="md:col-span-2">
                <label className="block text-[12px] font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Academy Full Name *
                </label>
                <input
                  type="text"
                  required
                  name="academyName"
                  value={formData.academyName}
                  onChange={handleInputChange}
                  placeholder="e.g. Al Murtaza Shah Taekwondo Academy"
                  className="w-full px-3 py-2 rounded-lg border text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>

              {/* Short Academy Name */}
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Short Academy Name / Acronym
                </label>
                <input
                  type="text"
                  name="shortName"
                  value={formData.shortName}
                  onChange={handleInputChange}
                  placeholder="e.g. Al Murtaza Shah / AMS TKD"
                  className="w-full px-3 py-2 rounded-lg border text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
                <span className="text-[11px] mt-0.5 block" style={{ color: colors.textSecondary }}>
                  Displayed in sidebar brand and mobile drawer
                </span>
              </div>

              {/* Recognition Status */}
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Affiliation / Recognition Status *
                </label>
                <input
                  type="text"
                  name="recognition"
                  value={formData.recognition}
                  onChange={handleInputChange}
                  placeholder="e.g. PTF Recognized / KPK Recognized"
                  className="w-full px-3 py-2 rounded-lg border text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
                <span className="text-[11px] mt-0.5 block" style={{ color: colors.textSecondary }}>
                  Displayed in the top navigation badge and certificates
                </span>
              </div>

              {/* Academy Subtitle / Description */}
              <div className="md:col-span-2">
                <label className="block text-[12px] font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Academy Subtitle / Slogan
                </label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  placeholder="e.g. PTF & KPK Recognized Martial Arts Training Academy"
                  className="w-full px-3 py-2 rounded-lg border text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>

              {/* Academy Address */}
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Academy Street Address *
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g. Abdur Rehman Plaza, Chogi No.7"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                    style={{
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: colors.textPrimary }}>
                  City / Location
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g. Kohat, Khyber Pakhtunkhwa"
                  className="w-full px-3 py-2 rounded-lg border text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Contact Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. 0335-9117230"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                    style={{
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: colors.textPrimary }}>
                  WhatsApp Alert Number
                </label>
                <div className="relative">
                  <MessageSquare className="w-3.5 h-3.5 absolute left-3 top-3 text-emerald-500" />
                  <input
                    type="text"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="e.g. 0335-9117230"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                    style={{
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>
              </div>

              {/* Official Email */}
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. info@almurtazataekwondo.com"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                    style={{
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Website URL
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="e.g. https://almurtazataekwondo.com"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                    style={{
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>
              </div>

              {/* Head Instructor Name */}
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Chief Instructor / Administrator Name
                </label>
                <input
                  type="text"
                  name="instructorName"
                  value={formData.instructorName}
                  onChange={handleInputChange}
                  placeholder="e.g. Instructor Murtaza Hassan Bangash"
                  className="w-full px-3 py-2 rounded-lg border text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>

              {/* Dashboard Heading Customizer */}
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Dashboard Main Heading
                </label>
                <input
                  type="text"
                  name="dashboardHeading"
                  value={formData.dashboardHeading}
                  onChange={handleInputChange}
                  placeholder="e.g. Academy Overview Dashboard"
                  className="w-full px-3 py-2 rounded-lg border text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>

              {/* Dashboard Subtitle Customizer */}
              <div className="md:col-span-2">
                <label className="block text-[12px] font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Dashboard Subtitle Information
                </label>
                <input
                  type="text"
                  name="dashboardSubtitle"
                  value={formData.dashboardSubtitle}
                  onChange={handleInputChange}
                  placeholder="e.g. Al Murtaza Shah Taekwondo • Abdur Rehman Plaza, Chogi No.7, Kohat • PTF/KPK Recognized"
                  className="w-full px-3 py-2 rounded-lg border text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
                <span className="text-[11px] mt-0.5 block" style={{ color: colors.textSecondary }}>
                  This text displays directly below the main dashboard heading
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB B: ACADEMY BRANDING & LOGO */}
        {activeSubTab === 'branding' && (
          <div
            className="p-4 sm:p-5 rounded-xl border shadow-xs space-y-4 transition-all"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <div className="flex items-center gap-2 pb-2.5 border-b" style={{ borderColor: colors.border }}>
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <h3 className="text-[15px] font-semibold tracking-tight" style={{ color: colors.textHeading }}>
                Academy Logo & Visual Identity
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Logo Preview & Action Column */}
              <div
                className="p-4 rounded-xl border flex flex-col items-center justify-center text-center space-y-3"
                style={{
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border
                }}
              >
                <div className="text-[12px] font-semibold" style={{ color: colors.textHeading }}>
                  Current Active Logo
                </div>

                <div
                  className="w-28 h-28 rounded-2xl border-2 flex items-center justify-center p-2 overflow-hidden shadow-xs relative group"
                  style={{
                    backgroundColor: colors.bgCard,
                    borderColor: colors.primary
                  }}
                >
                  {formData.logo ? (
                    <img
                      src={formData.logo}
                      alt="Academy Logo Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <span className="text-3xl">🥋</span>
                      <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider text-slate-500">
                        No Logo
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                    id="logo-upload-input"
                  />
                  <label
                    htmlFor="logo-upload-input"
                    className="px-3 py-1.5 rounded-lg text-white text-[12px] font-medium bg-blue-600 hover:bg-blue-700 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-white" />
                    <span>{formData.logo ? 'Change Logo' : 'Upload Logo'}</span>
                  </label>

                  {formData.logo && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="p-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition cursor-pointer"
                      title="Remove Logo (fall back to martial arts emblem)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-[11px] leading-relaxed" style={{ color: colors.textSecondary }}>
                  Recommended format: transparent PNG or SVG. Max size: 5MB. Will automatically adapt to sidebar and header.
                </p>
              </div>

              {/* Branding Details Column */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-[12px] font-medium mb-1" style={{ color: colors.textPrimary }}>
                    Display Name in Sidebar & Receipts
                  </label>
                  <input
                    type="text"
                    name="shortName"
                    value={formData.shortName}
                    onChange={handleInputChange}
                    placeholder="e.g. AL MURTAZA SHAH"
                    className="w-full px-3 py-2 rounded-lg border text-[13px] font-semibold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                    style={{
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium mb-1" style={{ color: colors.textPrimary }}>
                    Sub-Brand Tagline in Sidebar
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="e.g. TAEKWONDO POS & ERP"
                    className="w-full px-3 py-2 rounded-lg border text-[13px] uppercase tracking-wide focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                    style={{
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>

                <div
                  className="p-3.5 rounded-lg border space-y-2 text-[12px]"
                  style={{
                    backgroundColor: colors.bgSecondary,
                    borderColor: colors.border
                  }}
                >
                  <div className="font-semibold flex items-center gap-1.5" style={{ color: colors.textHeading }}>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>How branding propagates automatically:</span>
                  </div>
                  <ul className="space-y-1 pl-4 list-disc text-[11.5px]" style={{ color: colors.textSecondary }}>
                    <li><strong>Global Top Header:</strong> Uses the uploaded logo next to the academy full name and recognition status.</li>
                    <li><strong>Sidebar Navigation:</strong> Replaces the default martial arts emblem with your crisp logo.</li>
                    <li><strong>Fee Receipts:</strong> Dynamically stamps the academy name, address, and phone onto dual-part printed slips.</li>
                    <li><strong>Belt Promotion Certificates:</strong> Embeds the official unit name and recognition credentials.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB C: THEME & COLOR MODE */}
        {activeSubTab === 'appearance' && (
          <div
            className="p-4 sm:p-5 rounded-xl border shadow-xs space-y-4 transition-all"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <div className="flex items-center gap-2 pb-2.5 border-b" style={{ borderColor: colors.border }}>
              <Palette className="w-4 h-4 text-blue-600" />
              <h3 className="text-[15px] font-semibold tracking-tight" style={{ color: colors.textHeading }}>
                Application Display & Color Mode
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Light Mode Card */}
              <div
                onClick={() => setMode('light')}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                  mode === 'light' ? 'ring-2 ring-blue-500 shadow-md' : 'opacity-80 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: mode === 'light' ? '#2563EB' : colors.border
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Sun className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-[14px] text-slate-900">Light Mode (Default)</span>
                    </div>
                    {mode === 'light' && (
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-600 text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-slate-600 leading-relaxed">
                    Modern POS Navy layout with deep navy sidebar, crisp white card surfaces, slate borders, and high contrast typography.
                  </p>
                </div>
              </div>

              {/* Dark Mode Card */}
              <div
                onClick={() => setMode('dark')}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                  mode === 'dark' ? 'ring-2 ring-blue-500 shadow-md' : 'opacity-80 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: '#172033',
                  borderColor: mode === 'dark' ? '#3B82F6' : colors.border
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-900/60 text-blue-300 flex items-center justify-center">
                        <Moon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-[14px] text-white">Dark Mode (Midnight Slate)</span>
                    </div>
                    {mode === 'dark' && (
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-600 text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-slate-300 leading-relaxed">
                    Low eye-strain dark theme with midnight surfaces, high-contrast crisp text (`#F8FAFC`), and vibrant cobalt highlights.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Sticky Action Bar */}
        <div
          className="p-3.5 rounded-xl border flex items-center justify-between gap-3"
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.border
          }}
        >
          <div className="flex items-center gap-2 text-[12px]" style={{ color: colors.textSecondary }}>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Only authenticated administrators can modify academy information</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-lg text-[12px] font-medium border transition hover:opacity-80 disabled:opacity-50 cursor-pointer"
              style={{
                backgroundColor: colors.bgSecondary,
                borderColor: colors.border,
                color: colors.textPrimary
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg text-white text-[12.5px] font-semibold flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-white" />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AcademySettingsView;
