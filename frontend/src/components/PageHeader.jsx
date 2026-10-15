// eyebrow + title + description with an optional actions slot (used by every inner page)
function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="animate-rise mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-base-content/60">{description}</p>}
      </div>

      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export default PageHeader;
