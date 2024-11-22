import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  Heading,
  HStack,
  Input,
  List,
  ListItem,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { createProject, getProjects, Project } from "../supabase";
import { Link } from "react-router-dom";

export const ProjectsList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");

  const onAddProjectClick = async () => {
    // TODO: error handling
    await createProject(newProjectName);

    setNewProjectName("");
    await loadProjects();
  };

  const loadProjects = async () => {
    const { data, error } = await getProjects();
    if (error) {
      console.error(error);
      return;
    }

    setProjects(data);
  };

  useEffect(() => {
    loadProjects();
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
          <ListItem key={p.id}>
            <Stack
              as={Link}
              to={`/projects/${p.id}`}
              border="1px solid black"
              p="16px"
              key={p.id}
            >
              <Heading as="h3" size="md">
                {p.name}
              </Heading>
              <Text>
                {p.track_count} {p.track_count === 1 ? "track" : "tracks"}
              </Text>
            </Stack>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
};
