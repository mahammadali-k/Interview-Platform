import { PanelResizeHandle } from "react-resizable-panels";

function ResizeHandle({ direction = "horizontal" }) {
  const layout = direction === "horizontal" ? "w-px cursor-col-resize" : "h-px cursor-row-resize";

  return (
    <PanelResizeHandle
      className={`${layout} bg-base-content/15 transition-colors hover:bg-primary data-[resize-handle-state=drag]:bg-primary`}
    />
  );
}

export default ResizeHandle;
