import {
  Button,
  Heading,
  HStack,
  Link,
  List,
  ListItem,
  Stack,
  Text,
} from "@chakra-ui/react";
import { PostgrestError } from "@supabase/supabase-js";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTrackUrl, supabase } from "../supabase";
import { Tables } from "../supabase.types";

import { Progress } from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import * as tus from "tus-js-client";
import { useSession } from "../auth";
import { PlayerContext } from "../components/player";

export const Project = () => {
  const { id: projectId } = useParams();

  if (!projectId) return <>404</>;

  const { session } = useSession();
  const player = useContext(PlayerContext);

  const navigate = useNavigate();

  const [project, setProject] = useState<Tables<"projects"> | null>(null);
  const [tracks, setTracks] = useState<Tables<"tracks">[]>([]);
  const [error, setError] = useState<PostgrestError | null>(null);

  const [_uploading, setUploading] = useState(false);

  const [uploadPercent, setUploadPercent] = useState(0);

  const handleUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadPercent(0);

    // TODO: validate file type

    // TODO: can we make this record automatically on the backend?
    const result = await supabase
      .from("tracks")
      .insert({ name: file.name, project_id: projectId })
      .select();

    if (result.error) {
      throw result.error;
    }

    const track = result.data.at(0);
    if (!track) {
      throw "failed to create track";
    }

    var upload = new tus.Upload(file, {
      endpoint: import.meta.env.VITE_UPLOAD_URL!,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${session?.access_token}`,
        "x-upsert": "true", // optionally set upsert to true to overwrite existing files
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true, // Important if you want to allow re-uploading the same file https://github.com/tus/tus-js-client/blob/main/docs/api.md#removefingerprintonsuccess
      metadata: {
        bucketName: `uploads`,
        objectName: `${session?.user.id}/${track.id}.mp3`,
        contentType: file.type,
        // cacheControl: 3600,
      },
      chunkSize: 6 * 1024 * 1024, // NOTE: it must be set to 6MB (for now) do not change it
      onError: function (error) {
        console.log("Failed because: " + error);
        setError(null);
        setUploading(false);
      },
      onProgress: function (bytesUploaded, bytesTotal) {
        var percent = parseFloat(
          ((bytesUploaded / bytesTotal) * 100).toFixed(2)
        );
        setUploadPercent(percent);
      },
      onSuccess: async function () {
        console.log("Download %s from %s", upload.file, upload.url);

        await supabase
          .from("tracks")
          // @ts-ignore, TODO: figure out why the types aren't working
          .update({ uploaded: true })
          .eq("id", track.id);

        await fetchTracks(projectId);

        setUploading(false);
        setUploadPercent(0);
      },
    });

    upload.start();
  };

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      handleUpload(file);
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "audio/mpeg": [".mp3"],
    },
  });

  const fetchProject = async (id: string) => {
    const { data, error } = await supabase
      .from("projects")
      .select()
      .eq("id", id)
      .limit(1)
      .single();

    if (error) {
      setError(error);
      return;
    }

    setProject(data);
  };

  const fetchTracks = async (id: string) => {
    const { data, error } = await supabase
      .from("tracks")
      .select()
      .eq("project_id", id);
    if (error) {
      setError(error);
      return;
    }

    setTracks(data);
  };

  useEffect(() => {
    if (!projectId) return;

    fetchProject(projectId);
    fetchTracks(projectId);
  }, [projectId]);

  const onPlayClick = async (trackId: string) => {
    if (trackId === player.trackId) {
      player.clear();
      return;
    }

    const path = `${session?.user.id}/${trackId}.mp3`;
    const url = await getTrackUrl(path);

    player.play(trackId, url);
  };

  const onDeleteClick = async () => {
    const result = await supabase.from("projects").delete().eq("id", projectId);

    if (result.error) {
      throw result.error;
    }

    navigate(`/projects`);
  };

  if (error) return <HStack>{error.message}</HStack>;
  if (!project) return <HStack>loading</HStack>;

  return (
    <>
      <HStack align="baseline" mb="16px">
        <Heading mb="16px" as="h2" size="lg">
          {project.name}
        </Heading>

        <HStack ml="auto">
          <Button colorScheme="green">Add Collaborator</Button>

          <Button
            disabled={tracks.length > 0}
            colorScheme="red"
            onClick={onDeleteClick}
          >
            Delete
          </Button>
        </HStack>
      </HStack>

      <Stack
        border="2px dashed grey"
        p="32px"
        h="200px"
        mb="16px"
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <Text m="auto">Drop file here or click to select files</Text>
      </Stack>

      <Progress value={uploadPercent} mb="32px" />

      <Heading size="lg" mb="16px">
        tracks:
      </Heading>
      <List spacing={2}>
        {tracks.map((t) => (
          <ListItem key={t.id}>
            <HStack>
              <Text as={Link} href={`/tracks/${t.id}`} key={t.id}>
                {t.name}
              </Text>

              <Button size="sm" ml="auto" onClick={() => onPlayClick(t.id)}>
                {player.trackId === t.id ? "■" : "▶"}
              </Button>
            </HStack>
          </ListItem>
        ))}
      </List>
    </>
  );
};
