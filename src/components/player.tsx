import {
  Box,
  Button,
  Flex,
  HStack,
  Progress,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Track } from "../supabase";

const roundFloat = (n: number, decimals: number = 2) => {
  return parseFloat(n.toFixed(decimals));
};

interface PlayerContextValue {
  load: (track: Track, url: string) => void;
  play: (track: Track, url: string, seekPercent?: number) => void;
  clear: () => void;
  seek: (percent: number) => void;
  track: Track | null;
  trackPercent: number;
}

export const PlayerContext = createContext<PlayerContextValue>({
  load: () => {},
  play: () => {},
  seek: () => {},
  clear: () => {},
  track: null,
  trackPercent: 0,
});

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLAudioElement>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [trackPercent, setTrackPercent] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    const listener = () => {
      const percent = parseFloat(
        ((ref.current?.currentTime! / ref.current?.duration!) * 100).toFixed(2)
      );

      setTrackPercent(percent);
    };

    ref.current.addEventListener("timeupdate", listener);

    return () => {
      ref.current?.removeEventListener("timeupdate", listener);
    };
  }, []);

  const value = useMemo(() => {
    const play = async (track: Track, url: string, seekPercent = 0) => {
      if (!ref.current) {
        return;
      }

      setTrack(track);

      ref.current.src = url;
      await ref.current.play();
      if (seekPercent > 0) {
        ref.current.currentTime = roundFloat(
          seekPercent * ref.current.duration
        );
      }
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

    const seek = (percent: number) => {
      setTrackPercent(percent * 100);

      if (!ref.current?.src) return;

      ref.current.currentTime = roundFloat(percent * ref.current.duration);
      ref.current.play();
    };

    return {
      play,
      load,
      clear,
      track,
      seek,
    };
  }, [track]);

  return (
    <PlayerContext.Provider value={{ ...value, trackPercent }}>
      <Box display="none" as="audio" w="100%" ref={ref} controls></Box>
      {children}
    </PlayerContext.Provider>
  );
};

const usePlayer = () => useContext(PlayerContext);

export const Player = () => {
  const { trackPercent } = usePlayer();

  return (
    <Flex
      position="fixed"
      bottom={0}
      w="100%"
      bg="grey"
      height="80px"
      padding="8px"
      align="center"
      direction={useBreakpointValue({ base: "column" })}
    >
      <HStack w="100%" mb="8px">
        <Progress value={trackPercent} w="100%" />
      </HStack>

      <HStack w="100%" justify="space-between" align="center">
        <HStack>
          <Button size="sm">prev</Button>
          <Button size="sm">play</Button>
          <Button size="sm">next</Button>
        </HStack>

        <HStack>
          <Text>0.00 / 3.20</Text>
          <Text>cockroach / airpod sunset</Text>
        </HStack>
      </HStack>
    </Flex>
  );
};
