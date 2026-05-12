"use client";

import { Player } from "@remotion/player";
import type { NextPage } from "next";
import { useMemo, useState } from "react";
import { z } from "zod";
import {
  CompositionProps,
  defaultMyCompProps,
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";
import { AnimatedButtonsDemo } from "../components/AnimatedButtonsDemo";
import { FadeUp } from "../components/FadeUp";
import { ParallaxHero } from "../components/ParallaxHero";
import { RenderControls } from "../components/RenderControls";
import { Spacing } from "../components/Spacing";
import { Tips } from "../components/Tips";
import { Main } from "../remotion/MyComp/Main";
import { WordByWord } from "../remotion/MyComp/WordByWord";

const SectionTitle: React.FC<{ number: string; title: string }> = ({
  number,
  title,
}) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold flex-shrink-0">
      {number}
    </span>
    <h2 className="text-lg font-bold text-foreground">{title}</h2>
  </div>
);

const Home: NextPage = () => {
  const [text, setText] = useState<string>(defaultMyCompProps.title);

  const inputProps: z.infer<typeof CompositionProps> = useMemo(() => {
    return { title: text };
  }, [text]);

  return (
    <div>
      <div className="max-w-screen-md m-auto mb-5 px-4">
        {/* Existing: Remotion player + render controls */}
        <div className="overflow-hidden rounded-geist shadow-[0_0_200px_rgba(0,0,0,0.15)] mb-10 mt-16">
          <Player
            component={Main}
            inputProps={inputProps}
            durationInFrames={DURATION_IN_FRAMES}
            fps={VIDEO_FPS}
            compositionHeight={VIDEO_HEIGHT}
            compositionWidth={VIDEO_WIDTH}
            style={{ width: "100%" }}
            controls
            autoPlay
            loop
          />
        </div>
        <RenderControls
          text={text}
          setText={setText}
          inputProps={inputProps}
        />
        <Spacing />
        <Spacing />
        <Spacing />
        <Spacing />

        {/* ── 1. Float & Bounce keyframes ── */}
        <FadeUp>
          <section className="border border-unfocused-border-color rounded-geist p-6 mb-8">
            <SectionTitle number="1" title="Float & Bounce — keyframes CSS" />
            <div className="flex gap-12 justify-center items-end py-8">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="animate-float w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white text-2xl"
                >
                  🪐
                </div>
                <span className="text-sm text-subtitle">float</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div
                  className="animate-bounce-pop w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center text-white text-2xl"
                >
                  🏀
                </div>
                <span className="text-sm text-subtitle">bounce</span>
              </div>
            </div>
          </section>
        </FadeUp>

        {/* ── 2. Fade-up on scroll ── */}
        <FadeUp delay={100}>
          <section className="border border-unfocused-border-color rounded-geist p-6 mb-8">
            <SectionTitle number="2" title="Fade-up no scroll — este bloco apareceu ao rolar!" />
            <p className="text-subtitle text-sm leading-relaxed">
              Cada seção desta página usa um <code className="bg-unfocused-border-color px-1 rounded text-foreground">IntersectionObserver</code> para
              detectar quando o elemento entra na viewport e adicionar a classe{" "}
              <code className="bg-unfocused-border-color px-1 rounded text-foreground">.fade-up-visible</code>,
              disparando a transição de <em>opacity + translateY</em>.
            </p>
          </section>
        </FadeUp>

        {/* ── 3. Parallax ── */}
        <FadeUp delay={150}>
          <section className="border border-unfocused-border-color rounded-geist p-6 mb-8">
            <SectionTitle number="3" title="Parallax background no scroll" />
            <ParallaxHero />
          </section>
        </FadeUp>

        {/* ── 4. Hover effects ── */}
        <FadeUp delay={200}>
          <section className="border border-unfocused-border-color rounded-geist p-6 mb-8">
            <SectionTitle number="4" title="Hover: brilho, escala e rotação" />
            <AnimatedButtonsDemo />
          </section>
        </FadeUp>

        {/* ── 5. Word-by-word (Remotion) ── */}
        <FadeUp delay={250}>
          <section className="border border-unfocused-border-color rounded-geist p-6 mb-8">
            <SectionTitle number="5" title="Texto palavra por palavra — Remotion" />
            <div className="overflow-hidden rounded-geist mt-2">
              <Player
                component={WordByWord}
                inputProps={{ sentence: "Cada palavra ganha vida uma por vez" }}
                durationInFrames={200}
                fps={VIDEO_FPS}
                compositionHeight={VIDEO_HEIGHT}
                compositionWidth={VIDEO_WIDTH}
                style={{ width: "100%" }}
                controls
                autoPlay
                loop
              />
            </div>
          </section>
        </FadeUp>

        <Spacing />
        <Spacing />
        <Spacing />
        <Spacing />
        <Tips />
      </div>
    </div>
  );
};

export default Home;
