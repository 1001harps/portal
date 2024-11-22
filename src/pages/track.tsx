import { Box, Button, HStack, Input } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSession } from "../auth";
import { PlayerContext } from "../components/player";
import {
  deleteTrack,
  getTrack,
  getTrackUrl,
  updateTrackName,
} from "../supabase";
import { Tables } from "../supabase.types";

export const Track = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState<Tables<"tracks"> | null>(null);
  const [name, setName] = useState("");

  const { session } = useSession();

  const player = useContext(PlayerContext);

  const loadTrack = async () => {
    const { data, error } = await getTrack(id!);

    // TODO: handle error properly
    if (error) throw error;
    if (!data) throw "track not found";

    setTrack(data);

    const path = `${session?.user.id}/${data.id}.mp3`;

    try {
      const url = await getTrackUrl(path);
      player.load(data, url);
    } catch (error) {
      console.error("failed to fetch file");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!session?.user.id) return;
    loadTrack();
  }, [session?.user.id]);

  useEffect(() => {
    if (!track) return;
    setName(track.name);
  }, [track]);

  const onNameUpdateClick = async () => {
    const result = await updateTrackName(id!, name);

    if (result.error) throw result.error;

    setTrack(result.data.at(0)!);
  };

  const onDeleteClick = async () => {
    const result = await deleteTrack(id!);

    if (result.error) throw result.error;

    navigate(`/projects/${track?.project_id}`);
  };

  if (loading) {
    return <Box>loading</Box>;
  }

  return (
    <Box>
      <HStack mb="16px">
        <Button
          onClick={() => navigate(`/projects/${track?.project_id}`)}
          variant="link"
        >
          back to project
        </Button>
      </HStack>

      <HStack mb="16px">
        <label>name:</label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button onClick={onNameUpdateClick}>Update</Button>
      </HStack>

      <HStack>
        <Button onClick={onDeleteClick} colorScheme="red">
          Delete
        </Button>
      </HStack>
    </Box>
  );
};
