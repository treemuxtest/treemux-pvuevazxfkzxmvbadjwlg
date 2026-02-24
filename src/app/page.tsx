"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Planet = {
  name: string;
  orbit: number;
  size: number;
  hue: number;
  period: number;
  temperature: number;
  terrain: string;
};

type StarSystem = {
  id: string;
  name: string;
  distance: number;
  spectralType: string;
  x: number;
  y: number;
  depth: number;
  starHue: number;
  starSize: number;
  habitability: number;
  summary: string;
  planets: Planet[];
};

type BackdropStar = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  twinkle: number;
  drift: number;
  depth: number;
};

const STAR_SYSTEMS: StarSystem[] = [
  {
    id: "aurelia",
    name: "Aurelia Spiral",
    distance: 22,
    spectralType: "F8V",
    x: 0.14,
    y: 0.24,
    depth: 0.86,
    starHue: 42,
    starSize: 9,
    habitability: 74,
    summary:
      "A bright young system with mineral-rich worlds and one methane ocean moon.",
    planets: [
      {
        name: "Aurelia-I",
        orbit: 26,
        size: 2.4,
        hue: 29,
        period: 6,
        temperature: 420,
        terrain: "lava plains",
      },
      {
        name: "Aurelia-II",
        orbit: 42,
        size: 3,
        hue: 191,
        period: 12,
        temperature: 115,
        terrain: "ice shelves",
      },
      {
        name: "Mira",
        orbit: 61,
        size: 4,
        hue: 156,
        period: 18,
        temperature: 24,
        terrain: "methane seas",
      },
    ],
  },
  {
    id: "orionis",
    name: "Orionis Bend",
    distance: 39,
    spectralType: "K2III",
    x: 0.33,
    y: 0.14,
    depth: 0.72,
    starHue: 28,
    starSize: 10,
    habitability: 41,
    summary:
      "An aging giant star where dust rings shimmer around compact rocky planets.",
    planets: [
      {
        name: "Nox",
        orbit: 28,
        size: 2.1,
        hue: 16,
        period: 7,
        temperature: 390,
        terrain: "basalt deserts",
      },
      {
        name: "Cinder",
        orbit: 49,
        size: 3.2,
        hue: 12,
        period: 15,
        temperature: 290,
        terrain: "ember ridges",
      },
      {
        name: "Quill",
        orbit: 70,
        size: 2.7,
        hue: 58,
        period: 24,
        temperature: 170,
        terrain: "silica dunes",
      },
    ],
  },
  {
    id: "lyra",
    name: "Lyra Bloom",
    distance: 56,
    spectralType: "A4V",
    x: 0.53,
    y: 0.3,
    depth: 0.93,
    starHue: 194,
    starSize: 8,
    habitability: 62,
    summary:
      "Known for iridescent atmospheres and a ringed super-earth with electric storms.",
    planets: [
      {
        name: "Petal",
        orbit: 24,
        size: 2.2,
        hue: 199,
        period: 5,
        temperature: 330,
        terrain: "crystal fields",
      },
      {
        name: "Harmonic",
        orbit: 40,
        size: 4.1,
        hue: 217,
        period: 11,
        temperature: 190,
        terrain: "charged oceans",
      },
      {
        name: "Velvet",
        orbit: 58,
        size: 3.6,
        hue: 274,
        period: 17,
        temperature: 130,
        terrain: "violet clouds",
      },
      {
        name: "Rook",
        orbit: 74,
        size: 2.8,
        hue: 46,
        period: 24,
        temperature: 85,
        terrain: "salt canyons",
      },
    ],
  },
  {
    id: "drift",
    name: "Driftline Kappa",
    distance: 71,
    spectralType: "M1V",
    x: 0.73,
    y: 0.19,
    depth: 0.67,
    starHue: 349,
    starSize: 7,
    habitability: 18,
    summary:
      "A red dwarf with tidal-locked worlds and long auroral curtains in perpetual dusk.",
    planets: [
      {
        name: "Thorn",
        orbit: 21,
        size: 2.5,
        hue: 342,
        period: 4,
        temperature: 280,
        terrain: "char cliffs",
      },
      {
        name: "Dusk",
        orbit: 37,
        size: 3.8,
        hue: 327,
        period: 9,
        temperature: 145,
        terrain: "frozen tide zones",
      },
      {
        name: "Wisp",
        orbit: 55,
        size: 2.4,
        hue: 13,
        period: 16,
        temperature: 88,
        terrain: "iron frost",
      },
    ],
  },
  {
    id: "atlas",
    name: "Atlas Echo",
    distance: 87,
    spectralType: "G2V",
    x: 0.2,
    y: 0.62,
    depth: 0.8,
    starHue: 52,
    starSize: 9,
    habitability: 83,
    summary:
      "Dense asteroid architecture and two temperate planets in a stable resonance.",
    planets: [
      {
        name: "Stonewake",
        orbit: 27,
        size: 2.6,
        hue: 43,
        period: 7,
        temperature: 308,
        terrain: "impact valleys",
      },
      {
        name: "Harbor",
        orbit: 45,
        size: 3.3,
        hue: 158,
        period: 13,
        temperature: 24,
        terrain: "ocean basins",
      },
      {
        name: "Fable",
        orbit: 63,
        size: 3.1,
        hue: 198,
        period: 19,
        temperature: 8,
        terrain: "moss plateaus",
      },
    ],
  },
  {
    id: "helio",
    name: "Helio Veil",
    distance: 95,
    spectralType: "B9V",
    x: 0.43,
    y: 0.56,
    depth: 0.95,
    starHue: 207,
    starSize: 11,
    habitability: 39,
    summary:
      "A luminous blue-white star where fast orbits carve shimmering lanes of ionized gas.",
    planets: [
      {
        name: "Ion-1",
        orbit: 30,
        size: 2.2,
        hue: 208,
        period: 5,
        temperature: 450,
        terrain: "glassy crust",
      },
      {
        name: "Arc",
        orbit: 47,
        size: 3.8,
        hue: 245,
        period: 9,
        temperature: 280,
        terrain: "magnetite ridges",
      },
      {
        name: "Prism",
        orbit: 68,
        size: 3.5,
        hue: 286,
        period: 15,
        temperature: 143,
        terrain: "ion storms",
      },
      {
        name: "Pale Crown",
        orbit: 85,
        size: 2.9,
        hue: 32,
        period: 23,
        temperature: 75,
        terrain: "chalk mesas",
      },
    ],
  },
  {
    id: "umbra",
    name: "Umbra Chorus",
    distance: 112,
    spectralType: "M3V",
    x: 0.66,
    y: 0.72,
    depth: 0.69,
    starHue: 0,
    starSize: 7,
    habitability: 29,
    summary:
      "Dense magnetic storms and dark-water worlds where bioluminescent algae flare nightly.",
    planets: [
      {
        name: "Choir",
        orbit: 24,
        size: 2.4,
        hue: 355,
        period: 6,
        temperature: 198,
        terrain: "sulfur flats",
      },
      {
        name: "Noir",
        orbit: 43,
        size: 3.6,
        hue: 186,
        period: 12,
        temperature: 60,
        terrain: "black oceans",
      },
      {
        name: "Brine",
        orbit: 64,
        size: 3.2,
        hue: 215,
        period: 20,
        temperature: 5,
        terrain: "saline glaciers",
      },
    ],
  },
  {
    id: "zenith",
    name: "Zenith Archive",
    distance: 140,
    spectralType: "F1V",
    x: 0.84,
    y: 0.58,
    depth: 0.88,
    starHue: 45,
    starSize: 9,
    habitability: 69,
    summary:
      "A balanced system with layered atmospheres and one high-oxygen candidate biosphere.",
    planets: [
      {
        name: "Ledger",
        orbit: 25,
        size: 2.4,
        hue: 34,
        period: 6,
        temperature: 268,
        terrain: "dust basins",
      },
      {
        name: "Verde",
        orbit: 44,
        size: 4.2,
        hue: 142,
        period: 13,
        temperature: 19,
        terrain: "forested continents",
      },
      {
        name: "Oracle",
        orbit: 67,
        size: 3.1,
        hue: 206,
        period: 21,
        temperature: -6,
        terrain: "mist archipelagos",
      },
    ],
  },
];

