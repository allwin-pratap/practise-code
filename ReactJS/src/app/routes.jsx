import { Route, Routes } from "react-router-dom";
import AppShell from "@/layouts/AppShell";
import HomePage from "@/pages/Home/HomePage";
import WeatherPage from "@/pages/weather/WeatherPage";

export default function AppRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/weather-app" element={<WeatherPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}

function NotFoundPage() {
  return (
    <main className="not-found">
      <p className="eyebrow">404</p>
      <h1>That route is still being built.</h1>
      <a className="text-link" href="/">
        Back to apps <span>↗</span>
      </a>
    </main>
  );
}
