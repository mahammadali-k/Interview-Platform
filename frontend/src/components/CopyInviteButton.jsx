import { useState } from "react";
import { CheckIcon, LinkIcon } from "lucide-react";
import { copyText } from "../lib/clipboard";
import { t } from "../lib/i18n";

// copies the direct link of a session so the candidate can be invited in one click
function CopyInviteButton({ sessionId, className = "btn btn-ghost btn-sm gap-2", label }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();

    if (await copyText(`${window.location.origin}/session/${sessionId}`, t("copy.invite", "Invite link copied"))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <button type="button" className={className} onClick={handleCopy}>
      {copied ? <CheckIcon className="size-4 text-success" /> : <LinkIcon className="size-4" />}
      {label ?? t("copy.button", "Copy invite")}
    </button>
  );
}

export default CopyInviteButton;
