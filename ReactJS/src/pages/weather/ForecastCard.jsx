import { getDayName } from "@/utils/weather";

export default function ForecastCard({ day }) {
  return (
    <article className="forecast-card">
      <div className="forecast-topline">
        <div>
          <p className="forecast-day">{getDayName(day.date)}</p>
          <p className="forecast-date">{day.date}</p>
        </div>
        <img
          className="forecast-icon"
          src={`https:${day.day.condition.icon}`}
          alt={day.day.condition.text}
        />
      </div>
      <p className="forecast-condition">{day.day.condition.text}</p>
      <div className="temperature-summary">
        <div>
          <strong>{Math.round(day.day.maxtemp_c)}°</strong>
          <span>High</span>
        </div>
        <div>
          <strong>{Math.round(day.day.mintemp_c)}°</strong>
          <span>Low</span>
        </div>
        <div>
          <strong>{Math.round(day.day.avgtemp_c)}°</strong>
          <span>Avg</span>
        </div>
      </div>
      <div className="forecast-details">
        <div>
          <span>Rain chance</span>
          <strong>{day.day.daily_chance_of_rain}%</strong>
        </div>
        <div>
          <span>Precipitation</span>
          <strong>{day.day.totalprecip_mm} mm</strong>
        </div>
      </div>
    </article>
  );
}
