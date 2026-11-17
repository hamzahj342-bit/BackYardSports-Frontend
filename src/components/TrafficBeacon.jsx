import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/themeApi';

const VISITOR_KEY = 'bys_vid';
const RECORDED_DAY_KEY = 'bys_vid_recorded';

const ensureVisitorKey = () => {
  try {
    let key = localStorage.getItem(VISITOR_KEY);
    if (!key) {
      key =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `v_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(VISITOR_KEY, key);
    }
    return key;
  } catch {
    return null;
  }
};

const todayKey = () => new Date().toISOString().slice(0, 10);

const wantsDebug = () => {
  try {
    return new URLSearchParams(window.location.search).has('debugTraffic');
  } catch {
    return false;
  }
};

/**
 * Records one unique storefront visit per browser per day.
 * Uses /traffic/visit (not /ping — ad-blockers often drop "ping" URLs).
 */
const TrafficBeacon = () => {
  const location = useLocation();
  const sentForDay = useRef(null);

  useEffect(() => {
    const path = location.pathname || '';
    if (path.startsWith('/admin')) return;

    const visitorKey = ensureVisitorKey();
    if (!visitorKey) return;

    const day = todayKey();
    if (sentForDay.current === day) return;

    try {
      if (sessionStorage.getItem(RECORDED_DAY_KEY) === day && !wantsDebug()) {
        return;
      }
    } catch {
      /* ignore */
    }

    // Delay so React StrictMode cleanup does not abort the real send.
    const timer = window.setTimeout(async () => {
      sentForDay.current = day;
      try {
        const { data } = await api.post('/traffic/visit', {
          visitorKey,
          source: 'bys-storefront',
        });
        try {
          sessionStorage.setItem(RECORDED_DAY_KEY, day);
        } catch {
          /* ignore */
        }
        if (wantsDebug()) {
          console.log('[TrafficBeacon]', data);
          window.__BYS_TRAFFIC__ = data;
        }
      } catch (err) {
        sentForDay.current = null;
        if (wantsDebug()) {
          console.warn('[TrafficBeacon] failed', err?.response?.status || err?.message || err);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [location.pathname]);

  return null;
};

export default TrafficBeacon;
