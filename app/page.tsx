"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { OUTFITS } from "../data/outfits";

type Outfit = {
  id: string;
  label: string;
  src: string;
  accessory: string;
  paragraphs: string[];
};

type Point = { x: number; y: number };

export default function Home() {
  const [currentOutfit, setCurrentOutfit] = useState<Outfit | null>(null);
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const popAudioRef = useRef<HTMLAudioElement | null>(null);
  // Framer Motion fires onTap after a drag too (the pointer is still over the
  // element on release), so track drags to keep taps from double-firing.
  const didDragRef = useRef(false);

  useEffect(() => {
    popAudioRef.current = new Audio("/sounds/pop.mp3");
    popAudioRef.current.preload = "auto";
  }, []);

  const playPopSound = () => {
    if (!popAudioRef.current) return;
    const soundClone = popAudioRef.current.cloneNode(true) as HTMLAudioElement;
    soundClone.volume = 0.4;
    soundClone.play().catch((err) => {
      console.log("Audio playback interaction prevented:", err);
    });
  };

  // Framer Motion's info.point is relative to the PAGE, while
  // getBoundingClientRect() is relative to the VIEWPORT. Subtract the scroll
  // offset so the hit test still works after the user scrolls (always the
  // case on mobile with the stacked layout).
  const isOverAvatar = (point: Point) => {
    if (!avatarRef.current) return false;
    const r = avatarRef.current.getBoundingClientRect();
    const x = point.x - window.scrollX;
    const y = point.y - window.scrollY;
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };

  const equip = (outfit: Outfit) => {
    if (currentOutfit?.id !== outfit.id) playPopSound();
    setCurrentOutfit(outfit);
  };

  const handleDragStart = () => {
    didDragRef.current = true;
  };

  // Clear the flag on the next tick, after any onTap from the same release
  // has had a chance to see it.
  const clearDragFlag = () => {
    setTimeout(() => {
      didDragRef.current = false;
    }, 0);
  };

  // Drag from the RACK to the AVATAR
  const handleDragEnd = (
    _: unknown,
    info: { point: Point },
    outfit: Outfit
  ) => {
    clearDragFlag();
    if (isOverAvatar(info.point)) equip(outfit);
  };

  // Drag from the AVATAR back to the RACK (or anywhere outside the avatar)
  const handleAvatarDragEnd = (_: unknown, info: { point: Point }) => {
    clearDragFlag();
    if (!isOverAvatar(info.point)) setCurrentOutfit(null);
  };

  return (
    <main className="font-hope min-h-dvh text-slate-900 px-4 md:px-8 lg:px-12 py-6 lg:py-8 flex flex-col justify-between overflow-x-hidden relative">
      <div className="absolute inset-0 w-full h-full -z-10 pointer-events-none select-none">
        <Image
          src="/background.jpg"
          alt="Background Pattern"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Dynamic Title Area */}
      <header className="text-center my-4 lg:my-6">
        <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tight transition-all duration-300">
          Hope is a{" "}
          <span className="text-pink-700 underline decoration-wavy decoration-pink-700">
            {currentOutfit ? currentOutfit.label : "__________"}
          </span>
        </h1>
      </header>

      {/* Main Interactive Grid Layout
          Mobile order: avatar -> rack -> info. Desktop: rack | avatar | info. */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 max-w-[1500px] w-full mx-auto my-auto items-stretch">
        {/* SECTION 1: Clothes Rack */}
        <section className="order-2 lg:order-1 lg:col-span-5 relative z-40 flex flex-col items-center justify-center lg:min-h-[600px]">
          {/* Mobile: 3x2 grid, each hanger gets its own rail segment, no overlap.
              sm+: single row of overlapping hangers on one shared rail. */}
          <div className="relative w-full flex justify-center mt-2 sm:mt-8">
            <div className="relative grid grid-cols-3 w-full max-w-[340px] gap-y-8 sm:flex sm:flex-nowrap sm:w-auto sm:max-w-none sm:gap-y-0 sm:items-start sm:pt-9 sm:px-4 lg:px-6">
              {/* Shared rail (sm+ only) */}
              <div className="hidden sm:block absolute top-10 left-0 right-0 h-3 bg-zinc-500 rounded-full shadow-inner z-10">
                <div className="absolute -left-2 -top-1 w-2 h-5 bg-zinc-600 rounded-sm"></div>
                <div className="absolute -right-2 -top-1 w-2 h-5 bg-zinc-600 rounded-sm"></div>
              </div>

              {OUTFITS.map((outfit, index) => {
                const isBeingWorn = currentOutfit?.id === outfit.id;

                return (
                  <div
                    key={outfit.id}
                    style={{ zIndex: isBeingWorn ? 0 : 20 + index }}
                    className={`flex flex-col items-center group relative select-none w-full sm:w-auto ${
                      index === 0
                        ? ""
                        : "sm:-ml-12 lg:-ml-16 xl:-ml-14 2xl:-ml-[69px]"
                    }`}
                  >
                    {/* Per-hanger rail segment (mobile only) */}
                    <div className="sm:hidden absolute top-1 left-0 right-0 h-3 bg-zinc-500 shadow-inner z-0"></div>

                    <div className="w-6 h-6 border-2 border-zinc-400 border-b-0 rounded-t-full -mb-1 transform group-hover:border-zinc-600 transition-colors z-20"></div>

                    <motion.div
                      drag
                      dragSnapToOrigin
                      onTap={() => {
                        if (!didDragRef.current) equip(outfit);
                      }}
                      onDragStart={handleDragStart}
                      onDragEnd={(e, info) => handleDragEnd(e, info, outfit)}
                      whileDrag={{ scale: 1.05, zIndex: 100, cursor: "grabbing" }}
                      className={`w-24 h-40 sm:w-32 sm:h-52 lg:w-28 lg:h-44 xl:w-32 xl:h-52 2xl:w-40 2xl:h-64 overflow-visible relative cursor-grab bg-transparent active:cursor-grabbing rounded-xl transition-opacity duration-300 touch-none ${
                        isBeingWorn ? "opacity-10 pointer-events-none" : "opacity-100"
                      }`}
                    >
                      {/* -mt-[85%] is relative to the box width, so the offset
                          scales with the hanger (85% of 160px = the old -mt-34) */}
                      <div className="-mt-[85%] w-full h-full relative scale-[1.4] origin-top pointer-events-none">
                        <Image
                          src={outfit.src}
                          alt={outfit.label}
                          fill
                          sizes="(max-width: 639px) 135px, (max-width: 1279px) 180px, 225px"
                          className="object-contain"
                        />
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 2: Hope Avatar */}
        <section className="order-1 lg:order-2 lg:col-span-3 flex flex-col items-center justify-center lg:min-h-[600px]">
          <div
            ref={avatarRef}
            className="relative w-full max-w-[220px] sm:max-w-[280px] lg:max-w-[340px] aspect-[3/5] flex items-center justify-center"
          >
            {/* Base Avatar Layer */}
            <div className="absolute inset-0 w-full h-full p-0 pointer-events-none z-20 rounded-3xl overflow-hidden">
              <Image
                src="/avatar-base.png"
                alt="Hope Base Avatar"
                sizes="(max-width: 639px) 220px, (max-width: 1023px) 280px, 340px"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Accessories Layer */}
            {currentOutfit && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 w-full h-full z-[25] pointer-events-none"
              >
                <Image
                  src={currentOutfit.accessory}
                  alt={`${currentOutfit.label} Accessories`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 639px) 220px, (max-width: 1023px) 280px, 340px"
                />
              </motion.div>
            )}

            {/* Outfit Layer: drag off the avatar, or tap it, to take the outfit off */}
            {currentOutfit && (
              <motion.div
                drag
                dragSnapToOrigin
                onTap={() => {
                  if (!didDragRef.current) setCurrentOutfit(null);
                }}
                onDragStart={handleDragStart}
                onDragEnd={handleAvatarDragEnd}
                whileDrag={{ scale: 1.05, cursor: "grabbing" }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 w-full h-full z-30 cursor-grab active:cursor-grabbing"
              >
                <Image
                  src={currentOutfit.src}
                  alt={`Equipped ${currentOutfit.label}`}
                  fill
                  className="object-contain pointer-events-none"
                  sizes="(max-width: 639px) 220px, (max-width: 1023px) 280px, 340px"
                />
              </motion.div>
            )}
          </div>
        </section>

        {/* SECTION 3: Info Section
            Inner scroll box only on desktop, so mobile doesn't get a
            scrolling box inside a scrolling page. */}
        <section className="order-3 lg:col-span-4 flex flex-col justify-center lg:min-h-[600px]">
          <div className="h-full flex flex-col justify-center">
            <div className="prose prose-slate flex-1 flex flex-col justify-start lg:overflow-y-auto lg:max-h-[600px] pr-0 lg:pr-4 pt-2 scrollbar-thin">
              {currentOutfit ? (
                <div className="space-y-5 lg:space-y-7 animate-fadeIn">
                  {currentOutfit.paragraphs.map((para, index) => (
                    <p
                      key={index}
                      className="text-lg md:text-2xl text-stone-800 leading-relaxed font-medium tracking-wide"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="w-full text-xl md:text-3xl text-stone-800 italic my-auto text-center">
                  <span className="hidden lg:inline">
                    Click and drag an outfit from the clothes rack :P
                  </span>
                  <span className="lg:hidden">
                    Tap an outfit on the rack :P
                  </span>
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      <footer className="text-center text-xs text-slate-800 mt-8">
        Built with Next.js & Tailwind CSS by me YIPPEE!
      </footer>
    </main>
  );
}
