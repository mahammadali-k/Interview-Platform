import { Link } from "react-router";
import { CompassIcon } from "lucide-react";
import IconTile from "../components/IconTile";
import { t } from "../lib/i18n";

function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-base-200 p-6">
      <div className="panel animate-pop max-w-md p-8 text-center">
        <IconTile icon={CompassIcon} size="lg" className="mx-auto mb-4" />
        <p className="font-mono text-5xl font-semibold text-gradient">404</p>
        <h1 className="mt-3 text-xl font-semibold">{t("notfound.title", "Page not found")}</h1>
        <p className="mt-2 text-base-content/70">
          {t("notfound.text", "The page you are looking for does not exist or was moved.")}
        </p>
        <Link to="/" className="btn btn-primary mt-6">
          {t("notfound.home", "Go to the home page")}
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
