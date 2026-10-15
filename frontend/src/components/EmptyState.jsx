import IconTile from "./IconTile";

function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="flex flex-col items-center py-14 text-center">
      <IconTile icon={Icon} tone="muted" size="lg" className="mb-4" />
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-base-content/50">{hint}</p>
    </div>
  );
}

export default EmptyState;