const CONNECTIONS: [string, string][] = [
  ["aurelia", "orionis"],
  ["orionis", "lyra"],
  ["lyra", "drift"],
  ["aurelia", "atlas"],
  ["atlas", "helio"],
  ["helio", "zenith"],
  ["helio", "umbra"],
  ["atlas", "umbra"],
  ["lyra", "helio"],
  ["umbra", "zenith"],
];

const PLANET_SUMMARY = "Interactive Synthetic Exoplanet Cartography";

function createSeededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function createBackdropStars(count = 540): BackdropStar[] {
  const random = createSeededRandom(2026);
  return Array.from({ length: count }, () => ({
    x: random(),
    y: random(),
    radius: random() * 1.75 + 0.3,
    alpha: random() * 0.8 + 0.2,
    twinkle: random() * 2.4 + 0.6,
    drift: random() * 2.5 + 0.2,
    depth: random() * 0.95 + 0.05,
  }));
}

function getSystemMetrics(system: StarSystem) {
  const worldCount = system.planets.length;
  const meanTemp = Math.round(
    system.planets.reduce((sum, planet) => sum + planet.temperature, 0) / worldCount,
  );
  return {
    worldCount,
    meanTemp,
  };
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>(STAR_SYSTEMS[0].id);
  const hoveredRef = useRef<string | null>(null);
  const selectedRef = useRef<string>(STAR_SYSTEMS[0].id);
  const pointerRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });
  const viewportRef = useRef({
    width: 0,
    height: 0,
  });

  const backdropStars = useMemo(() => createBackdropStars(), []);
  const systemMap = useMemo(() => {
    const map = new Map<string, StarSystem>();
    STAR_SYSTEMS.forEach((system) => {
      map.set(system.id, system);
    });
    return map;
  }, []);

  const selectedSystem = systemMap.get(selectedId) ?? STAR_SYSTEMS[0];
  const focusedSystem = hoveredId ? systemMap.get(hoveredId) ?? selectedSystem : selectedSystem;

  useEffect(() => {
    selectedRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let previous = performance.now();

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(bounds.width * dpr);
      canvas.height = Math.floor(bounds.height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      viewportRef.current.width = bounds.width;
      viewportRef.current.height = bounds.height;

      if (pointerRef.current.targetX === 0 && pointerRef.current.targetY === 0) {
        pointerRef.current.x = bounds.width / 2;
        pointerRef.current.targetX = bounds.width / 2;
        pointerRef.current.y = bounds.height / 2;
        pointerRef.current.targetY = bounds.height / 2;
      }
    };

    const updatePointer = (x: number, y: number) => {
      pointerRef.current.targetX = x;
      pointerRef.current.targetY = y;
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      updatePointer(event.clientX - rect.left, event.clientY - rect.top);
    };

    const handlePointerLeave = () => {
      updatePointer(viewportRef.current.width / 2, viewportRef.current.height / 2);
    };

    const handleClick = () => {
      if (hoveredRef.current) {
        setSelectedId(hoveredRef.current);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    canvas.addEventListener("click", handleClick);

    const render = (now: number) => {
      const { width, height } = viewportRef.current;
      if (!width || !height) {
        frame = requestAnimationFrame(render);
        return;
      }

      const elapsed = Math.min(32, now - previous);
      previous = now;
      const time = now * 0.001;

      pointerRef.current.x += (pointerRef.current.targetX - pointerRef.current.x) * 0.09;
      pointerRef.current.y += (pointerRef.current.targetY - pointerRef.current.y) * 0.09;
      const driftX = (pointerRef.current.x / width - 0.5) * 46;
      const driftY = (pointerRef.current.y / height - 0.5) * 28;

      context.clearRect(0, 0, width, height);

      const baseGradient = context.createLinearGradient(0, 0, width, height);
      baseGradient.addColorStop(0, "#02030f");
      baseGradient.addColorStop(0.5, "#080f2e");
      baseGradient.addColorStop(1, "#16112e");
      context.fillStyle = baseGradient;
      context.fillRect(0, 0, width, height);

      const bloomOne = context.createRadialGradient(
        width * 0.2 + driftX * 0.4,
        height * 0.25 + driftY * 0.4,
        10,
        width * 0.2 + driftX * 0.4,
        height * 0.25 + driftY * 0.4,
        width * 0.55,
      );
      bloomOne.addColorStop(0, "rgba(58, 84, 255, 0.26)");
      bloomOne.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = bloomOne;
      context.fillRect(0, 0, width, height);

      const bloomTwo = context.createRadialGradient(
        width * 0.73 - driftX * 0.3,
        height * 0.65 - driftY * 0.3,
        10,
        width * 0.73 - driftX * 0.3,
        height * 0.65 - driftY * 0.3,
        width * 0.5,
      );
      bloomTwo.addColorStop(0, "rgba(215, 98, 255, 0.22)");
      bloomTwo.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = bloomTwo;
      context.fillRect(0, 0, width, height);

      backdropStars.forEach((star, index) => {
        const twinkle = 0.45 + 0.55 * Math.sin(time * star.twinkle + index * 0.37);
        const x =
          star.x * width +
          Math.sin(time * 0.2 * star.drift + index) * 12 * star.depth +
          driftX * 0.6 * star.depth;
        const y =
          star.y * height +
          Math.cos(time * 0.16 * star.drift + index * 0.5) * 10 * star.depth +
          driftY * 0.6 * star.depth;

        context.beginPath();
        context.fillStyle = `rgba(235, 241, 255, ${star.alpha * twinkle})`;
        context.arc((x + width) % width, (y + height) % height, star.radius, 0, Math.PI * 2);
        context.fill();
      });

      const projected = new Map<string, { x: number; y: number; radius: number }>();
      STAR_SYSTEMS.forEach((system) => {
        projected.set(system.id, {
          x: system.x * width + driftX * system.depth,
          y: system.y * height + driftY * system.depth,
          radius: system.starSize + 8,
        });
      });

      context.save();
      context.lineWidth = 1;
      CONNECTIONS.forEach(([a, b], idx) => {
        const from = projected.get(a);
        const to = projected.get(b);
        if (!from || !to) return;
        const shimmer = 0.15 + 0.15 * Math.sin(time * 0.9 + idx * 0.7);
        context.strokeStyle = `rgba(141, 174, 255, ${shimmer})`;
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
        context.stroke();
      });
      context.restore();

      let nextHovered: string | null = null;
      let nearestDistance = Number.POSITIVE_INFINITY;

      projected.forEach((value, id) => {
        const dx = pointerRef.current.x - value.x;
        const dy = pointerRef.current.y - value.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 36 && distance < nearestDistance) {
          nearestDistance = distance;
          nextHovered = id;
        }
      });

      if (nextHovered !== hoveredRef.current) {
        hoveredRef.current = nextHovered;
        setHoveredId(nextHovered);
      }

      STAR_SYSTEMS.forEach((system, index) => {
        const point = projected.get(system.id);
        if (!point) return;
        const isSelected = system.id === selectedRef.current;
        const isHovered = system.id === nextHovered;
        const emphasis = isSelected || isHovered;

        const aura = context.createRadialGradient(
          point.x,
          point.y,
          2,
          point.x,
          point.y,
          system.starSize * (emphasis ? 8.5 : 6.5),
        );
        aura.addColorStop(0, `hsla(${system.starHue}, 96%, 72%, ${emphasis ? 0.36 : 0.2})`);
        aura.addColorStop(1, "hsla(0, 0%, 0%, 0)");
        context.fillStyle = aura;
        context.beginPath();
        context.arc(
          point.x,
          point.y,
          system.starSize * (emphasis ? 8.5 : 6.5),
          0,
          Math.PI * 2,
        );
        context.fill();

        system.planets.forEach((planet, orbitIndex) => {
          const orbitRadius = planet.orbit + system.depth * 5;
          context.beginPath();
          context.strokeStyle = `rgba(166, 192, 255, ${emphasis ? 0.28 : 0.13})`;
          context.lineWidth = emphasis ? 1.15 : 0.8;
          context.arc(point.x, point.y, orbitRadius, 0, Math.PI * 2);
          context.stroke();

          const theta =
            time * (0.75 / planet.period) * Math.PI * 2 + orbitIndex * 0.9 + index * 0.35;
          const px = point.x + Math.cos(theta) * orbitRadius;
          const py = point.y + Math.sin(theta) * orbitRadius;

          context.beginPath();
          context.fillStyle = `hsla(${planet.hue}, 75%, 62%, 0.92)`;
          context.arc(px, py, planet.size, 0, Math.PI * 2);
          context.fill();
        });

        context.beginPath();
        context.fillStyle = `hsl(${system.starHue}, 100%, 74%)`;
        context.arc(point.x, point.y, system.starSize, 0, Math.PI * 2);
        context.fill();

        context.beginPath();
        context.fillStyle = "rgba(255, 255, 255, 0.8)";
        context.arc(
          point.x - system.starSize * 0.25,
          point.y - system.starSize * 0.25,
          system.starSize * 0.35,
          0,
          Math.PI * 2,
        );
        context.fill();

        if (emphasis) {
          const pulse = 1 + 0.12 * Math.sin(time * 3.2 + index);
          context.beginPath();
          context.strokeStyle = `hsla(${system.starHue}, 98%, 74%, 0.66)`;
          context.lineWidth = 1.6;
          context.arc(
            point.x,
            point.y,
            (system.starSize + 10 + (elapsed / 16) * 0.15) * pulse,
            0,
            Math.PI * 2,
          );
          context.stroke();

          context.fillStyle = "rgba(235, 242, 255, 0.96)";
          context.font = "600 13px var(--font-space-grotesk)";
          context.textAlign = "center";
          context.fillText(system.name, point.x, point.y - system.starSize - 18);
        }
      });

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("click", handleClick);
    };
  }, [backdropStars]);

  const focusedMetrics = getSystemMetrics(focusedSystem);
  const selectedMetrics = getSystemMetrics(selectedSystem);

  return (
    <main className="relative min-h-screen overflow-hidden pb-8 pt-5 text-slate-100">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_18%,rgba(66,121,255,0.28),transparent_48%),radial-gradient(circle_at_86%_78%,rgba(211,88,255,0.22),transparent_52%),linear-gradient(165deg,#02030f_0%,#070f2a_45%,#170f2d_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-45 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:42px_42px]" />

      <section className="mx-auto flex w-full max-w-[1380px] flex-col gap-4 px-4 sm:px-6">
        <header className="mt-4 flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-3xl">
            <p className="font-[family-name:var(--font-syne)] text-xs uppercase tracking-[0.35em] text-blue-200/90">
              Deep Space Playground
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Celestial Drift Atlas
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">
              {PLANET_SUMMARY}. Drift your cursor across linked star systems, then click to lock
              focus and inspect orbital chemistry.
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/8 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-200/85">Focused System</p>
            <p className="mt-1 font-[family-name:var(--font-syne)] text-xl font-semibold text-white">
              {focusedSystem.name}
            </p>
            <p className="mt-1 text-sm text-slate-200">
              {focusedMetrics.worldCount} worlds • {focusedSystem.distance} ly •{" "}
              {focusedSystem.habitability}% habitability score
            </p>
          </div>
        </header>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-black/25 shadow-[0_0_120px_rgba(91,120,255,0.28)]">
          <canvas
            ref={canvasRef}
            className="block h-[76vh] min-h-[560px] w-full touch-none cursor-crosshair"
            aria-label="Interactive exoplanet star map"
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(255,255,255,0.2)_0%,transparent_38%),radial-gradient(circle_at_90%_80%,rgba(255,255,255,0.18)_0%,transparent_40%)] opacity-35" />

          <Card className="absolute right-4 top-4 z-10 w-[min(360px,calc(100%-2rem))] border-white/20 bg-slate-950/70 text-slate-100 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="font-[family-name:var(--font-syne)] text-2xl tracking-tight">
                {selectedSystem.name}
              </CardTitle>
              <p className="text-sm text-slate-300">{selectedSystem.summary}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-xs uppercase tracking-[0.18em] text-slate-300">
                <div className="rounded-xl border border-white/15 bg-white/5 p-2">
                  <p>Distance</p>
                  <p className="mt-2 text-sm font-semibold text-white">{selectedSystem.distance} ly</p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/5 p-2">
                  <p>Type</p>
                  <p className="mt-2 text-sm font-semibold text-white">{selectedSystem.spectralType}</p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/5 p-2">
                  <p>Avg Temp</p>
                  <p className="mt-2 text-sm font-semibold text-white">{selectedMetrics.meanTemp} C</p>
                </div>
              </div>
              <div className="space-y-2">
                {selectedSystem.planets.map((planet) => (
                  <div
                    key={planet.name}
                    className="rounded-xl border border-white/12 bg-black/30 px-3 py-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-100">{planet.name}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
                        {planet.temperature} C
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{planet.terrain}</p>
                  </div>
                ))}
              </div>
              <Button
                className="w-full border border-cyan-300/40 bg-cyan-400/20 text-cyan-100 hover:bg-cyan-300/30"
                onClick={() => {
                  const randomIndex = Math.floor(Math.random() * STAR_SYSTEMS.length);
                  setSelectedId(STAR_SYSTEMS[randomIndex].id);
                }}
              >
                Jump To Random System
              </Button>
            </CardContent>
          </Card>

          <div className="absolute bottom-4 left-4 z-10 rounded-2xl border border-white/15 bg-slate-950/70 px-3 py-2 text-xs text-slate-200 backdrop-blur-sm">
            <p className="font-medium text-white">Navigation</p>
            <p className="mt-1">Move pointer to probe systems. Click to lock details.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
