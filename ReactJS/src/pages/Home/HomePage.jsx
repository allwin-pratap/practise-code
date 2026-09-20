import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <main className="directory-page">
      <section className="directory-intro">
        <p className="eyebrow">A small collection of useful things</p>
        <h1>
          Built to be used,
          <br />
          <em>not just viewed.</em>
        </h1>
        <p className="intro-copy">
          A growing home for focused experiments, practical interfaces, and
          ideas that deserve a little room.
        </p>
      </section>
      <section className="app-list">
        <Link className="app-link active-app" to="/weather-app">
          <span className="app-number">01</span>
          <span className="app-info">
            <strong>Weather app</strong>
            <span>
              Live conditions, forecasts, and thoughtful request caching.
            </span>
          </span>
          <span className="app-arrow">↗</span>
        </Link>
        <div className="app-link coming-soon">
          <span className="app-number">02</span>
          <span className="app-info">
            <strong>Kanban board</strong>
            <span>Tasks, priorities, and a calmer way to see the work.</span>
          </span>
          <span className="app-status">Soon</span>
        </div>
      </section>
    </main>
  );
}
