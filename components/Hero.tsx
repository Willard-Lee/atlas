
export default function Hero (){
    return (
        <section className = "grid grid-cols-2 px-16 py-24 items-center">
           <div> {/* left side */}
                <h1 className = "text-8xl font-bold" style = {{color: "var(--primary-container)"}}>
                    ATLAS.SYS
                </h1>
                <div className = "flex items-center gap-3 mt-4">
                    <span className = "text-xs font-bold px-2 py-1" style = {{fontFamily: "var(--font-mono)", background: "var(--surface-container-high)", color: "var(--on-surface)"}}>
                        [ SYSTEM_LOG ] 
                    </span>
                    <span style = {{fontFamily: "var(--font-mono)", color: "var(--on-surface)"}}> 
                         Compiling Latent Schemas...
                    </span>
                </div>
                <p className = "mt-6 text-base leading-relaxed max-w-sm" style={{color: "var(--on-surface-variant)"}}> 
                    High-density Architectural Sybauwan
                </p>
           </div> 
           <div> {/* Right side */}
           </div>
        </section>
    )
}