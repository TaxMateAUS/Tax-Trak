import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import ScanReceipt from './pages/ScanReceipt';
import TaxSummary from './pages/TaxSummary';
import VehicleTracking from './pages/VehicleTracking';
import Subscription from './pages/Subscription';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Expenses": Expenses,
    "ScanReceipt": ScanReceipt,
    "TaxSummary": TaxSummary,
    "VehicleTracking": VehicleTracking,
    "Subscription": Subscription,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};