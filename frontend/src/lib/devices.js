import { t } from "./i18n";

// Names of the devices proctoring can report (the COCO labels plus the manual options)
export const deviceLabel = (device) =>
  ({
    "cell phone": t("proctor.phone", "Phone"),
    laptop: t("proctor.laptop", "Laptop"),
    earphones: t("proctor.earphones", "Earphones"),
    other: t("proctor.other", "Another device"),
  })[device] || device;

// what the host can report by hand (the model can't see earphones)
export const REPORTABLE_DEVICES = ["cell phone", "earphones", "other"];
