import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import Dashboard from '../../pages/Dashboard';
import ScanReceipt from '../../pages/ScanReceipt';
import Expenses from '../../pages/Expenses';
import VehicleTracking from '../../pages/VehicleTracking';

const tabs = {
  'Dashboard': Dashboard,
  'ScanReceipt': ScanReceipt,
  'Expenses': Expenses,
  'VehicleTracking': VehicleTracking,
};

export default function TabContainer({ currentPage }) {
  const [activeTab, setActiveTab] = useState(currentPage);
  const [cachedTabs, setCachedTabs] = useState({ [currentPage]: true });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const page = location.pathname.split('/').pop() || 'Dashboard';
    if (tabs[page]) {
      setActiveTab(page);
      setCachedTabs(prev => ({ ...prev, [page]: true }));
    }
  }, [location.pathname]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  if (!isMobile || !tabs[currentPage]) {
    return null;
  }

  return (
    <>
      {Object.entries(tabs).map(([tabName, Component]) => (
        <div
          key={tabName}
          style={{
            display: activeTab === tabName ? 'block' : 'none',
            height: '100%',
          }}
        >
          {cachedTabs[tabName] && <Component />}
        </div>
      ))}
    </>
  );
}