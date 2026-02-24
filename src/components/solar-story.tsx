"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Mode = "distance" | "size" | "light" | "orbits" | "pocket";

type Planet = {
  name: string;
  distanceAU: number;
  diameterKm: number;
  orbitDays: number;
  color: string;
  fact: string;
};

type Chapter = {
  mode: Mode;
  kicker: string;
  title: string;
  body: string;
  stat: string;
};

type DrawState = {
  x: number;
  y: number;
  r: number;
  angle: number;
};

type Star = {
  x: number;
  y: number;
  size: number;
  alpha: number;
};

const PLANETS: Planet[] = [
  {
    name: "Mercury",
    distanceAU: 0.39,
    diameterKm: 4879,
    orbitDays: 88,
    color: "#f5cfab",
    fact: "Mercury laps Earth about 4.1 times per Earth year.",
  },
  {
    name: "Venus",
    distanceAU: 0.72,
    diameterKm: 12104,
    orbitDays: 225,
    color: "#ffc983",
    fact: "Venus is almost Earth-sized, but wrapped in crushing heat and clouds.",
  },
  {
    name: "Earth",
    distanceAU: 1,
    diameterKm: 12742,
    orbitDays: 365,
    color: "#7ed8ff",
    fact: "Earth is our calibration point: 1 AU, 1 year, 1 Earth diameter.",
  },
  {
    name: "Mars",
    distanceAU: 1.52,
    diameterKm: 6779,
    orbitDays: 687,
    color: "#ff8e6e",
    fact: "Mars sits close on paper, but still tens of millions of km away.",
  },
  {
    name: "Jupiter",
    distanceAU: 5.2,
    diameterKm: 139820,
    orbitDays: 4333,
    color: "#f9d9b1",
    fact: "Jupiter is over 11x Earth's diameter and dominates planetary mass.",
  },
  {
    name: "Saturn",
    distanceAU: 9.58,
    diameterKm: 116460,
    orbitDays: 10759,
    color: "#fee2a0",
    fact: "Saturn's rings are huge, but remarkably thin.",
  },
  {
    name: "Uranus",
    distanceAU: 19.22,
    diameterKm: 50724,
    orbitDays: 30687,
    color: "#a5edff",
    fact: "Uranus rotates on its side, as if knocked over long ago.",
  },
  {
    name: "Neptune",
    distanceAU: 30.06,
    diameterKm: 49244,
    orbitDays: 60190,
    color: "#76a7ff",
    fact: "Neptune takes 165 Earth years to orbit once.",
  },
];

const CHAPTERS: Chapter[] = [
  {
    mode: "distance",
    kicker: "Aha #1",
    title: "Space is mostly empty",
    body: "The inner planets look packed in diagrams, but most of the solar system is raw distance. Log scale reveals just how abruptly the gaps open up.",
    stat: "Neptune is 30 AU from the Sun.",
  },
  {
    mode: "size",
    kicker: "Aha #2",
    title: "Jupiter breaks your intuition",
    body: "Keep distances calm, then inflate diameters to compare bodies honestly. The gas giants stop feeling like points and start feeling like worlds.",
    stat: "Jupiter's diameter is 10.97x Earth.",
  },
  {
    mode: "light",
    kicker: "Aha #3",
    title: "Sunlight has a travel budget",
    body: "Even photons need time. Watch the pulse leave the Sun and reach each orbit. Morning at Neptune is nearly four light-hours away.",
    stat: "Sunlight to Neptune: ~4.17 hours.",
  },
  {
    mode: "orbits",
    kicker: "Aha #4",
    title: "Some years sprint, others crawl",
    body: "Mercury races around the Sun while Neptune drifts. In one Earth year, Mercury loops repeatedly and Neptune barely moves.",
    stat: "Mercury year: 88 days. Neptune year: 165 Earth years.",
  },
  {
    mode: "pocket",
    kicker: "Aha #5",
    title: "If Earth were a peppercorn",
    body: "Shrink Earth to a 4 mm peppercorn. Neptune would still be about 116 meters away. Miniature planets, giant silence between them.",
    stat: "Scale: 1 AU = 4 meters from Earth.",
  },
];

