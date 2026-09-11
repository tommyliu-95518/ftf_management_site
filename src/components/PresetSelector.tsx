import { useState, type ReactElement } from "react";

type Preset = "Low-latency" | "Balanced" | "Quality";

type Settings = {
  resolution: string;
  fps: string;
  encoder: string;
  latency: string;
  bandwidth: string;
  cpu: string;
  notes: string;
};

const DATA: Record<string, Record<Preset, Settings>> = {
  Zoom: {
    "Low-latency": { resolution: "720p", fps: "30", encoder: "NVENC P1", latency: "18–25 ms", bandwidth: "1.2–1.8 Mbps", cpu: "Ultrafast", notes: "Disable HD video in Zoom. Wired LAN recommended." },
    "Balanced":    { resolution: "1080p", fps: "30", encoder: "NVENC P4", latency: "28–40 ms", bandwidth: "2.5–3.5 Mbps", cpu: "Veryfast", notes: "Default for daily standups and client calls." },
    "Quality":     { resolution: "1080p", fps: "60", encoder: "NVENC P6", latency: "45–60 ms", bandwidth: "3.8–5.0 Mbps", cpu: "Medium",   notes: "Best for recorded webinars and demos." },
  },
  "Google Meet": {
    "Low-latency": { resolution: "720p", fps: "30", encoder: "NVENC P1", latency: "22–30 ms", bandwidth: "1.5–2.0 Mbps", cpu: "Ultrafast", notes: "Use the desktop Chrome window, not a background tab." },
    "Balanced":    { resolution: "720p", fps: "60", encoder: "NVENC P4", latency: "35–45 ms", bandwidth: "2.8–3.6 Mbps", cpu: "Veryfast", notes: "Disable Meet's 'Adjust lighting' filter." },
    "Quality":     { resolution: "1080p", fps: "30", encoder: "NVENC P5", latency: "50–65 ms", bandwidth: "3.5–4.5 Mbps", cpu: "Faster",   notes: "Force 1080p via Meet's advanced settings." },
  },
  "Microsoft Teams": {
    "Low-latency": { resolution: "720p", fps: "30", encoder: "NVENC P2", latency: "25–32 ms", bandwidth: "1.4–2.0 Mbps", cpu: "Ultrafast", notes: "Turn off Teams GPU acceleration to free NVENC." },
    "Balanced":    { resolution: "1080p", fps: "30", encoder: "NVENC P4", latency: "38–48 ms", bandwidth: "2.6–3.8 Mbps", cpu: "Veryfast", notes: "Set virtual mic in Devices BEFORE joining." },
    "Quality":     { resolution: "1080p", fps: "30", encoder: "NVENC P6", latency: "55–70 ms", bandwidth: "3.8–4.8 Mbps", cpu: "Medium",   notes: "Boost key light +1 stop vs. Zoom setup." },
  },
  YouTube: {
    "Low-latency": { resolution: "1080p", fps: "30", encoder: "NVENC P3", latency: "≈ 2 s glass", bandwidth: "4.5–6.0 Mbps", cpu: "Veryfast", notes: "Enable 'Ultra low-latency' in YouTube Studio." },
    "Balanced":    { resolution: "1080p", fps: "60", encoder: "NVENC P5", latency: "≈ 3 s glass", bandwidth: "6.0–9.0 Mbps", cpu: "Faster",   notes: "Keyframe interval 2 s for stable HLS chunks." },
    "Quality":     { resolution: "1440p", fps: "60", encoder: "NVENC P7", latency: "≈ 5 s glass", bandwidth: "9.0–14 Mbps",  cpu: "Slow",     notes: "Use 2-pass mode for VOD-bound livestreams." },
  },
  Facebook: {
    "Low-latency": { resolution: "720p", fps: "30", encoder: "x264 vfast", latency: "≈ 1.5 s glass", bandwidth: "2.5–3.5 Mbps", cpu: "Veryfast", notes: "Mobile viewers dominate — 720p is optimal." },
    "Balanced":    { resolution: "720p", fps: "60", encoder: "NVENC P4",   latency: "≈ 2 s glass",   bandwidth: "3.5–5.0 Mbps", cpu: "Faster",   notes: "60fps reads as more 'live' in FB feed." },
    "Quality":     { resolution: "1080p", fps: "30", encoder: "NVENC P6",  latency: "≈ 3 s glass",   bandwidth: "4.5–6.0 Mbps", cpu: "Medium",   notes: "Don't exceed 6 Mbps — FB will transcode anyway." },
  },
  Twitch: {
    "Low-latency": { resolution: "936p", fps: "60", encoder: "NVENC P1", latency: "≈ 1.2 s glass", bandwidth: "4.5–6.0 Mbps", cpu: "Ultrafast", notes: "Enable Low Latency Mode in Twitch settings." },
    "Balanced":    { resolution: "1080p", fps: "60", encoder: "NVENC P4", latency: "≈ 2 s glass",   bandwidth: "6.0–8.0 Mbps", cpu: "Faster",   notes: "Partner default — best chat sync." },
    "Quality":     { resolution: "1080p", fps: "60", encoder: "NVENC P7", latency: "≈ 3 s glass",   bandwidth: "8.0–8.0 Mbps", cpu: "Slow",     notes: "Cap at 8 Mbps — Twitch's hard ingest ceiling." },
  },
};

