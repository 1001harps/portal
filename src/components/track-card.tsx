import { Box, Button, HStack, Text } from "@chakra-ui/react";
import { useContext } from "react";
import { useSession } from "../auth";
import { getTrackUrl, Track } from "../supabase";
import { PlayerContext } from "./player";

interface TrackCardProps {
  track: Track;
  onDeleteClick: () => void;
}

export const TrackCard = ({ track, onDeleteClick }: TrackCardProps) => {
  const { session } = useSession();
  const { play, track: trackPlaying, clear, seek } = useContext(PlayerContext);

  const currentlyPlaying = track.id === trackPlaying?.id;

  const playTrack = async (seekPercent = 0) => {
    if (currentlyPlaying && seekPercent > 0) {
      seek(seekPercent);
      return;
    }

    const path = `${session?.user.id}/${track.id}.mp3`;

    const url = await getTrackUrl(path);

    play(track, url, seekPercent);
  };

  // const waveformData = useMemo(() => {
  //   // @ts-ignore
  //   return track ? (track.preview_data as number[]) : null;
  // }, [track]);

  return (
    <Box p="4px">
      <HStack justify="space-between" mb="8px">
        <Text>{track.name}</Text>

        <HStack>
          <Button
            size="sm"
            onClick={() => {
              if (!trackPlaying || !currentlyPlaying) {
                playTrack();
              } else {
                clear();
              }
            }}
          >
            {currentlyPlaying ? "pause" : "play"}
          </Button>
          <Button size="sm">share</Button>
          <Button colorScheme="red" size="sm" onClick={onDeleteClick}>
            delete
          </Button>
          {/* <Button size="sm">..</Button> */}
        </HStack>
      </HStack>

      {/* <Waveform
        data={waveformData}
        onClick={playTrack}
        currentlyPlaying={currentlyPlaying}
      /> */}
    </Box>
  );
};
