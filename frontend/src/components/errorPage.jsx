import { Link } from "react-router-dom";
import UpcomingEvents from "./UpcomingEvents";
import "../styles/errorPage.css";
import { SearchX } from "lucide-react";

export default function ErrorPage() {
  return (
    <>
      <div className="error-page">
        <div className="error-image">
          <SearchX size={40} strokeWidth={2} className="error-icon" />
        </div>
        <h2 className="error-message">Page does not exist</h2>

        <p className="error-redirect">
          Go to{" "}
          <Link className="events-link" to="/events">
            events
          </Link>
          , try a new{" "}
          <Link className="events-link" to="/">
            search
          </Link>{" "}
          or check our upcoming events.
        </p>
      </div>
      <UpcomingEvents />
    </>
  );
}
