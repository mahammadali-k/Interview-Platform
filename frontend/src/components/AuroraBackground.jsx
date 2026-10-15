// soft animated colour blobs behind the hero: only transforms animate (cheap on the GPU)
function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="aurora-blob -left-24 -top-24 size-[28rem] bg-primary/30 [animation-delay:0s]" />
      <div className="aurora-blob right-0 top-10 size-[24rem] bg-accent/25 [animation-delay:-4s]" />
      <div className="aurora-blob -bottom-32 left-1/3 size-[26rem] bg-secondary/25 [animation-delay:-8s]" />
    </div>
  );
}

export default AuroraBackground;
