import { AddIcon } from "@chakra-ui/icons";
import {
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
import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Tables } from "../supabase.types";

export const ProjectsList = () => {
  const [projects, setProjects] = useState<Tables<"projects">[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [trackCounts, setTrackCounts] = useState<Record<string, number>>({});

  const onAddProjectClick = async () => {
    await supabase.from("projects").insert({
      name: newProjectName,
    });

    setNewProjectName("");
    await loadProjects();
    await loadTrackCounts();
  };

  const loadProjects = async () => {
    const { data, error } = await supabase.from("projects").select();

    if (error) {
      console.error(error);
      return;
    }

    setProjects(data);
  };

  const loadTrackCounts = async () => {
    const { data, error } = await supabase.from("tracks").select();

    if (error) {
      console.error(error);
      return;
    }

    const trackCounts: Record<string, number> = {};
    data.forEach((track) => {
      if (!(track.project_id in trackCounts)) {
        trackCounts[track.project_id] = 0;
        return;
      }

      trackCounts[track.project_id]++;
    });

    console.log(trackCounts);

    setTrackCounts(trackCounts);
  };

  useEffect(() => {
    loadProjects();
    loadTrackCounts();
  }, []);

  return (
    <Stack>
      <HStack align="baseline">
        <Heading mb="16px" as="h2" size="lg">
          projects
        </Heading>

        <HStack ml="auto">
          <Input
            type="text"
            placeholder="project name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          ></Input>
          <Button onClick={onAddProjectClick}>
            <AddIcon />
          </Button>
        </HStack>
      </HStack>

      <List spacing={2}>
        {projects.map((p) => (
          <ListItem>
            <Stack
              as={Link}
              href={`/projects/${p.id}`}
              border="1px solid black"
              p="16px"
              key={p.id}
            >
              <Heading as="h3" size="md">
                {p.name}
              </Heading>
              <Text>
                {p.id in trackCounts
                  ? `${trackCounts[p.id]} ${
                      trackCounts[p.id] ? "track" : "tracks"
                    }`
                  : "0 tracks"}
              </Text>
            </Stack>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
};
