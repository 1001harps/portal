import { Box } from "@chakra-ui/react";
import { createContext, useContext, useMemo, useRef, useState } from "react";

interface PlayerContextValue {
  ref: React.RefObject<HTMLAudioElement>;
  load: (id: string, url: string) => void;
  play: (id: string, url: string) => void;
  clear: () => void;
  trackId: string | null;
}

export const PlayerContext = createContext<PlayerContextValue>({
  // @ts-ignore
  ref: null,
  load: () => {},
  play: () => {},
  trackId: null,
});

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLAudioElement>(null);

  const [trackId, setTrackId] = useState<string | null>(null);

  const value = useMemo(() => {
    const play = (id: string, url: string) => {
      if (!ref.current) {
        return;
      }

      setTrackId(id);

      ref.current.src = url;
      ref.current.play();
    };

    const load = (id: string, url: string) => {
      if (!ref.current) {
        return;
      }

      setTrackId(id);

      ref.current.src = url;
    };

    const clear = () => {
      if (!ref.current) {
        return;
      }

      setTrackId(null);

      ref.current.pause();
      ref.current.currentTime = 0;
      ref.current.src = "";
    };

    return {
      ref,
      play,
      load,
      clear,
      trackId,
    };
  }, [trackId]);

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
};

export const Player = () => {
  const { ref } = useContext(PlayerContext);

  return (
    <Box
      p="8px"
      h="70px"
      position="fixed"
      bottom={0}
      left={0}
      w="100%"
      bg="grey"
    >
      <Box as="audio" w="100%" ref={ref} controls></Box>
    </Box>
  );
};
