import {
  Button,
  Flex,
  Heading,
  HStack,
  List,
  Progress,
  Stack,
  Text,
} from "@chakra-ui/react";
import { PostgrestError } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate, useParams } from "react-router-dom";
import * as tus from "tus-js-client";
import { useSession } from "../auth";
import { TrackCard } from "../components/track-card";
import { supabase } from "../supabase";
import { Tables } from "../supabase.types";

type Track = Tables<"tracks"> & { projects: { name: string } };

export const Project = () => {
  const { id: projectId } = useParams();

  if (!projectId) return <>404</>;

  const { session } = useSession();

  const navigate = useNavigate();

  const [project, setProject] = useState<Tables<"projects"> | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
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
      .select(
        ` 
        id,
        created_at,
        project_id,
        name,
        user_id,
        uploaded,
        preview_data,
        projects ( name )
        `
      )
      .eq("project_id", id);
    if (error) {
      setError(error);
      return;
    }

    setTracks(data as Track[]);
  };

  useEffect(() => {
    if (!projectId) return;

    fetchProject(projectId);
    fetchTracks(projectId);
  }, [projectId]);

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
      <Flex align="baseline" mb="16px" direction="column">
        <Heading mb="16px" as="h2" size="lg" w="100%">
          <HStack>
            <Text w="100%">{project.name}</Text> <Button size="xs">edit</Button>
          </HStack>
        </Heading>

        <HStack ml="auto" w="100%">
          <Button colorScheme="green" w="100%">
            Add Collaborator
          </Button>

          <Button
            disabled={tracks.length > 0}
            colorScheme="red"
            onClick={onDeleteClick}
            w="100%"
          >
            Delete
          </Button>
        </HStack>
      </Flex>

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

      <List spacing={2} mb="100px">
        {tracks.map((t) => (
          <TrackCard key={t.id} track={t} />
        ))}
      </List>
    </>
  );
};
