import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/api.js';

export const DEFAULT_ACADEMY_SETTINGS = {
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

const AcademyContext = createContext({
  settings: DEFAULT_ACADEMY_SETTINGS,
  loading: false,
  loadSettings: async () => {},
  updateAcademySettings: async () => {},
  resetAcademySettings: async () => {}
});

export const AcademyProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('tkd_academy_settings');
      if (cached) {
        return { ...DEFAULT_ACADEMY_SETTINGS, ...JSON.parse(cached) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_ACADEMY_SETTINGS;
  });

  const [loading, setLoading] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getSettings();
      if (res && res.success && res.data) {
        setSettings(res.data);
        try {
          localStorage.setItem('tkd_academy_settings', JSON.stringify(res.data));
        } catch {
          // Ignore
        }
      }
    } catch (err) {
      console.warn('Error loading academy settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateAcademySettings = async (newSettings) => {
    const res = await api.updateSettings(newSettings);
    if (res && res.success && res.data) {
      setSettings(res.data);
      try {
        localStorage.setItem('tkd_academy_settings', JSON.stringify(res.data));
      } catch {
        // Ignore
      }
      return res;
    }
    throw new Error(res?.message || 'Failed to update academy settings');
  };

  const resetAcademySettings = async () => {
    const res = await api.resetSettings();
    if (res && res.success && res.data) {
      setSettings(res.data);
      try {
        localStorage.setItem('tkd_academy_settings', JSON.stringify(res.data));
      } catch {
        // Ignore
      }
      return res;
    }
    throw new Error(res?.message || 'Failed to reset academy settings');
  };

  return (
    <AcademyContext.Provider
      value={{
        settings,
        loading,
        loadSettings,
        updateAcademySettings,
        resetAcademySettings
      }}
    >
      {children}
    </AcademyContext.Provider>
  );
};

export const useAcademy = () => {
  const context = useContext(AcademyContext);
  if (!context) {
    throw new Error('useAcademy must be used within an AcademyProvider');
  }
  return context;
};

export default AcademyContext;
