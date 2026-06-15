
export default function Hero (){
    return (
        <section className = "dot-grid grid grid-cols-2 px-16 py-24 items-center min-h-screen">
           {/* left side */}
           <div> 
                <h1 className = "text-8xl font-bold animate-fade-up-1" 
                    style = {{
                        color: "var(--primary-container)" , 
                        fontFamily: "var(--font-display)",
                        }}>
                    ATLAS.SYS
                </h1>
                {/*Badge row div*/}
                <div className = "flex items-center gap-3 mt-4 animate-fade-up-2"> 
                    <span className = "text-xs font-bold px-2 py-1 border" style = {{fontFamily: "var(--font-mono)", background: "var(--surface-container-high)", color: "var(--on-surface)"}}>
                        [ SYSTEM_LOG ] 
                    </span>
                    <span 
                        style = {{
                            fontFamily: "var(--font-mono)", 
                            color: "var(--on-surface)",
                            }}
                    > 
                         Compiling Latent Schemas... 
                         <span style = {{animation: "blink 1s step-end infinite"}}>_</span>
                    </span>
                </div>
                <p 
                className = "mt-6 text-base leading-relaxed max-w-sm animate-fade-up-3" 
                style={{
                    color: "var(--on-surface-variant)",
                    }}
                > 
                    Somewhere between financial model and a neural network, that is where I live.
                </p>
           </div> 
           {/* Right side */}
           <div className = "flex items-center justify-center animate-fade-up-2">
             <div style = {{
                    width: "400px",
                    height: "400px",
                    border: "1px solid var(--primary-container)",
                    boxShadow: " 0 0 40px var(--primary-container)",
                    opacity: 0.3,
             }}> </div> 
           </div>
        </section>
    )
}