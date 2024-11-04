import { Box, Button, HStack, Input } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { getTrackUrl, supabase } from "../supabase";
import { useContext, useEffect, useState } from "react";
import { Tables } from "../supabase.types";
import { useSession } from "../auth";
import { PlayerContext } from "../components/player";

const fetchTrack = async (id: string) => {
  const result = await supabase
    .from("tracks")
    .select()
    .eq("id", id)
    .limit(1)
    .single();

  if (result.error) throw result.error;

  return result.data;
};

export const Track = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState<Tables<"tracks"> | null>(null);

  const [name, setName] = useState("");

  const { session } = useSession();

  const player = useContext(PlayerContext);

  useEffect(() => {
    if (!session?.user.id) return;

    fetchTrack(id!).then(async (track) => {
      setTrack(track);

      if (!track) return;

      const path = `${session?.user.id}/${track.id}.mp3`;

      console.log(path);

      try {
        const url = await getTrackUrl(path);
        player.load(track.id, url);
      } catch (error) {
        console.error("failed to fetch file");
      }

      setLoading(false);
    });
  }, [session?.user.id]);

  useEffect(() => {
    if (!track) return;

    setName(track.name);
  }, [track]);

  const onNameUpdateClick = async () => {
    const result = await supabase
      .from("tracks")
      .update({ name: name })
      .eq("id", id!)
      .select();

    if (result.error) throw result.error;

    setTrack(result.data.at(0)!);
  };

  const onDeleteClick = async () => {
    const result = await supabase.from("tracks").delete().eq("id", id!);

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
