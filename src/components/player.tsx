import { Box, Grid } from "@chakra-ui/react";
import {
  createContext,
  MouseEventHandler,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Tables } from "../supabase.types";

type Track = Tables<"tracks">;

interface WaveformProps {
  data: number[] | null;
}

const WIDTH = 1000;
const HEIGHT = 80;

const Waveform = ({ data }: WaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!data) return;
    if (!canvasRef.current) return;

    const context = canvasRef.current.getContext("2d");
    if (!context) return;

    context.fillStyle = "red";

    for (let i = 0; i < 1000; i++) {
      const s = data[i];

      const height = Math.floor((s / 255) * HEIGHT);
      const y = (HEIGHT - height) / 2;
      context.fillRect(i, y, 1, height);
    }

    console.log(data);
  }, [data]);

  return (
    <canvas
      style={{ width: "100%", height: "80px" }}
      ref={canvasRef}
      width={`${WIDTH}px`}
      height={`${HEIGHT}px`}
    ></canvas>
  );
};

const clamp = (n: number, min: number, max: number) => {
  return Math.max(min, Math.min(n, max));
};

const roundFloat = (n: number, decimals: number = 2) => {
  return parseFloat(n.toFixed(decimals));
};

interface PlayerContextValue {
  ref: React.RefObject<HTMLAudioElement>;
  load: (track: Track, url: string) => void;
  play: (track: Track, url: string) => void;
  clear: () => void;
  track: Track | null;
}

export const PlayerContext = createContext<PlayerContextValue>({
  // @ts-ignore
  ref: null,
  load: () => {},
  play: () => {},
  track: null,
});

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLAudioElement>(null);

  const [track, setTrack] = useState<Track | null>(null);

  const value = useMemo(() => {
    const play = (track: Track, url: string) => {
      if (!ref.current) {
        return;
      }

      setTrack(track);

      ref.current.src = url;
      ref.current.play();
    };

    const load = (track: Track, url: string) => {
      if (!ref.current) {
        return;
      }

      setTrack(track);

      ref.current.src = url;
    };

    const clear = () => {
      if (!ref.current) {
        return;
      }

      setTrack(null);

      ref.current.pause();
      ref.current.currentTime = 0;
      ref.current.src = "";
    };

    return {
      ref,
      play,
      load,
      clear,
      track,
    };
  }, [track]);

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
};

export const Player = () => {
  const { ref, track } = useContext(PlayerContext);

  const [trackPercent, setTrackPercent] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    ref.current.addEventListener("timeupdate", (event) => {
      const percent = parseFloat(
        ((ref.current?.currentTime! / ref.current?.duration!) * 100).toFixed(2)
      );

      setTrackPercent(percent);
    });
  }, []);

  const onWaveformClick: MouseEventHandler<HTMLDivElement> = (e) => {
    // @ts-ignore
    const rect = e.target.getBoundingClientRect();

    const w = rect.width;
    let x = e.clientX - rect.left;
    // clamp between 0 and w
    x = clamp(x, 0, w);

    console.log(x / rect.width);

    const p = x / rect.width;

    setTrackPercent(p * 100);

    if (!ref.current?.src) return;

    ref.current.currentTime = roundFloat(p * ref.current.duration);
    ref.current.play();
  };

  const waveformData = useMemo(() => {
    // @ts-ignoressss
    return track ? (track.preview_data as number[]) : null;
  }, [track]);

  return (
    <Box>
      <Grid
        p="4px"
        position="fixed"
        bottom={0}
        left={0}
        w="100%"
        bg="grey"
        filter="sepia(10) hue-rotate(200deg)"
        templateColumns="1fr"
        templateRows="1fr"
        cursor="pointer"
        userSelect="none"
      >
        <Box
          background="white"
          gridRow="1/2"
          gridColumn="1/2"
          w={`${trackPercent}%`}
        />

        <Box gridRow="1/2" gridColumn="1/2" onClick={onWaveformClick}>
          <Waveform data={waveformData} />
        </Box>
      </Grid>
      <Box display="none" as="audio" w="100%" ref={ref} controls></Box>
    </Box>
  );
};
