import { Box, Grid } from "@chakra-ui/react";
import { useRef, useEffect, MouseEventHandler, useContext } from "react";
import { PlayerContext } from "./player";

const clamp = (n: number, min: number, max: number) => {
  return Math.max(min, Math.min(n, max));
};

interface WaveformProps {
  data: number[] | null;
  onClick: (waveFormPercent: number) => void;
  currentlyPlaying: boolean;
}

const WIDTH = 1000;
const HEIGHT = 80;

export const Waveform = ({
  data,
  onClick,
  currentlyPlaying,
}: WaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { trackPercent } = useContext(PlayerContext);

  useEffect(() => {
    if (!data) return;
    if (!canvasRef.current) return;

    const context = canvasRef.current.getContext("2d");
    if (!context) return;

    for (let i = 0; i < 1000; i += 4) {
      const s = data[i];
      context.fillStyle = "#367beb";

      const height = Math.floor((s / 255) * HEIGHT);
      const y = (HEIGHT - height) / 2;
      context.fillRect(i, y, 4, height);
    }
  }, [data]);

  const onWaveformClick: MouseEventHandler<HTMLDivElement> = (e) => {
    // @ts-ignore
    const rect = e.target.getBoundingClientRect();

    const w = rect.width;
    let x = e.clientX - rect.left;
    // clamp between 0 and w
    x = clamp(x, 0, w);

    const p = x / rect.width;

    onClick(p);
  };

  return (
    <Grid
      w="100%"
      templateColumns="1fr"
      templateRows="1fr"
      cursor="pointer"
      userSelect="none"
    >
      <Box gridRow="1/2" gridColumn="1/2" onClick={onWaveformClick}>
        <canvas
          style={{ width: "100%", height: "80px", imageRendering: "pixelated" }}
          ref={canvasRef}
          width={`${WIDTH}px`}
          height={`${HEIGHT}px`}
        ></canvas>
      </Box>

      {currentlyPlaying && (
        <Box
          mixBlendMode="difference"
          background="white"
          z-index={1000}
          filter="hue-rotate(100deg)"
          gridRow="1/2"
          gridColumn="1/2"
          w={`${trackPercent}%`}
        />
      )}
    </Grid>
  );
};
