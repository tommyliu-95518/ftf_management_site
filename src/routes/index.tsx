import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PresetSelector } from "@/components/PresetSelector";
import { CheckoutButton } from "@/components/CheckoutButton";
import { CryptoCheckoutButton } from "@/components/CryptoCheckoutButton";

function ZoomIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4 6h10a2 2 0 012 2v3l4-2.5V15l-4-2.5V15a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
    </svg>
  );
}

function MeetIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
    </svg>
  );
}

function TeamsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.58 7.16c-.23-.86-.9-1.54-1.76-1.77C18.26 5 12 5 12 5s-6.26 0-7.82.39c-.86.23-1.53.91-1.76 1.77C2 8.72 2 12 2 12s0 3.28.42 4.84c.23.86.9 1.54 1.76 1.77C5.74 19 12 19 12 19s6.26 0 7.82-.39c.86-.23 1.53-.91 1.76-1.77C22 15.28 22 12 22 12s0-3.28-.42-4.84zM10 15V9l5.2 3-5.2 3z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  );
}

function TwitchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28h1.43v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29l-3.36 3.36h-2.8l-2.57 2.57V14.64H7.71V3.43h11.43z" />
    </svg>
  );
}

const PLATFORMS = [
  { name: "Zoom", Icon: ZoomIcon },
  { name: "Google Meet", Icon: MeetIcon },
  { name: "Microsoft Teams", Icon: TeamsIcon },
  { name: "YouTube", Icon: YouTubeIcon },
  { name: "Facebook", Icon: FacebookIcon },
  { name: "Twitch", Icon: TwitchIcon },
];
import appUi from "@/assets/app-ui.jpg";
import adFaceSwap from "@/assets/ad-face-swap.jpg";
import adVirtualCamera from "@/assets/ad-virtual-camera.jpg";
import adImageGen from "@/assets/ad-image-gen.jpg";
import heroDemoAsset from "@/assets/hero-demo.mp4.asset.json";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Visage.AI — Real-Time AI Face Swap for Zoom, Meet, Twitch" },
      { name: "description", content: "Cinema-grade real-time face swapping for Zoom, Google Meet, Teams, YouTube and Twitch. Swap with any face image, zero latency, hand and mic occlusion aware." },
    ],
  }),
  component: Index,
});

