import { useEffect } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import { trackEvent, getDataModeLabel } from "./lib/analytics";
import { getDataMode } from "./lib/trips";
import { LandingPage } from "./pages/LandingPage";
import { MvpAnalyticsPage } from "./pages/MvpAnalyticsPage";
import { TripDetailPage } from "./pages/TripDetailPage";
import { TripListPage } from "./pages/TripListPage";
import { WeeklyTripRedirect } from "./pages/WeeklyTripRedirect";

export default function App() {
  const mode = getDataMode();
  const location = useLocation();

  useEffect(() => {
    void trackEvent("page_view", null, { path: location.pathname });
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <NavLink to="/" className="brand-link">
            <span className="brand-mark">OMW</span>
            <span className="brand-name">Outdoors Made Weekly</span>
          </NavLink>
        </div>
        <nav className="app-nav">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/trip">This week</NavLink>
          <NavLink to="/trips">Trips</NavLink>
          <NavLink to="/mvp-analytics">MVP Analytics</NavLink>
        </nav>
        <span className={`badge ${mode === "supabase" ? "live" : ""}`} title={getDataModeLabel()}>
          {mode === "supabase" ? "Supabase connected" : "Local demo"}
        </span>
      </header>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/trip" element={<WeeklyTripRedirect />} />
        <Route path="/trips" element={<TripListPage />} />
        <Route path="/trips/:slug" element={<TripDetailPage />} />
        <Route path="/mvp-analytics" element={<MvpAnalyticsPage />} />
        <Route path="/admin/analytics" element={<MvpAnalyticsPage />} />
        <Route path="/analytics" element={<MvpAnalyticsPage />} />
      </Routes>

      <footer className="app-footer">
        <p className="muted">Make going outside feel easy, social, and worth it.</p>
        <p>
          <a href="#contact">Contact</a>
          {" · "}
          <NavLink to="/mvp-analytics">MVP Analytics</NavLink>
        </p>
      </footer>
    </div>
  );
}
