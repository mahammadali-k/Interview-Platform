import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRightIcon, LinkIcon } from "lucide-react";
import toast from "react-hot-toast";
import { t } from "../lib/i18n";

// works with a full invite link or just the session id
const SESSION_ID = /([a-f0-9]{24})/i;

function JoinByLink() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = value.match(SESSION_ID)?.[1];

    if (!id) {
      toast.error(t("join.invalid", "That doesn't look like an invite link"));
      return;
    }

    navigate(`/session/${id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
      <label className="input input-bordered flex flex-1 items-center gap-2 bg-base-100/70">
        <LinkIcon className="size-4 text-base-content/50" />
        <input
          type="text"
          placeholder={t("join.placeholder", "Paste an invite link to join")}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label={t("join.label", "Invite link")}
        />
      </label>
      <button type="submit" className="btn btn-primary gap-2" disabled={!value.trim()}>
        {t("join.button", "Join")}
        <ArrowRightIcon className="size-4" />
      </button>
    </form>
  );
}

export default JoinByLink;