function Index() {
  const [accountEmail, setAccountEmail] = useState("");

  return (
    <div className="min-h-screen bg-background text-foreground font-display selection:bg-accent selection:text-black">
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-accent flex items-center justify-center font-mono font-bold text-black text-xs">V</div>
          <span className="font-mono tracking-tighter text-sm font-medium uppercase">Visage.AI</span>
        </div>
        <div className="hidden md:flex gap-8 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <a href="#engine" className="hover:text-accent transition-colors">Engine</a>
          <a href="#usecases" className="hover:text-accent transition-colors">Use Cases</a>
          <a href="#platforms" className="hover:text-accent transition-colors">Platforms</a>
          <a href="#pricing" className="hover:text-accent transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-accent transition-colors">FAQ</a>
        </div>
        <a href="#pricing" className="bg-foreground text-background px-4 py-1.5 text-xs font-mono uppercase tracking-tighter hover:bg-accent transition-colors cursor-pointer">Get Access</a>
      </nav>

      <header className="relative pt-24 pb-32 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 border border-accent/30 bg-accent/5 rounded-full">
              <span className="size-1.5 bg-accent rounded-full animate-pulse" />
              <span className="text-[10px] font-mono text-accent uppercase tracking-wider">v2.4 Kernel Live</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[0.9] text-balance mb-8">
              REAL-TIME <br />
              <span className="text-accent italic">IDENTITY</span> SHIFT
            </h1>
            <p className="max-w-md text-muted-foreground text-lg leading-relaxed mb-10 text-pretty">
              Deploy zero-latency high-fidelity face swapping across Zoom, Meet, Teams, YouTube, Facebook and Twitch. Any image, any person, any environment.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#pricing" className="group relative px-8 py-4 bg-accent text-black font-mono font-bold uppercase tracking-tighter flex items-center gap-3 hover:translate-x-1 transition-transform cursor-pointer">
                Start Swapping
                <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
              </a>
              <a href="#engine" className="px-8 py-4 border border-border text-foreground font-mono font-bold uppercase tracking-tighter hover:bg-white/5 transition-colors cursor-pointer">
                Watch Demo
              </a>
            </div>
          </div>

          <div className="relative animate-fade-up [animation-delay:200ms]">
            <div className="absolute -inset-20 bg-accent/10 blur-[120px] rounded-full" />
            <div className="relative w-full aspect-square bg-white/5 border border-border rounded-2xl overflow-hidden">
              <video
                src={heroDemoAsset.url}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex justify-between font-mono text-[10px] text-accent">
                <span>LATENCY: 12ms</span>
                <span>FPS: 60.00</span>
                <span>ID: VIS_4992</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="border-y border-border py-12 bg-white/[0.02] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-[10px] font-mono text-muted-foreground uppercase tracking-[0.4em] mb-10">Engineered for production</p>
          <div className="relative [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
            <div className="flex gap-20 animate-[marquee_30s_linear_infinite] whitespace-nowrap items-center">
              {[...PLATFORMS, ...PLATFORMS].map((p, i) => (
                <span key={i} className="flex items-center gap-3 shrink-0">
                  <p.Icon className="size-5 opacity-70" />
                  <span className="font-mono text-xl font-bold italic tracking-tighter opacity-60">{p.name}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-b border-border">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { n: "12ms", l: "End-to-end latency" },
            { n: "60fps", l: "Sustained at 4K" },
            { n: "468", l: "Facial landmarks" },
            { n: "2.4M+", l: "Faces swapped" },
          ].map((s) => (
            <div key={s.l} className="border-l-2 border-accent pl-5">
              <div className="text-4xl md:text-5xl font-extrabold tracking-tighter">{s.n}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-2">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="engine" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: "01/", t: "Face + Voice Sync", d: "Swap your face and clone your voice simultaneously. Real-time face change paired with neural voice cloning for total identity transformation." },
              { n: "02/", t: "Hand + Mic Detection", d: "Proprietary occlusion mapping keeps hands and microphones in the foreground — your swap never breaks immersion." },
              { n: "03/", t: "Any Face. No Limits.", d: "Upload any portrait image. Our engine reconstructs 3D facial geometry in seconds for an instant swap." },
              { n: "04/", t: "Image Generation", d: "Generate stunning AI face-swapped images from a single photo. Advanced adjustments, batch export, no watermark on Pro." },
              { n: "05/", t: "Video Calls Ready", d: "Plug into Zoom, Meet, Teams via our Built-In Virtual Camera. Zero setup, broadcast-grade output in any meeting." },
              { n: "06/", t: "Studio Quality Output", d: "Neural upscaling and temporal smoothing eliminate flickering. The industry standard for virtual production." },
            ].map((f) => (
              <div key={f.n} className="p-8 border border-border bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                <div className="font-mono text-accent text-xs mb-12">{f.n}</div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight">{f.t}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-32 px-6 overflow-hidden border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute -inset-20 bg-accent/10 blur-[120px] rounded-full" />
              <div className="relative aspect-square bg-white/5 border border-border rounded-2xl overflow-hidden">
                <img
                  src={adFaceSwap}
                  alt="Cinematic AI face swap transformation showing seamless neural mesh overlay in dramatic noir lighting"
                  width={1024}
                  height={1024}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
                <div className="absolute bottom-6 left-6 font-mono text-[10px] text-accent uppercase tracking-widest">
                  <span>Face Swap Engine v2.4</span>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <p className="text-[10px] font-mono text-accent uppercase tracking-[0.4em]">See it in action</p>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter leading-[0.95]">
                SEAMLESS <span className="text-accent italic">IDENTITY</span><br />TRANSFORMATION
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Our neural engine maps 468 facial landmarks in real time, producing swaps so smooth they fool the human eye. Upload any portrait and watch the transformation happen instantly.
              </p>
              <div className="flex flex-wrap gap-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="flex items-center gap-2"><span className="size-1.5 bg-accent" /> 468 Landmarks</span>
                <span className="flex items-center gap-2"><span className="size-1.5 bg-accent" /> 12ms Latency</span>
                <span className="flex items-center gap-2"><span className="size-1.5 bg-accent" /> 60 FPS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="usecases" className="py-32 px-6 bg-white/[0.02] border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <p className="text-[10px] font-mono text-accent uppercase tracking-[0.4em] mb-4">For work · For home · For fun</p>
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-[0.95]">
                READY TO ENHANCE <br />ANY <span className="text-accent italic">VIDEO</span> OR <span className="text-accent italic">STREAM</span>.
              </h2>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed">
              From boardroom calls to Twitch raids — embrace avant-garde flair, foster a playful atmosphere, and ignite team creativity with a single click.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { t: "Conferences", d: "Zoom · Meet · Teams · Webex. Show up as anyone." },
              { t: "Live Streaming", d: "Twitch · YouTube Live · Facebook Live. Stream as a persona." },
              { t: "Video Recording", d: "OBS · Loom · Riverside. Pre-recorded content with consistent identity." },
            ].map((u) => (
              <div key={u.t} className="group relative p-8 border border-border bg-background hover:border-accent transition-colors overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="relative text-2xl font-bold mb-3 tracking-tight">{u.t}</h3>
                <p className="relative text-sm text-muted-foreground">{u.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      <section id="integration" className="py-32 bg-white/[0.02] border-y border-border overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/3">
              <h2 className="text-4xl font-extrabold tracking-tighter mb-6">COMPLETE <br />DASHBOARD <br />CONTROL</h2>
              <p className="text-muted-foreground text-sm mb-8 leading-relaxed">Tune your swap level, mask blur, and temporal filters with precise hardware-like controls.</p>
              <ul className="space-y-4 font-mono text-[11px] uppercase tracking-wider">
                <li className="flex items-center gap-3 text-accent"><span className="size-1.5 bg-accent" /> Live Tracking Toggle</li>
                <li className="flex items-center gap-3 opacity-50"><span className="size-1.5 bg-white" /> Many-Faces Parse</li>
                <li className="flex items-center gap-3 opacity-50"><span className="size-1.5 bg-white" /> High Frequency Filter</li>
              </ul>
            </div>
            <div className="lg:w-2/3">
              <div className="w-full aspect-video bg-black rounded-lg border border-white/10 shadow-2xl overflow-hidden">
                <img src={appUi} alt="Visage.AI desktop application interface" width={1280} height={832} loading="lazy" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 overflow-hidden border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 order-2 lg:order-1">
              <p className="text-[10px] font-mono text-accent uppercase tracking-[0.4em]">Multi-platform</p>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter leading-[0.95]">
                ONE CAMERA.<br />EVERY <span className="text-accent italic">PLATFORM</span>.
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Our Built-In Virtual Camera plugs into Zoom, Google Meet, Teams, YouTube, Facebook, and Twitch simultaneously. No extra setup. No OBS plugins. Just select "Visage.AI" as your camera and swap your face on any platform instantly.
              </p>
              <div className="flex flex-wrap gap-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="flex items-center gap-2"><span className="size-1.5 bg-accent" /> Zoom</span>
                <span className="flex items-center gap-2"><span className="size-1.5 bg-accent" /> Meet</span>
                <span className="flex items-center gap-2"><span className="size-1.5 bg-accent" /> Teams</span>
                <span className="flex items-center gap-2"><span className="size-1.5 bg-accent" /> Twitch</span>
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="absolute -inset-20 bg-accent/10 blur-[120px] rounded-full" />
              <div className="relative aspect-square bg-white/5 border border-border rounded-2xl overflow-hidden">
                <img
                  src={adVirtualCamera}
                  alt="Dark cinematic desk setup showing multiple video call platforms with AI face swaps applied simultaneously"
                  width={1024}
                  height={1024}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-background/60 to-transparent" />
                <div className="absolute bottom-6 right-6 font-mono text-[10px] text-accent uppercase tracking-widest">
                  <span>Built-In Virtual Camera</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="text-[10px] font-mono text-accent uppercase tracking-[0.4em] mb-4">Workflow</p>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-[0.95] max-w-3xl">
              FROM PHOTO TO <span className="text-accent italic">LIVE SWAP</span> IN 30 SECONDS.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-border">
            {[
              { n: "STEP 01", t: "Upload any face", d: "Drop in a single portrait. Our engine reconstructs 3D facial geometry in under 2 seconds." },
              { n: "STEP 02", t: "Pick your platform", d: "Select Visage.AI as your camera input in Zoom, Meet, Teams, OBS or Twitch." },
              { n: "STEP 03", t: "Go live", d: "Stream, call, or record with cinema-grade swap — hand and mic occlusion handled automatically." },
            ].map((s) => (
              <div key={s.n} className="bg-background p-10 hover:bg-white/[0.02] transition-colors">
                <div className="font-mono text-[10px] text-accent uppercase tracking-[0.3em] mb-8">{s.n}</div>
                <h3 className="text-2xl font-bold tracking-tight mb-3">{s.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="platforms" className="py-32 px-6 bg-white/[0.02] border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="text-[10px] font-mono text-accent uppercase tracking-[0.4em] mb-4">Platform Guide</p>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-[0.95] max-w-3xl">
              TUNED FOR EVERY <span className="text-accent italic">PLATFORM</span>.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Zoom",
                Icon: ZoomIcon,
                features: ["Up to 1080p face swap", "Virtual camera auto-detect", "Gallery + speaker view aware"],
                settings: [
                  { k: "Camera", v: "Visage.AI Virtual Camera" },
                  { k: "Resolution", v: "1080p @ 60fps" },
                  { k: "Original video", v: "OFF (disable HD for lower bandwidth)" },
                  { k: "Touch up appearance", v: "OFF" },
                  { k: "Swap latency", v: "12ms" },
                ],
                tip: "Best for: Daily standups, webinars, hybrid meetings",
              },
              {
                name: "Google Meet",
                Icon: MeetIcon,
                features: ["Browser + desktop app", "Auto-framing compatible", "Noise cancellation safe"],
                settings: [
                  { k: "Camera", v: "Visage.AI Virtual Camera" },
                  { k: "Resolution", v: "720p / 1080p" },
                  { k: "Send resolution", v: "High definition" },
                  { k: "Receive resolution", v: "Auto" },
                  { k: "Studio look", v: "OFF" },
                ],
                tip: "Best for: Sales calls, client presentations, education",
              },
              {
                name: "Microsoft Teams",
                Icon: TeamsIcon,
                features: ["Native virtual camera", "Background effect bypass", "Together mode + swap"],
                settings: [
                  { k: "Camera", v: "Visage.AI Virtual Camera" },
                  { k: "Resolution", v: "1080p @ 30fps" },
                  { k: "Background effects", v: "OFF in Teams, use Visage" },
                  { k: "Noise suppression", v: "High (safe with swap)" },
                  { k: "Frame interpolation", v: "ON for smoother motion" },
                ],
                tip: "Best for: Enterprise calls, team all-hands, training",
              },
              {
                name: "YouTube",
                Icon: YouTubeIcon,
                features: ["Live streaming + premieres", "RTMP ingest ready", "Chat overlay safe"],
                settings: [
                  { k: "Encoder", v: "OBS / Streamlabs" },
                  { k: "Camera source", v: "Visage.AI Virtual Camera" },
                  { k: "Bitrate", v: "6,000 Kbps (1080p60)" },
                  { k: "Keyframe", v: "2 seconds" },
                  { k: "Preset", v: "Quality / Slow" },
                ],
                tip: "Best for: Live events, reaction channels, virtual interviews",
              },
              {
                name: "Facebook",
                Icon: FacebookIcon,
                features: ["Live + Stories compatible", "Portrait + landscape swap", "Cross-post to Instagram"],
                settings: [
                  { k: "Camera", v: "Visage.AI Virtual Camera" },
                  { k: "Resolution", v: "720p @ 30fps" },
                  { k: "Stabilization", v: "OFF (swap handles it)" },
                  { k: "Bitrate", v: "4,000 Kbps recommended" },
                  { k: "Audio sync", v: "+40ms offset if drift detected" },
                ],
                tip: "Best for: Community livestreams, influencer content, events",
              },
              {
                name: "Twitch",
                Icon: TwitchIcon,
                features: ["Low-latency mode ready", "7-day VOD with swap", "Extension overlay safe"],
                settings: [
                  { k: "Encoder", v: "OBS / XSplit" },
                  { k: "Camera source", v: "Visage.AI Virtual Camera" },
                  { k: "Bitrate", v: "6,000 Kbps (1080p60)" },
                  { k: "CPU preset", v: "Fast for real-time swap" },
                  { k: "Webcam FPS", v: "60 (match stream FPS)" },
                ],
                tip: "Best for: Gameplay streams, Just Chatting, charity marathons",
              },
            ].map((plat) => (
              <div key={plat.name} className="group border border-border bg-background hover:border-accent transition-colors p-8">
                <div className="flex items-center gap-3 mb-6">
                  <plat.Icon className="size-6 text-accent" />
                  <h3 className="text-2xl font-bold tracking-tight">{plat.name}</h3>
                </div>
                <ul className="space-y-2 mb-6">
                  {plat.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="size-1.5 bg-accent mt-2 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-border pt-6 mb-4">
                  <p className="text-[10px] font-mono text-accent uppercase tracking-[0.3em] mb-4">Recommended Settings</p>
                  <dl className="space-y-3">
                    {plat.settings.map((s) => (
                      <div key={s.k} className="flex justify-between items-start gap-4 text-sm">
                        <dt className="text-muted-foreground font-mono text-[11px] uppercase tracking-wider shrink-0">{s.k}</dt>
                        <dd className="text-right text-foreground">{s.v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{plat.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="performance" className="py-32 px-6 border-y border-border bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <p className="font-mono text-xs text-accent uppercase tracking-[0.3em] mb-4 text-center">// Performance Presets</p>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter mb-4 text-center">TUNE PER PLATFORM</h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto text-center mb-12">Pick a platform, then dial in latency-first, balanced, or quality-first. Settings update instantly.</p>

          <PresetSelector platforms={PLATFORMS} />

          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="p-5 border border-border rounded-xl bg-background">
              <p className="font-mono text-[10px] text-accent uppercase tracking-widest mb-2">⚡ Low-latency</p>
              <p className="text-xs text-muted-foreground leading-relaxed">For interactive calls and reactive streams. Trades visual sharpness for sub-frame response.</p>
            </div>
            <div className="p-5 border border-border rounded-xl bg-background">
              <p className="font-mono text-[10px] text-accent uppercase tracking-widest mb-2">⚖ Balanced</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Default for most users. Crisp 1080p with latency that disappears in normal conversation.</p>
            </div>
            <div className="p-5 border border-border rounded-xl bg-background">
              <p className="font-mono text-[10px] text-accent uppercase tracking-widest mb-2">✦ Quality</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Maximum fidelity for VOD recordings, premium streams, and pre-recorded content.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-32 px-6">

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-mono text-accent uppercase tracking-[0.4em] mb-4">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter">CHOOSE YOUR TIER</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mt-4">
              Enter the same email you use to sign in to the desktop app. After payment, that account is upgraded to Pro automatically.
            </p>
            <label className="mt-8 mx-auto max-w-md block text-left">
              <span className="text-[10px] font-mono text-accent uppercase tracking-[0.3em]">Desktop account email</span>
              <input
                type="email"
                autoComplete="email"
                value={accountEmail}
                onChange={(event) => setAccountEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full bg-white/[0.03] border border-border px-4 py-3 text-sm outline-none focus:border-accent"
              />
            </label>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {/* Free */}
            <div className="p-8 border border-border bg-white/[0.02] flex flex-col">
              <h3 className="text-4xl font-extrabold tracking-tighter mb-4">Free</h3>
              <p className="text-muted-foreground text-sm mb-8">Your current version</p>
              <ul className="space-y-3 text-sm flex-1">
                {[
                  "Multiple Real-Time Face Swap Modes",
                  "Real-Time Voice Changer",
                  "Limited Voice Cloning",
                  "Video FaceSwap",
                  "Enhanced FaceSwap Quality",
                  "Unlimited Face Uploads",
                  "Unlimited FaceSwap Duration",
                  "Embeddable in Zoom or Twitch",
                  "Built-In Virtual Camera",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="size-1.5 bg-accent mt-2 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro Monthly — pro_1 */}
            <div className="p-8 border border-border bg-white/[0.02] flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-4xl font-extrabold tracking-tighter text-accent italic">Pro</h3>
                <span className="bg-accent text-black font-mono font-bold text-xs px-2 py-1 tracking-tighter">50% OFF</span>
              </div>
              <div className="mb-2">
                <span className="text-4xl font-extrabold">$8.99</span>
                <span className="text-muted-foreground"> / month</span>
              </div>
              <p className="text-muted-foreground text-sm line-through mb-8 font-mono">$29.99 / month</p>
              <ul className="space-y-3 text-sm flex-1 mb-8">
                {[
                  "All Free Version Features",
                  "4K HD video FaceSwap",
                  "High-definition face model",
                  "Unlimited Voice Cloning",
                  "Advanced Tuning Mode",
                  "No Watermark",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="size-1.5 bg-accent mt-2 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <CheckoutButton planId="pro_monthly" accountEmail={accountEmail} variant="outline">
                Upgrade Monthly
              </CheckoutButton>
              <div className="mt-3">
                <CryptoCheckoutButton planId="pro_monthly" accountEmail={accountEmail} />
              </div>
            </div>

            {/* Pro Yearly — pro_2 */}
            <div className="relative p-8 border border-accent bg-accent/[0.04] flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-black font-mono font-bold text-[10px] uppercase tracking-widest px-4 py-1">
                Most Popular Choice
              </div>
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-4xl font-extrabold tracking-tighter text-accent italic">Pro</h3>
                <span className="bg-accent text-black font-mono font-bold text-xs px-2 py-1 tracking-tighter">75% OFF</span>
              </div>
              <div className="mb-2">
                <span className="text-4xl font-extrabold">$49.9</span>
                <span className="text-muted-foreground"> / year</span>
              </div>
              <p className="text-muted-foreground text-sm line-through mb-8 font-mono">$198.99 / year</p>
              <ul className="space-y-3 text-sm flex-1 mb-8">
                {[
                  "All Free Version Features",
                  "4K HD video FaceSwap",
                  "High-definition face model",
                  "Unlimited Voice Cloning",
                  "Advanced Tuning Mode",
                  "No Watermark",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="size-1.5 bg-accent mt-2 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <CheckoutButton planId="pro_yearly" accountEmail={accountEmail} variant="solid">
                Upgrade Yearly
              </CheckoutButton>
              <div className="mt-3">
                <CryptoCheckoutButton planId="pro_yearly" accountEmail={accountEmail} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 overflow-hidden border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute -inset-20 bg-accent/10 blur-[120px] rounded-full" />
              <div className="relative aspect-square bg-white/5 border border-border rounded-2xl overflow-hidden">
                <img
                  src={adImageGen}
                  alt="Futuristic dark interface showing multiple AI-generated face-swapped portraits floating on holographic glass panels"
                  width={1024}
                  height={1024}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
                <div className="absolute bottom-6 left-6 font-mono text-[10px] text-accent uppercase tracking-widest">
                  <span>AI Image Generation</span>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <p className="text-[10px] font-mono text-accent uppercase tracking-[0.4em]">Pro Feature</p>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter leading-[0.95]">
                GENERATE <span className="text-accent italic">STUNNING</span><br />PORTRAITS
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Upload a single photo and generate unlimited AI face-swapped portraits with advanced adjustments. Batch export, no watermark, and full creative control — all processed locally on your device.
              </p>
              <div className="flex flex-wrap gap-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="flex items-center gap-2"><span className="size-1.5 bg-accent" /> Batch Export</span>
                <span className="flex items-center gap-2"><span className="size-1.5 bg-accent" /> No Watermark</span>
                <span className="flex items-center gap-2"><span className="size-1.5 bg-accent" /> Local Processing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-white/[0.02] border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="text-[10px] font-mono text-accent uppercase tracking-[0.4em] mb-4">Field reports</p>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-[0.95] max-w-3xl">
              TRUSTED BY <span className="text-accent italic">CREATORS</span>, STREAMERS &amp; STUDIOS.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { q: "I join every Zoom standup as a different character. The team lost it on day one — now it's our ritual. Zero lag, zero setup.", a: "Mira K.", r: "Engineering Lead · Zoom Power User" },
              { q: "Swapped my face live on a 6-hour Twitch charity stream. Chat went wild. Hand occlusion over my mic is actually flawless.", a: "Drex_TV", r: "Twitch Partner · 240k followers" },
              { q: "Our whole sales team uses Visage on Google Meet. We branded every call with a mascot face. Clients remember us instantly.", a: "Jordan A.", r: "Head of Growth · SaaS Startup" },
            ].map((t) => (
              <figure key={t.a} className="p-8 border border-border bg-background flex flex-col">
                <div className="text-accent text-3xl font-extrabold leading-none mb-4">"</div>
                <blockquote className="text-sm leading-relaxed flex-1 mb-6">{t.q}</blockquote>
                <figcaption className="font-mono text-[10px] uppercase tracking-widest">
                  <div className="text-foreground">{t.a}</div>
                  <div className="text-muted-foreground mt-1">{t.r}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="platform-faq" className="py-32 px-6 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <p className="font-mono text-xs text-accent uppercase tracking-[0.3em] mb-4 text-center">// Platform Troubleshooting</p>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter mb-4 text-center">PER-PLATFORM FAQ</h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto text-center mb-16">Latency, audio routing, and lighting tips tuned for each app's quirks.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLATFORMS.map((p) => {
              const tips: Record<string, { latency: string; audio: string; lighting: string }> = {
                Zoom: {
                  latency: "Disable 'Original sound' enhancements and 'HD' if you see >40ms drift. Use Wired LAN; Zoom adapts bitrate aggressively on Wi-Fi.",
                  audio: "Route Visage voice swap through VB-Cable, then set VB-Cable as Zoom mic. Disable Zoom's noise suppression (set to Low) so the swapped voice isn't gated.",
                  lighting: "Soft key light at 45°, ~5500K. Avoid overhead fluorescents — Zoom's auto-exposure crushes shadows and confuses landmark tracking.",
                },
                "Google Meet": {
                  latency: "Use the desktop Chrome build, not the browser tab in a background window — Meet throttles inactive tabs and adds 80–120ms.",
                  audio: "Meet aggressively echo-cancels. Use a headset, and select VB-Cable as input AFTER joining the call to avoid Meet resetting it.",
                  lighting: "Disable Meet's 'Adjust lighting' filter — it fights Visage's tone mapping. Use one diffused frontal source for cleanest results.",
                },
                "Microsoft Teams": {
                  latency: "Turn off Teams GPU hardware acceleration if you see frame stutter — Teams and Visage compete for the same NVENC slots.",
                  audio: "Set Visage virtual mic in Teams Devices panel BEFORE the call. Teams caches device selection per-meeting and won't switch mid-call cleanly.",
                  lighting: "Teams applies heavy noise reduction to video. Boost key light +1 stop vs. Zoom to preserve facial detail after Teams' encoder.",
                },
                YouTube: {
                  latency: "For RTMP, set OBS keyframe interval to 2s and use 'Ultra low-latency' in YouTube Studio. Expect 2–5s glass-to-glass.",
                  audio: "Sync voice swap via OBS audio monitor — add a 60–80ms delay to your camera source to align lips with the swapped audio.",
                  lighting: "YouTube's VP9 encoder loves contrast. Use a rim light + key light combo; flat lighting compresses into mush at 1080p60.",
                },
                Facebook: {
                  latency: "Facebook Live caps at 720p60 in most regions. Don't push 1080p — it transcodes and adds ~1s of latency.",
                  audio: "Stories/Reels strip metadata; bake voice swap into the export rather than relying on FB's live processing.",
                  lighting: "FB's mobile-first encoder favors warm tones. Shift key light to ~4200K for natural skin reproduction post-compression.",
                },
                Twitch: {
                  latency: "Enable Low Latency Mode in Twitch Stream settings + OBS 'tune=zerolatency'. Sub-2s end-to-end is achievable.",
                  audio: "Use a separate audio interface for chat vs. swap voice — Twitch's audio normalization will pump if both share one bus.",
                  lighting: "Streamers underlight constantly. Visage needs ≥300 lux on the face for stable 468-point tracking. Add a fill light.",
                },
              };
              const t = tips[p.name];
              return (
                <div key={p.name} className="p-6 bg-background border border-border rounded-2xl hover:border-accent transition-colors">
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
                    <p.Icon className="size-7 text-accent" />
                    <span className="font-mono text-sm font-bold uppercase tracking-tight">{p.name}</span>
                  </div>
                  <div className="space-y-4 text-xs">
                    <div>
                      <p className="font-mono text-[10px] text-accent uppercase tracking-widest mb-1.5">⚡ Latency</p>
                      <p className="text-muted-foreground leading-relaxed">{t.latency}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] text-accent uppercase tracking-widest mb-1.5">🎙 Audio Detection</p>
                      <p className="text-muted-foreground leading-relaxed">{t.audio}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] text-accent uppercase tracking-widest mb-1.5">💡 Lighting</p>
                      <p className="text-muted-foreground leading-relaxed">{t.lighting}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="faq" className="py-32 px-6 max-w-3xl mx-auto text-center">

        <h2 className="text-3xl font-extrabold tracking-tighter mb-12">FREQUENTLY ASKED</h2>
        <div className="space-y-4 text-left mb-24">
          {[
            { k: "What sets Visage.AI apart?", v: "Premium real-time face + voice swap at an affordable price, higher resolutions, unlimited credits, and unrestricted face uploads — paired with an interface that's effortless for any level of user." },
            { k: "Are there any privacy concerns?", v: "No. All face and voice data is processed locally on your device. Nothing is uploaded to the cloud, ensuring your identity and source images remain fully private." },
            { k: "How does billing work?", v: "Pay with card via Paddle, or with crypto via NOWPayments (Bitcoin, Ethereum, Solana, Tron, or BNB). Use the same email as your desktop app account. After the payment confirms, that account is upgraded to Pro — sign in or restart the app to unlock it." },
            { k: "Image generation included?", v: "Yes. Generate AI face-swapped images from any photo with advanced adjustments, batch export, and no watermark on Pro." },
            { k: "Hardware requirements", v: "Optimized for NVIDIA RTX series. 8GB VRAM recommended for real-time 4K output." },
            { k: "Platform support", v: "Works via Built-In Virtual Camera. Compatible with Zoom, Meet, Teams, YouTube, Facebook, Twitch and any app accepting a webcam input." },
          ].map((q) => (
            <div key={q.k} className="border-b border-border pb-4">
              <p className="font-mono text-xs text-accent mb-2 uppercase tracking-widest">{q.k}</p>
              <p className="text-sm text-muted-foreground">{q.v}</p>
            </div>
          ))}
        </div>

        <div id="cta" className="p-12 border border-accent/20 bg-accent/[0.03] rounded-3xl">
          <h3 className="text-4xl font-extrabold tracking-tighter mb-6">READY TO RECODE REALITY?</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center max-w-xl mx-auto">
            <a
              href="#pricing"
              className="px-10 py-5 bg-accent text-black font-mono font-bold uppercase tracking-tighter hover:translate-x-1 transition-transform cursor-pointer"
            >
              Get Pro Access
            </a>
            <button
              type="button"
              className="px-10 py-5 bg-foreground text-background font-mono font-bold uppercase tracking-tighter hover:bg-accent hover:text-black transition-all cursor-pointer"
            >
              Download for Desktop
            </button>
          </div>
          <p className="mt-6 text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
            Version 2.4.0 • 142MB • Windows &amp; macOS • Secure checkout by Paddle
          </p>
        </div>
      </section>

      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-50">
            <div className="size-6 bg-white flex items-center justify-center font-mono font-bold text-black text-[10px]">V</div>
            <span className="font-mono tracking-tighter text-[10px] uppercase">Visage Labs © 2026</span>
          </div>
          <div className="flex gap-8 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <a href="#" className="hover:text-accent">Privacy</a>
            <a href="#" className="hover:text-accent">Terms</a>
            <a href="#" className="hover:text-accent">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
