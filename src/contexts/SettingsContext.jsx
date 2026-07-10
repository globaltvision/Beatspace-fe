import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import SettingsAPI from '../services/settings.service';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    site_title: 'Beatspace',
    site_logo: '/assets/logo1.png',
    dark_mode: true,
    retro_mode: false,
    language: 'English'
  });
  const [loading, setLoading] = useState(true);
  const initialLoadDone = React.useRef(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await SettingsAPI.get();
      if (res.data.data) {
        setSettings(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      // Only flip the loading flag on the very first fetch.
      // Subsequent re-fetches (e.g. on section change) are silent background
      // refreshes — setting loading=false on an already-false value still triggers
      // a re-render in every consumer, which is the root cause of navigation lag.
      if (!initialLoadDone.current) {
        initialLoadDone.current = true;
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    // Re-fetch whenever asset management page fires settings-changed event
    const handler = () => fetchSettings();
    window.addEventListener("settings-changed", handler);
    return () => window.removeEventListener("settings-changed", handler);
  }, [fetchSettings]);

  useEffect(() => {
    if (settings.site_title) {
      document.title = settings.site_title;
    }
  }, [settings.site_title]);

  useEffect(() => {
    if (!settings.font_family) return;

    const root = document.documentElement;
    root.classList.add('fonts-loading');

    const loadSelectedFont = async () => {
      try {
        let fontFamily = 'Vision Font';
        let src = '/fonts/VisionFont-Regular.otf';

        if (settings.font_family === 'Alexandria') {
          fontFamily = 'Alexandria';
          src = '/fonts/Alexandria-Regular.ttf';
        } else if (settings.font_family === 'Vision Regular') {
          fontFamily = 'Vision';
          src = '/fonts/Vision-Regular.otf';
        } else if (settings.font_family === 'Press Start 2P') {
          // Press Start 2P is imported via @fontsource in CSS; no manual load required
          fontFamily = 'Press Start 2P';
          src = null;
        } else if (settings.font_family === 'System Font') {
          // System font - no loading necessary
          fontFamily = 'system-ui';
          src = null;
        }

        if (src) {
          // Use FontFace API to preload the font so we avoid FOUT/FOIT flashes
          const font = new FontFace(fontFamily, `url(${src})`);
          await font.load();
          document.fonts.add(font);
        }

        let fontVal = `${fontFamily}, sans-serif`;
        if (settings.font_family === 'Press Start 2P') {
          fontVal = '"Press Start 2P", cursive';
        } else if (settings.font_family === 'System Font') {
          fontVal = 'system-ui, sans-serif';
        }

        document.documentElement.style.setProperty('--global-font-family', fontVal);
        root.classList.remove('fonts-loading');
        root.classList.add('fonts-loaded');
      } catch (err) {
        console.error('Font load failed:', err);
        root.classList.remove('fonts-loading');
        root.classList.add('fonts-loaded');
      }
    };

    loadSelectedFont();
  }, [settings.font_family]);


  return (
    <SettingsContext.Provider value={{ settings, fetchSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
