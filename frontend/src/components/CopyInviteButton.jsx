import { useState } from "react";
import { CheckIcon, LinkIcon } from "lucide-react";
import { copyText } from "../lib/clipboard";

// copies the direct link of a session so the candidate can be invited in one click
function CopyInviteButton({ sessionId, className = "btn btn-ghost btn-sm gap-2", label = "Copy invite" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();

    if (await copyText(`${window.location.origin}/session/${sessionId}`, "Invite link copied")) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <button type="button" className={className} onClick={handleCopy}>
      {copied ? <CheckIcon className="size-4 text-success" /> : <LinkIcon className="size-4" />}
      {label}
    </button>
  );
}

export default CopyInviteButton;
