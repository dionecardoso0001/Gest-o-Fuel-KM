import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "@remotion/google-fonts/Inter";

const WORD_DELAY = 8;

const AnimatedWord: React.FC<{ word: string; startFrame: number }> = ({
  word,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    fps,
    frame: frame - startFrame,
    config: { damping: 200, stiffness: 120 },
    durationInFrames: 25,
  });

  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
  });
  const y = interpolate(progress, [0, 1], [28, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <span
      style={{
        display: "inline-block",
        opacity,
        transform: `translateY(${y}px)`,
        marginRight: "0.28em",
      }}
    >
      {word}
    </span>
  );
};

export const WordByWord: React.FC<{ sentence: string }> = ({ sentence }) => {
  const words = sentence.split(" ");

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 60px",
      }}
    >
      <p
        style={{
          fontFamily,
          fontSize: 64,
          fontWeight: 700,
          color: "#fff",
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        {words.map((word, i) => (
          <AnimatedWord key={i} word={word} startFrame={i * WORD_DELAY} />
        ))}
      </p>
    </AbsoluteFill>
  );
};
