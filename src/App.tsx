import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import StickerCrafts from "./pages/StickerCrafts";
import Loadouts from "./pages/Loadouts";
import CreateLoadout from "./pages/CreateLoadout";
import LoadoutDetail from "./pages/LoadoutDetail";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Weapon from "./pages/Weapon";
import Skin from "./pages/Skin";
import StickerCraftDetail from "./pages/StickerCraftDetail";
import ResellTracker from "./pages/ResellTracker";
import AdminLoadouts from "./pages/AdminLoadouts";
import AdminStickerCrafts from "./pages/AdminStickerCrafts";
import AdminDashboard from "./pages/AdminDashboard";
import EditLoadout from "./pages/EditLoadout";
import ResetPassword from "./pages/ResetPassword";
import LegalNotice from "./pages/LegalNotice";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Contact from "./pages/Contact";
import CookieSettings from "./pages/CookieSettings";
import Category from "./pages/Category";
import Error404 from "./pages/Error404";
import Error500 from "./pages/Error500";
import Error403 from "./pages/Error403";
import Error from "./pages/Error";
import ErrorBoundary from "./components/ErrorBoundary";
import { useEffect } from "react";
import { initializeSessionManager } from "./utils/sessionManager";
import { initializeVisibilityManager, initializeFocusManager } from "./utils/visibilityManager";

function App() {
  // Initialize session and visibility managers
  useEffect(() => {
    const sessionCleanup = initializeSessionManager();
    const visibilityCleanup = initializeVisibilityManager();
    const focusCleanup = initializeFocusManager();
    
    return () => {
      sessionCleanup();
      visibilityCleanup();
      focusCleanup();
    };
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="sticker-crafts" element={<StickerCrafts />} />
          <Route path="sticker-crafts/:id" element={<StickerCraftDetail />} />
          <Route path="loadouts" element={<Loadouts />} />
          <Route path="loadouts/new" element={<CreateLoadout />} />
          <Route path="loadouts/:loadoutType/:loadoutId" element={<LoadoutDetail />} />
          <Route path="loadouts/edit/:id" element={<EditLoadout />} />
          <Route path="login" element={<Login />} />
          <Route path="profile" element={<Profile />} />
          <Route path="weapons/:weaponName" element={<Weapon />} />
          <Route path="skins/:skinId" element={<Skin />} />
          <Route path="category/:categoryName" element={<Category />} />
          <Route path="resell-tracker" element={<ResellTracker />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/loadouts" element={<AdminLoadouts />} />
          <Route path="admin/sticker-crafts" element={<AdminStickerCrafts />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="legal-notice" element={<LegalNotice />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-of-service" element={<TermsOfService />} />
          <Route path="contact" element={<Contact />} />
          <Route path="cookie-settings" element={<CookieSettings />} />
          
          {/* Error Pages */}
          <Route path="404" element={<Error404 />} />
          <Route path="500" element={<Error500 />} />
          <Route path="403" element={<Error403 />} />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<Error404 />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
