import { Component } from "react";
import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react";
import IconTile from "./IconTile";
import { t } from "../lib/i18n";

// If a page crashes, show something friendly instead of a blank screen
class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="grid min-h-screen place-items-center bg-base-200 p-6">
        <div className="panel max-w-md p-8 text-center">
          <IconTile icon={TriangleAlertIcon} tone="error" size="lg" className="mx-auto mb-4" />
          <h1 className="text-xl font-semibold">{t("error.title", "Something went wrong")}</h1>
          <p className="mt-2 text-base-content/70">
            {t("error.text", "The page hit an unexpected error. Reloading usually fixes it.")}
          </p>
          <button className="btn btn-primary mt-6 gap-2" onClick={() => window.location.reload()}>
            <RotateCcwIcon className="size-4" />
            {t("error.reload", "Reload the page")}
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
