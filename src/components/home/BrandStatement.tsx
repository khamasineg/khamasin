export default function BrandStatement() {
    return (
      <section className="px-6 py-20 md:px-16 md:py-32 bg-ink">
  
        {/* Top rule */}
        <div className="flex items-center gap-4 mb-12">
          <span className="h-px flex-1 bg-ivory/10" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-ivory/40">
            The FYNDE way
          </span>
          <span className="h-px flex-1 bg-ivory/10" />
        </div>
  
        {/* Statement */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-[clamp(28px,6vw,72px)] leading-tight italic text-ivory mb-8">
            "Every piece we carry has lived a life. Our job is to find it, preserve it and put it in the hands of someone who will honour it."
          </h2>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ivory/40">
            — The FYNDE Archive
          </p>
        </div>
  
        {/* Bottom stats */}
<div className="grid grid-cols-2 gap-4 mt-20 border-t border-ivory/10 pt-12">
  <div className="text-center">
    <p className="font-display text-4xl md:text-6xl tracking-wider text-ivory mb-2">
      1/1
    </p>
    <p className="font-mono text-[9px] uppercase tracking-widest text-ivory/40">
      Every piece
    </p>
  </div>
  <div className="text-center">
    <p className="font-display text-4xl md:text-6xl tracking-wider text-ivory mb-2">
      60s–90s
    </p>
    <p className="font-mono text-[9px] uppercase tracking-widest text-ivory/40">
      Era range
    </p>
  </div>
</div>
  
      </section>
    )
  }
