import Dashboard from './pages/Dashboard';
import ScanReceipt from './pages/ScanReceipt';
import Expenses from './pages/Expenses';
import TaxSummary from './pages/TaxSummary';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "ScanReceipt": ScanReceipt,
    "Expenses": Expenses,
    "TaxSummary": TaxSummary,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};