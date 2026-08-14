import { useState, useCallback } from "react";
import { Lightbulb, Sparkles, TrendingUp, Zap, ShieldCheck, Globe } from "lucide-react";
import imsLogo from "../assets/ims-logo.jpg";

function AuthStage({ isSubmitting = false }) {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, moveX: 0, moveY: 0 });
  const [isLogoClicked, setIsLogoClicked] = useState(false);

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (e.clientX - centerX) / (rect.width / 2);
    const offsetY = (e.clientY - centerY) / (rect.height / 2);

    setTilt({
      rotateX: -offsetY * 18,
      rotateY: offsetX * 18,
      moveX: offsetX * 24,
      moveY: offsetY * 24
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0, moveX: 0, moveY: 0 });
  }, []);

  const handleLogoClick = (e) => {
    e.stopPropagation();
    setIsLogoClicked(true);
    setTimeout(() => {
      setIsLogoClicked(false);
    }, 1200);
  };

  const isEnergyActive = isLogoClicked || isSubmitting;

  return (
    <div
      className="emerald-left-panel"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: "pointer" }}
    >
      <div
        className={`special-orbit-stage ${isEnergyActive ? "stage-energy-active" : ""}`}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translate3d(${tilt.moveX * 0.4}px, ${tilt.moveY * 0.4}px, 0)`,
          transition: tilt.rotateX === 0 ? "transform 0.6s ease-out" : "transform 0.1s cubic-bezier(0.1, 0.5, 0.1, 1)",
          transformStyle: "preserve-3d"
        }}
      >
        
        {/* Ambient Backlight Glow Orbs (Shifting Parallax) */}
        <div
          className={`ambient-glow glow-primary ${isEnergyActive ? "glow-pulse-burst" : ""}`}
          style={{
            transform: `translate3d(${-tilt.moveX * 0.8}px, ${-tilt.moveY * 0.8}px, 0)`,
            transition: tilt.rotateX === 0 ? "transform 0.6s ease-out" : "transform 0.15s ease-out"
          }}
        ></div>
        <div
          className={`ambient-glow glow-secondary ${isEnergyActive ? "glow-pulse-burst" : ""}`}
          style={{
            transform: `translate3d(${tilt.moveX * 0.8}px, ${tilt.moveY * 0.8}px, 0)`,
            transition: tilt.rotateX === 0 ? "transform 0.6s ease-out" : "transform 0.15s ease-out"
          }}
        ></div>

        {/* SVG Laser Rings & Laser Beams */}
        <svg className="special-orbit-svg" viewBox="0 0 500 500">
          <defs>
            <linearGradient id="grad-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.15" />
            </linearGradient>

            <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.15" />
            </linearGradient>

            <linearGradient id="grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.15" />
            </linearGradient>

            <filter id="laser-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Pulsing Ripple Waves */}
          <circle cx="250" cy="250" r="75" className={`ripple-wave wave-1 ${isEnergyActive ? "wave-burst" : ""}`} />
          <circle cx="250" cy="250" r="110" className={`ripple-wave wave-2 ${isEnergyActive ? "wave-burst" : ""}`} />
          <circle cx="250" cy="250" r="150" className={`ripple-wave wave-3 ${isEnergyActive ? "wave-burst" : ""}`} />

          {/* Shockwave Energy Burst Circle on Click or Submit */}
          {isEnergyActive && (
            <circle cx="250" cy="250" r="80" className="shockwave-circle" />
          )}

          {/* Connecting Laser Lines from Center Logo to 6 Nodes */}
          <line x1="250" y1="250" x2="250" y2="50" className={`laser-beam ${isEnergyActive ? "laser-beam-active" : ""}`} />
          <line x1="250" y1="250" x2="423" y2="150" className={`laser-beam ${isEnergyActive ? "laser-beam-active" : ""}`} />
          <line x1="250" y1="250" x2="423" y2="350" className={`laser-beam ${isEnergyActive ? "laser-beam-active" : ""}`} />
          <line x1="250" y1="250" x2="250" y2="450" className={`laser-beam ${isEnergyActive ? "laser-beam-active" : ""}`} />
          <line x1="250" y1="250" x2="77" y2="350" className={`laser-beam ${isEnergyActive ? "laser-beam-active" : ""}`} />
          <line x1="250" y1="250" x2="77" y2="150" className={`laser-beam ${isEnergyActive ? "laser-beam-active" : ""}`} />

          {/* Orbit 3 (Outer Clockwise - Emerald Green) */}
          <circle cx="250" cy="250" r="200" className="orbit-track" stroke="rgba(255,255,255,0.18)" strokeWidth="1" fill="none" />
          <circle cx="250" cy="250" r="200" className={`orbit-laser-ring laser-outer ${isEnergyActive ? "orbit-spin-burst" : ""}`} stroke="url(#grad-emerald)" strokeWidth="3" strokeDasharray="60 180" fill="none" filter="url(#laser-glow)" />

          {/* Orbit 2 (Middle Counter-Clockwise - Electric Blue) */}
          <circle cx="250" cy="250" r="145" className="orbit-track" stroke="rgba(255,255,255,0.22)" strokeWidth="1" strokeDasharray="4 8" fill="none" />
          <circle cx="250" cy="250" r="145" className={`orbit-laser-ring laser-mid ${isEnergyActive ? "orbit-spin-burst-reverse" : ""}`} stroke="url(#grad-blue)" strokeWidth="3" strokeDasharray="75 110" fill="none" filter="url(#laser-glow)" />

          {/* Orbit 1 (Inner Clockwise - Cyan) */}
          <circle cx="250" cy="250" r="95" className={`orbit-laser-ring laser-inner ${isEnergyActive ? "orbit-spin-burst" : ""}`} stroke="url(#grad-cyan)" strokeWidth="2.5" strokeDasharray="40 80" fill="none" />
        </svg>

        {/* Center Hero IMS Group Logo Badge */}
        <div
          className={`hero-center-badge ${isLogoClicked ? "hero-click-bounce" : ""} ${isSubmitting ? "hero-submitting-spin" : ""}`}
          onClick={handleLogoClick}
          title="Click or submit to trigger IMS Power Mode!"
          style={{
            transform: `translate3d(${tilt.moveX * 0.75}px, ${tilt.moveY * 0.75}px, 35px)`,
            transition: tilt.rotateX === 0 ? "transform 0.6s ease-out" : "transform 0.12s ease-out",
            cursor: "pointer"
          }}
        >
          <div className={`hero-aura-ring ${isEnergyActive ? "aura-burst-ring" : ""}`}></div>
          <div className="hero-logo-container">
            <img src={imsLogo} alt="IMS Group" className="hero-ims-logo" />
          </div>
        </div>

        {/* 6 Orbit Enterprise Nodes */}
        <div className={`special-node node-top ${isEnergyActive ? "node-click-pop" : ""}`}>
          <div className="node-chip chip-emerald">
            <Lightbulb size={18} color="#ffffff" />
          </div>
          <span className="node-label">Idea Hub</span>
        </div>

        <div className={`special-node node-top-right ${isEnergyActive ? "node-click-pop" : ""}`}>
          <div className="node-chip chip-blue">
            <Sparkles size={18} color="#ffffff" />
          </div>
          <span className="node-label">AI Automation</span>
        </div>

        <div className={`special-node node-bottom-right ${isEnergyActive ? "node-click-pop" : ""}`}>
          <div className="node-chip chip-purple">
            <TrendingUp size={18} color="#ffffff" />
          </div>
          <span className="node-label">ROI Velocity</span>
        </div>

        <div className={`special-node node-bottom ${isEnergyActive ? "node-click-pop" : ""}`}>
          <div className="node-chip chip-amber">
            <Zap size={18} color="#ffffff" />
          </div>
          <span className="node-label">Fast Gate</span>
        </div>

        <div className={`special-node node-bottom-left ${isEnergyActive ? "node-click-pop" : ""}`}>
          <div className="node-chip chip-indigo">
            <ShieldCheck size={18} color="#ffffff" />
          </div>
          <span className="node-label">Security</span>
        </div>

        <div className={`special-node node-top-left ${isEnergyActive ? "node-click-pop" : ""}`}>
          <div className="node-chip chip-teal">
            <Globe size={18} color="#ffffff" />
          </div>
          <span className="node-label">Enterprise</span>
        </div>

        {/* Floating Dust Particles */}
        <div className="dust-particle dp-1"></div>
        <div className="dust-particle dp-2"></div>
        <div className="dust-particle dp-3"></div>
        <div className="dust-particle dp-4"></div>
        <div className="dust-particle dp-5"></div>
        <div className="dust-particle dp-6"></div>

      </div>
    </div>
  );
}

export default AuthStage;