const PRESETS: Preset[] = ["Low-latency", "Balanced", "Quality"];

export function PresetSelector({
  platforms,
}: {
  platforms: { name: string; Icon: (props: { className?: string }) => ReactElement }[];
}) {
  const [activePlatform, setActivePlatform] = useState(platforms[0].name);
  const [activePreset, setActivePreset] = useState<Preset>("Balanced");

  const settings = DATA[activePlatform][activePreset];
  const ActiveIcon = platforms.find((p) => p.name === activePlatform)!.Icon;

  return (
    <div className="rounded-3xl border border-border bg-background overflow-hidden">
      {/* Platform tabs */}
      <div className="flex flex-wrap border-b border-border bg-white/[0.02]">
        {platforms.map((p) => {
          const active = p.name === activePlatform;
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => setActivePlatform(p.name)}
              className={`flex items-center gap-2 px-5 py-4 font-mono text-[11px] uppercase tracking-widest border-r border-border transition-colors cursor-pointer ${
                active ? "bg-accent text-black" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
              }`}
            >
              <p.Icon className="size-4" />
              {p.name}
            </button>
          );
        })}
      </div>

      <div className="grid md:grid-cols-[260px_1fr]">
        {/* Preset rail */}
        <div className="border-b md:border-b-0 md:border-r border-border p-5 bg-white/[0.02] space-y-2">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Preset</p>
          {PRESETS.map((p) => {
            const active = p === activePreset;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setActivePreset(p)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                  active
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border hover:border-accent/40 text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase tracking-tight">{p}</span>
                  {active && <span className="size-2 rounded-full bg-accent animate-pulse" />}
                </div>
                <p className="text-[10px] font-mono text-muted-foreground mt-1">
                  {p === "Low-latency" && "Interactive · sub-frame"}
                  {p === "Balanced" && "Default · 1080p"}
                  {p === "Quality" && "VOD · max fidelity"}
                </p>
              </button>
            );
          })}
        </div>

        {/* Settings panel */}
        <div key={activePlatform + activePreset} className="p-8 animate-fade-up">
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-border">
            <ActiveIcon className="size-7 text-accent" />
            <div>
              <p className="font-mono text-[10px] text-accent uppercase tracking-widest">{activePreset} preset</p>
              <h3 className="font-mono text-lg font-bold uppercase tracking-tight">{activePlatform}</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-6">
            {[
              ["Resolution", settings.resolution],
              ["FPS", settings.fps],
              ["Encoder", settings.encoder],
              ["Target latency", settings.latency],
              ["Upstream bandwidth", settings.bandwidth],
              ["CPU preset", settings.cpu],
            ].map(([label, value]) => (
              <div key={label} className="p-4 rounded-xl border border-border bg-white/[0.02]">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
                <p className="font-mono text-base font-bold text-accent">{value}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl border border-accent/20 bg-accent/[0.04]">
            <p className="font-mono text-[10px] text-accent uppercase tracking-widest mb-2">// Tip</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{settings.notes}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
