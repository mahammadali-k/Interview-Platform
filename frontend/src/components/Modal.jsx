import { useEffect } from "react";

/**
 * A shared dialog shell: backdrop, pop-in animation, Escape to close, a title and an actions row.
 * `busy` stops people from closing it while a request is running. Pass `onSubmit` and it renders a <form>.
 */
function Modal({ eyebrow, title, onClose, busy = false, size = "max-w-lg", onSubmit, footer, children }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && !busy) onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [busy, onClose]);

  const Shell = onSubmit ? "form" : "div";

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-label={title}>
      <Shell
        onSubmit={onSubmit}
        className={`modal-box animate-pop max-h-[90vh] border hairline ${size}`}
      >
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h3 className="mb-5 text-2xl font-semibold">{title}</h3>

        {children}

        {footer && <div className="modal-action">{footer}</div>}
      </Shell>

      <div className="modal-backdrop" onClick={busy ? undefined : onClose} />
    </div>
  );
}

export default Modal;
