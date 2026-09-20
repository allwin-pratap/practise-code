import { Link, NavLink, useLocation } from "react-router-dom";

export default function AppShell({ children }) {
  const location = useLocation();
  const shellClass =
    location.pathname === "/weather-app" ? "weather-shell" : "";

  return (
    <div className={`site-shell ${shellClass}`}>
      <header className="site-header">
        <Link className="brand" to="/">
          <span className="brand-mark">AP</span>
          Allwin Pratap
        </Link>
        <nav className="site-nav">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/weather-app">Weather</NavLink>
        </nav>
      </header>
      {children}
    </div>
  );
}