const EARTH_DIAMETER = PLANETS[2].diameterKm;
const DISTANCE_MIN = PLANETS[0].distanceAU;
const DISTANCE_MAX = PLANETS[PLANETS.length - 1].distanceAU;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

function scaleLinear(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  if (inMax === inMin) {
    return outMin;
  }
  const ratio = (value - inMin) / (inMax - inMin);
  return outMin + ratio * (outMax - outMin);
}

function scaleLog(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const safeValue = Math.max(value, 0.0001);
  const min = Math.max(inMin, 0.0001);
  const max = Math.max(inMax, 0.0001);
  const ratio = (Math.log(safeValue) - Math.log(min)) / (Math.log(max) - Math.log(min));
  return outMin + ratio * (outMax - outMin);
}

export function SolarStory() {
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const statesRef = useRef<DrawState[]>(PLANETS.map(() => ({ x: 0, y: 0, r: 0, angle: 0 })));
  const projectedRef = useRef<DrawState[]>(PLANETS.map(() => ({ x: 0, y: 0, r: 0, angle: 0 })));
  const starsRef = useRef<Star[]>([]);
  const activeRef = useRef(0);
  const hoverRef = useRef<number | null>(null);
  const selectedRef = useRef<number | null>(null);

  const [activeChapter, setActiveChapter] = useState(0);
  const [hoveredPlanet, setHoveredPlanet] = useState<number | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<number | null>(null);

  const focusIndex = selectedPlanet ?? hoveredPlanet ?? 2;
  const focusPlanet = PLANETS[focusIndex];
  const focusLightMinutes = focusPlanet.distanceAU * 8.317;

  useEffect(() => {
    activeRef.current = activeChapter;
  }, [activeChapter]);

  useEffect(() => {
    hoverRef.current = hoveredPlanet;
  }, [hoveredPlanet]);

  useEffect(() => {
    selectedRef.current = selectedPlanet;
  }, [selectedPlanet]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          const index = Number((entry.target as HTMLElement).dataset.index ?? "0");
          setActiveChapter(index);
        });
      },
      {
        root: null,
        rootMargin: "-38% 0px -42% 0px",
        threshold: [0.25, 0.5, 0.75],
      },
    );

    chapterRefs.current.forEach((chapter) => {
      if (chapter) {
        observer.observe(chapter);
      }
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let width = 0;
    let height = 0;
    let animationFrame = 0;

    const initStars = () => {
      const count = Math.max(90, Math.round((width * height) / 10000));
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.4 + Math.random() * 1.9,
        alpha: 0.2 + Math.random() * 0.7,
      }));
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(320, rect.width);
      height = Math.max(520, rect.height);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      initStars();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const drawAxisTicks = (mode: Mode, axisStart: number, axisEnd: number, axisY: number) => {
      const tickColor = "rgba(228,236,246,0.66)";
      context.strokeStyle = tickColor;
      context.fillStyle = "rgba(235,243,250,0.85)";
      context.font = "12px var(--font-body)";

      const ticks: { value: number; label: string; x: number }[] = [];

      if (mode === "distance") {
        [0.4, 1, 5, 10, 30].forEach((value) => {
          ticks.push({
            value,
            label: `${value} AU`,
            x: scaleLog(value, DISTANCE_MIN, DISTANCE_MAX, axisStart, axisEnd),
          });
        });
      } else if (mode === "light") {
        const maxLight = DISTANCE_MAX * 8.317;
        [3, 10, 30, 60, 120, 240].forEach((value) => {
          ticks.push({
            value,
            label: value >= 60 ? `${Math.round(value / 60)}h` : `${value}m`,
            x: scaleLinear(value, 0, maxLight, axisStart, axisEnd),
          });
        });
      } else if (mode === "pocket") {
        [-2, 0, 20, 40, 80, 120].forEach((value) => {
          ticks.push({
            value,
            label: value === 0 ? "Earth" : `${value}m`,
            x: scaleLinear(value, -2.5, 120, axisStart, axisEnd),
          });
        });
      } else {
        [1, 2, 4, 8, 11].forEach((value) => {
          ticks.push({
            value,
            label: `${value}x Earth`,
            x: scaleLinear(value, 0.8, 11.5, axisStart, axisEnd),
          });
        });
      }

      ticks.forEach((tick) => {
        context.beginPath();
        context.moveTo(tick.x, axisY + 8);
        context.lineTo(tick.x, axisY + 18);
        context.stroke();
        context.fillText(tick.label, tick.x - 14, axisY + 35);
      });
    };

    const draw = (timestamp: number) => {
      const seconds = timestamp * 0.001;
      const mode = CHAPTERS[activeRef.current].mode;
      const hover = hoverRef.current;
      const selected = selectedRef.current;
      const focus = selected ?? hover;

      context.clearRect(0, 0, width, height);

      const bgGradient = context.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, "#07131f");
      bgGradient.addColorStop(0.55, "#0b1c2d");
      bgGradient.addColorStop(1, "#102941");
      context.fillStyle = bgGradient;
      context.fillRect(0, 0, width, height);

      const aura = context.createRadialGradient(width * 0.75, height * 0.1, 20, width * 0.75, height * 0.1, width * 0.6);
      aura.addColorStop(0, "rgba(85,160,255,0.25)");
      aura.addColorStop(1, "rgba(85,160,255,0)");
      context.fillStyle = aura;
      context.fillRect(0, 0, width, height);

      starsRef.current.forEach((star, index) => {
        const shimmer = 0.5 + 0.5 * Math.sin(seconds * 0.5 + index * 0.18);
        context.fillStyle = `rgba(233,240,255,${star.alpha * shimmer})`;
        context.beginPath();
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        context.fill();
      });

      if (mode === "orbits") {
        const centerX = width * 0.5;
        const centerY = height * 0.57;
        const maxOrbit = Math.min(width * 0.42, height * 0.34);

        context.strokeStyle = "rgba(198,218,243,0.22)";
        context.lineWidth = 1;

        PLANETS.forEach((planet, index) => {
          const orbitRadius = scaleLinear(
            Math.sqrt(planet.distanceAU),
            Math.sqrt(DISTANCE_MIN),
            Math.sqrt(DISTANCE_MAX),
            48,
            maxOrbit,
          );

          context.beginPath();
          context.ellipse(centerX, centerY, orbitRadius, orbitRadius * 0.48, 0, 0, Math.PI * 2);
          context.stroke();

          const targetAngle = seconds * (280 / planet.orbitDays) * Math.PI * 2 + index * 0.35;
          const targetX = centerX + Math.cos(targetAngle) * orbitRadius;
          const targetY = centerY + Math.sin(targetAngle) * orbitRadius * 0.48;
          const targetR = clamp(2.7 + Math.pow(planet.diameterKm / EARTH_DIAMETER, 0.33) * 5, 3, 14);

          const state = statesRef.current[index];
          state.x = lerp(state.x || targetX, targetX, 0.1);
          state.y = lerp(state.y || targetY, targetY, 0.1);
          state.r = lerp(state.r || targetR, targetR, 0.16);

          projectedRef.current[index] = { ...state };
        });

        context.beginPath();
        const sunGlow = context.createRadialGradient(centerX, centerY, 5, centerX, centerY, 50);
        sunGlow.addColorStop(0, "rgba(255,246,192,0.95)");
        sunGlow.addColorStop(1, "rgba(255,205,90,0)");
        context.fillStyle = sunGlow;
        context.arc(centerX, centerY, 48, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = "#ffd476";
        context.beginPath();
        context.arc(centerX, centerY, 13, 0, Math.PI * 2);
        context.fill();
      } else {
        const axisStart = 90;
        const axisEnd = width - 90;
        const axisY = height * 0.62;

        context.strokeStyle = "rgba(214,230,246,0.38)";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(axisStart, axisY);
        context.lineTo(axisEnd, axisY);
        context.stroke();

        const sunX = axisStart - 42;
        const sunGlow = context.createRadialGradient(sunX, axisY, 8, sunX, axisY, 55);
        sunGlow.addColorStop(0, "rgba(255,242,186,0.95)");
        sunGlow.addColorStop(1, "rgba(255,199,95,0)");
        context.fillStyle = sunGlow;
        context.beginPath();
        context.arc(sunX, axisY, 52, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = "#ffd67f";
        context.beginPath();
        context.arc(sunX, axisY, 14, 0, Math.PI * 2);
        context.fill();

        drawAxisTicks(mode, axisStart, axisEnd, axisY);

        if (mode === "light") {
          const pulseProgress = (seconds * 0.2) % 1;
          const pulseX = axisStart + pulseProgress * (axisEnd - axisStart);

          context.strokeStyle = "rgba(138,207,255,0.7)";
          context.lineWidth = 2.5;
          context.beginPath();
          context.moveTo(pulseX, axisY - 78);
          context.lineTo(pulseX, axisY + 74);
          context.stroke();
        }

        PLANETS.forEach((planet, index) => {
          const diameterRatio = planet.diameterKm / EARTH_DIAMETER;
          const lightMinutes = planet.distanceAU * 8.317;
          const metersFromEarth = (planet.distanceAU - 1) * 4;
          let targetX = axisStart;
          let targetY = axisY;
          let targetR = 6;

          if (mode === "distance") {
            targetX = scaleLog(planet.distanceAU, DISTANCE_MIN, DISTANCE_MAX, axisStart, axisEnd);
            targetY = axisY + Math.sin(seconds * 0.9 + index * 0.7) * 4;
            targetR = clamp(2 + Math.pow(diameterRatio, 0.34) * 3.4, 3, 11);
          }

          if (mode === "size") {
            targetX = scaleLinear(diameterRatio, 0.8, 11.5, axisStart, axisEnd);
            targetY = axisY - Math.cos(seconds * 0.75 + index) * 8;
            targetR = clamp(Math.pow(diameterRatio, 0.42) * 14, 5, 66);
          }

          if (mode === "light") {
            targetX = scaleLinear(lightMinutes, 0, DISTANCE_MAX * 8.317, axisStart, axisEnd);
            targetY = axisY + Math.sin(seconds * 0.8 + index * 0.45) * 3;
            targetR = clamp(2 + Math.pow(diameterRatio, 0.35) * 3.8, 3, 12);
          }

          if (mode === "pocket") {
            targetX = scaleLinear(metersFromEarth, -2.5, 120, axisStart, axisEnd);
            targetY = axisY - Math.cos(seconds * 1.05 + index * 0.9) * 4;
            targetR = clamp(2 + Math.pow(diameterRatio, 0.33) * 3, 2.5, 10);
          }

          const state = statesRef.current[index];
          state.x = lerp(state.x || targetX, targetX, 0.09);
          state.y = lerp(state.y || targetY, targetY, 0.11);
          state.r = lerp(state.r || targetR, targetR, 0.17);

          projectedRef.current[index] = { ...state };
        });
      }

      PLANETS.forEach((planet, index) => {
        const state = projectedRef.current[index];
        const isFocus = index === focus;
        const isHovered = index === hover;

        const glow = context.createRadialGradient(state.x, state.y, state.r * 0.3, state.x, state.y, state.r * 2.5);
        glow.addColorStop(0, `${planet.color}dd`);
        glow.addColorStop(1, `${planet.color}00`);
        context.fillStyle = glow;
        context.beginPath();
        context.arc(state.x, state.y, state.r * 2.8, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = planet.color;
        context.beginPath();
        context.arc(state.x, state.y, state.r, 0, Math.PI * 2);
        context.fill();

        if (isFocus || isHovered) {
          context.strokeStyle = "rgba(234,248,255,0.92)";
          context.lineWidth = 1.6;
          context.beginPath();
          context.arc(state.x, state.y, state.r + 6, 0, Math.PI * 2);
          context.stroke();

          context.fillStyle = "rgba(241,248,255,0.95)";
          context.font = "600 13px var(--font-body)";
          context.fillText(planet.name, state.x + state.r + 10, state.y - 10);
        }
      });

      context.fillStyle = "rgba(233,244,255,0.9)";
      context.font = "600 14px var(--font-body)";
      context.fillText(CHAPTERS[activeRef.current].stat, 24, 36);

      animationFrame = window.requestAnimationFrame(draw);
    };

    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, []);

  const chapterCards = useMemo(
    () =>
      CHAPTERS.map((chapter, index) => {
        const isActive = index === activeChapter;
        return (
          <article
            key={chapter.title}
            ref={(element) => {
              chapterRefs.current[index] = element;
            }}
            data-index={index}
            className={`pointer-events-none flex min-h-screen items-center ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`pointer-events-auto w-full max-w-md rounded-3xl border border-white/25 bg-[#09243a]/72 p-8 text-[#f2f7ff] shadow-2xl backdrop-blur-md transition-all duration-500 ${
                isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-60"
              }`}
            >
              <p className="text-xs tracking-[0.28em] text-[#9bcbff] uppercase">{chapter.kicker}</p>
              <h2 className="mt-3 font-display text-4xl leading-[1.05] text-[#fffdf7]">{chapter.title}</h2>
              <p className="mt-4 text-[1.02rem] leading-7 text-[#deebfb]">{chapter.body}</p>
            </div>
          </article>
        );
      }),
    [activeChapter],
  );

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let nearest: number | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    projectedRef.current.forEach((planetState, index) => {
      const dx = planetState.x - x;
      const dy = planetState.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const threshold = Math.max(20, planetState.r + 14);

      if (distance < threshold && distance < nearestDistance) {
        nearest = index;
        nearestDistance = distance;
      }
    });

    setHoveredPlanet(nearest);
  };

  const handleCanvasClick = () => {
    setSelectedPlanet((previous) => {
      if (hoveredPlanet === null) {
        return null;
      }
      return previous === hoveredPlanet ? null : hoveredPlanet;
    });
  };

  return (
    <main className="min-h-screen overflow-x-clip bg-[#06111d] text-[#f2f7ff]">
      <section className="relative">
        <div ref={containerRef} className="sticky top-0 h-screen overflow-hidden border-b border-white/10">
          <canvas
            ref={canvasRef}
            className="h-full w-full cursor-crosshair"
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setHoveredPlanet(null)}
            onClick={handleCanvasClick}
          />

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_12%,rgba(255,239,198,0.1),transparent_45%),radial-gradient(circle_at_80%_15%,rgba(127,178,255,0.2),transparent_40%)]" />

          <div className="pointer-events-none absolute left-5 top-6 z-20 max-w-sm md:left-10 md:top-9">
            <p className="text-xs tracking-[0.32em] text-[#8ec4ff] uppercase">Interactive Explainer</p>
            <h1 className="mt-3 font-display text-4xl leading-[0.96] text-[#fffbef] md:text-6xl">
              The Solar System
              <br />
              Through Five Surprises
            </h1>
            <p className="mt-4 max-w-xs text-sm leading-6 text-[#d4e4f6] md:max-w-sm md:text-base">
              Scroll to change the model. Hover or click any planet to inspect it in each framing.
            </p>
          </div>

          <div className="pointer-events-none absolute right-5 top-6 z-20 w-[300px] rounded-2xl border border-white/20 bg-[#0a2840]/78 p-5 shadow-xl backdrop-blur-md md:right-10 md:top-9">
            <p className="text-xs tracking-[0.2em] text-[#8dc9ff] uppercase">Focus</p>
            <h3 className="mt-1 font-display text-3xl text-[#fffdf4]">{focusPlanet.name}</h3>
            <p className="mt-2 text-sm leading-6 text-[#dce9f8]">{focusPlanet.fact}</p>
            <p className="mt-3 text-sm text-[#b9d7fa]">Distance: {focusPlanet.distanceAU.toFixed(2)} AU</p>
            <p className="text-sm text-[#b9d7fa]">Sunlight delay: {focusLightMinutes.toFixed(1)} minutes</p>
            <p className="text-sm text-[#b9d7fa]">Orbital period: {(focusPlanet.orbitDays / 365).toFixed(2)} Earth years</p>
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-24 md:px-12">{chapterCards}</div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24 pt-16 md:px-12">
        <div className="rounded-3xl border border-white/15 bg-[#09233a]/80 p-8 text-[#deebfb] shadow-xl backdrop-blur-md">
          <h2 className="font-display text-4xl leading-none text-[#fffdf4]">One page, many scales</h2>
          <p className="mt-4 max-w-3xl text-[1.02rem] leading-7">
            The same eight planets can look close, far, tiny, huge, fast, or glacial depending on framing.
            Switching perspective is the point: data visualization is less about drawing dots and more about choosing the lens.
          </p>
        </div>
      </section>
    </main>
  );
}
