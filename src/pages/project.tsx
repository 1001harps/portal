import {
  Box,
  Button,
  Heading,
  HStack,
  Input,
  Link,
  List,
  ListItem,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { Tables } from "../supabase.types";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { supabase } from "../supabase";
import { PostgrestError } from "@supabase/supabase-js";

import * as tus from "tus-js-client";
import { useSession } from "../auth";

export const Project = () => {
  const { id } = useParams();

  if (!id) return <>404</>;

  const { session } = useSession();

  const [project, setProject] = useState<Tables<"projects"> | null>(null);
  const [tracks, setTracks] = useState<Tables<"tracks">[]>([]);
  const [error, setError] = useState<PostgrestError | null>(null);

  const [uploading, setUploading] = useState(false);

  const [uploadPercent, setUploadPercent] = useState(0);

  const handleUpload = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!e.target.file || e.target.file.files.length === 0) {
      return;
    }

    setUploading(true);
    setError(null);
    setUploadPercent(0);

    const file: File = e.target.file.files[0];

    var upload = new tus.Upload(file, {
      endpoint: `${import.meta.env.VITE_SOURCE_API_BASE_URL}/uploads`,
      headers: {
        "X-API-KEY": import.meta.env.VITE_SOURCE_API_KEY,
      },
      metadata: {
        name: file.name,
        project_id: project?.id!,
        supabase_jwt: session?.access_token!,
      },
      onError: function (error) {
        console.log("failed: " + error);
        setError(null);
        setUploading(false);
      },
      onProgress(bytesUploaded: number, bytesTotal: number) {
        const percent = Math.floor((bytesUploaded / bytesTotal) * 100);
        setUploadPercent(percent);
      },
      onSuccess: function () {
        console.log("success", file);
        setUploading(false);
      },
    });

    upload.start();
  };

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
    if (!id) return;

    fetchProject(id);
    fetchTracks(id);
  }, [id]);

  if (error) return <HStack>{error.message}</HStack>;
  if (!project) return <HStack>loading</HStack>;

  return (
    <>
      <HStack align="baseline" mb="16px">
        <Heading mb="16px" as="h2" size="lg">
          {project.name}
        </Heading>

        {/* <Button ml="auto">Add Collaborator</Button> */}
      </HStack>

      <Box>
        <form onSubmit={handleUpload}>
          <Stack>
            <Input
              p="16px"
              h="70px"
              border="none"
              w="100%"
              type="file"
              name="file"
            />
            <Button type="submit" disabled={uploading}>
              {uploading ? `uploading: ${uploadPercent}%` : "upload"}
            </Button>
          </Stack>
        </form>
      </Box>

      <List spacing={2}>
        {tracks.map((t) => (
          <ListItem>
            <HStack as={Link} href={`/projects/tracks/${t.id}`} key={t.id}>
              <Text>{t.name}</Text>

              <Button size="sm" ml="auto">
                ▶
              </Button>
            </HStack>
          </ListItem>
        ))}
      </List>
    </>
  );
};
