const TONES = {
  primary: "bg-primary/15 text-primary",
  muted: "border hairline bg-base-200 text-base-content/60",
  error: "border border-error/40 bg-error/10 text-error",
};

const SIZES = {
  sm: "size-9 rounded-lg [&>svg]:size-4",
  md: "size-11 rounded-xl [&>svg]:size-5",
  lg: "size-14 rounded-xl [&>svg]:size-7",
};

/** The little rounded icon square you see on cards, rows and empty states */
function IconTile({ icon: Icon, tone = "primary", size = "md", className = "" }) {
  return (
    <span className={`grid shrink-0 place-items-center ${TONES[tone]} ${SIZES[size]} ${className}`}>
      <Icon />
    </span>
  );
}

export default IconTile;
