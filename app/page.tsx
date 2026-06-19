"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { OUTFITS } from "../data/outfits";

export default function Home() {
  const [currentOutfit, setCurrentOutfit] = useState<Outfit | null>(null);
  const avatarRef = useRef<HTMLDivElement | null>(null);

  const popAudioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    popAudioRef.current = new Audio("/sounds/pop.mp3");
    popAudioRef.current.preload = "auto";
  }, []);

  const playPopSound = () => {
    if (popAudioRef.current) {
      const soundClone = popAudioRef.current.cloneNode(true) as HTMLAudioElement;
      soundClone.volume = 0.4; // Keep it subtle and pleasant, not blastingly loud
      soundClone.play().catch((err) => {
        console.log("Audio playback interaction prevented:", err);
      });
    }
  };

  // Fires when dragging from the RACK to the AVATAR
  const handleDragEnd = (
    event: any,
    info: { point: { x: number; y: number } },
    outfit: Outfit
  ) => {
    if (!avatarRef.current) return;

    const avatarRect = avatarRef.current.getBoundingClientRect();
    const dropX = info.point.x;
    const dropY = info.point.y;

    const isOverAvatar =
      dropX >= avatarRect.left &&
      dropX <= avatarRect.right &&
      dropY >= avatarRect.top &&
      dropY <= avatarRect.bottom;

    // If dropped on the avatar, equip outfit / unequip previous outfit
    if (isOverAvatar) {
      if (currentOutfit?.id !== outfit.id) {
        playPopSound();
      }
      setCurrentOutfit(outfit);
    }
  };

  // Fires when dragging from the AVATAR back to the RACK (or anywhere outside)
  const handleAvatarDragEnd = (event, info) => {
    if (!avatarRef.current) return;

    const avatarRect = avatarRef.current.getBoundingClientRect();
    const dropX = info.point.x;
    const dropY = info.point.y;

    const isOverAvatar =
      dropX >= avatarRect.left &&
      dropX <= avatarRect.right &&
      dropY >= avatarRect.top &&
      dropY <= avatarRect.bottom;

    if (!isOverAvatar) {
      setCurrentOutfit(null);
    }
  };

  return (
    <main className="font-hope min-h-screen text-slate-900 px-4 md:px-8 lg:px-12 py-8 flex flex-col justify-between overflow-x-hidden relative">      
      <div className="absolute inset-0 w-full h-full -z-10 pointer-events-none select-none">
        <Image
          src="/background.jpg"
          alt="Background Pattern"
          fill
          priority 
          quality={85} 
          className="object-cover object-center" 
        />
      </div>

      {/* Dynamic Title Area */}
      <header className="text-center my-6">
        <h1 className="text-7xl md:text-9xl font-extrabold tracking-tight transition-all duration-300">
            Hope is a <span className="text-pink-700 underline decoration-wavy decoration-pink-700">
            {currentOutfit ? currentOutfit.label : "__________"}
          </span>
        </h1>
      </header>

      {/* Main Interactive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 max-w-[1500px] w-full mx-auto my-auto items-stretch">        
        {/* SECTION 1: Clothes Rack */}
        <section className="lg:col-span-5 relative z-40 flex flex-col items-center justify-center min-h-[600px]">
          <div className="relative w-full h-auto flex flex-col justify-start items-center mt-8">
            
            <div className="absolute top-10 left-4 right-4 h-3 bg-zinc-500 rounded-full shadow-inner z-10">
              <div className="absolute -left-2 -top-1 w-2 h-5 bg-zinc-600 rounded-sm"></div>
              <div className="absolute -right-2 -top-1 w-2 h-5 bg-zinc-600 rounded-sm"></div>
            </div>

            <div className="w-full flex flex-wrap justify-center items-start pt-9 px-6 md:flex-nowrap gap-y-4">
              {OUTFITS.map((outfit, index) => {
                const isBeingWorn = currentOutfit?.id === outfit.id;

                return (
                  <div 
                    key={outfit.id} 
                    className="flex flex-col items-center group relative select-none"
                    style={{
                      marginLeft: index === 0 ? "0px" : "-55px", 
                      zIndex: isBeingWorn ? 0 : 20 + index 
                    }}
                  >
                    <div className="w-6 h-6 border-2 border-zinc-400 border-b-0 rounded-t-full -mb-1 transform group-hover:border-zinc-600 transition-colors z-20"></div>
                    
                    <motion.div
                      drag
                      dragSnapToOrigin
                      onDragEnd={(e, info) => handleDragEnd(e, info, outfit)}
                      whileDrag={{ scale: 1.05, zIndex: 100, cursor: "grabbing" }}
                      className={`w-40 h-64 overflow-visible relative cursor-grab bg-transparent active:cursor-grabbing rounded-xl transition-opacity duration-300 touch-none ${
                        isBeingWorn ? "opacity-10 pointer-events-none" : "opacity-100"
                      }`}
                    >
                      <div className="-mt-37 w-full h-full scale-140 origin-top pointer-events-none"> 
                        <Image 
                          src={outfit.src} 
                          alt={outfit.label}
                          width={160}
                          height={256}
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
        <section className="lg:col-span-3 flex flex-col items-center justify-center min-h-[600px]">
          <div 
            ref={avatarRef}
            className="relative w-full max-w-[340px] aspect-[3/5] flex items-center justify-center"
          >           
            {/* Base Avatar Layer */}
            <div className="absolute inset-0 w-full h-full p-0 pointer-events-none z-20 rounded-3xl overflow-hidden">
              <Image 
                src="/avatar-base.png" 
                alt="Hope Base Avatar" 
                sizes="(max-width: 340px) 100vw, 340px"
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
                className="absolute inset-0 w-full h-full z-25 pointer-events-none"
              >
                <Image 
                  src={currentOutfit.accessory} 
                  alt={`${currentOutfit.label} Accessories`} 
                  fill
                  className="object-contain"
                  sizes="(max-width: 240px) 100vw, 240px"
                />
              </motion.div>
            )}

            {/* Outfit Layer */}
            {currentOutfit && (
              <motion.div 
                drag
                dragSnapToOrigin
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
                  sizes="(max-width: 240px) 100vw, 240px"
                />
              </motion.div>
            )}
          </div>
        </section>

        {/* SECTION 3: Info Section */}
        <section className="lg:col-span-4 flex flex-col justify-center min-h-[600px]">
          <div className="h-full flex flex-col justify-center">
            <div className="prose prose-slate flex-1 flex flex-col justify-start overflow-y-auto max-h-[600px] pr-4 pt-2 scrollbar-thin">
              {currentOutfit ? (
                <div className="space-y-7 animate-fadeIn">
                  {currentOutfit.paragraphs.map((para, index) => (
                    <p key={index} className="text-lg md:text-2xl text-stone-800 leading-relaxed font-medium tracking-wide">
                      {para}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="w-full text-xl md:text-3xl text-stone-800 italic my-auto text-center">
                  Click and drag an outfit from the clothes rack :P
                </p>
              )}
            </div>
            
          </div>
        </section>
      </div>

      <footer className="text-center text-xs text-slate-400 mt-8">
        Built with Next.js & Tailwind CSS by me YIPPEE!
      </footer>

    </main>
  );
}