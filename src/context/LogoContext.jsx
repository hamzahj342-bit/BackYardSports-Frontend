import { createContext, useContext, useState, useEffect } from 'react';
import websiteSettingsApi from '../services/websiteSettingsApi';
import defaultLogo from '../assets/images/backyardsports-logo.svg';

const LogoContext = createContext();

export const useLogo = () => {
  const context = useContext(LogoContext);
  if (!context) {
    throw new Error('useLogo must be used within a LogoProvider');
  }
  return context;
};

function pickLogoSetting(grouped) {
  if (!grouped || typeof grouped !== 'object') return null;
  const buckets = [
    grouped.logo,
    grouped.general,
    ...Object.values(grouped),
  ];
  for (const bucket of buckets) {
    const list = Array.isArray(bucket) ? bucket : bucket ? [bucket] : [];
    const hit = list.find((s) => s?.key === 'website_logo');
    if (hit) return hit;
  }
  return null;
}

function isUsableRemoteLogo(value) {
  if (!value || typeof value !== 'string') return false;
  const v = value.toLowerCase();
  // Reject legacy Charlie Bells / placeholder assets during rebrand
  if (v.includes('charlie') || v.includes('faviconbells') || v.includes('toknxcv4ohdd4v5cm1t5')) {
    return false;
  }
  return (
    v.startsWith('data:image') ||
    v.startsWith('http://') ||
    v.startsWith('https://') ||
    v.startsWith('/') ||
    v.includes('backyardsports')
  );
}

export const LogoProvider = ({ children }) => {
  const [websiteLogo, setWebsiteLogo] = useState(defaultLogo);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebsiteLogo();
  }, []);

  const fetchWebsiteLogo = async () => {
    try {
      setLoading(true);
      const response = await websiteSettingsApi.getWebsiteSettings();

      if (response.success && response.data) {
        const logoSetting = pickLogoSetting(response.data);
        const remote = logoSetting?.value;

        if (isUsableRemoteLogo(remote)) {
          setWebsiteLogo(remote);
        } else {
          setWebsiteLogo(defaultLogo);
        }
      } else {
        setWebsiteLogo(defaultLogo);
      }
    } catch (error) {
      console.error('LogoContext: Error fetching website logo:', error);
      setWebsiteLogo(defaultLogo);
    } finally {
      setLoading(false);
    }
  };

  const updateLogo = (newLogo) => {
    setWebsiteLogo(newLogo || defaultLogo);
  };

  return (
    <LogoContext.Provider value={{ websiteLogo, loading, updateLogo, fetchWebsiteLogo }}>
      {children}
    </LogoContext.Provider>
  );
};

export default LogoContext;
