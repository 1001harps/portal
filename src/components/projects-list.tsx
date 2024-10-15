import { AddIcon } from "@chakra-ui/icons";
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

const projects = Array.from({ length: 6 }).map((_, i) => ({
  id: i.toString(),
  name: `project ${i}`,
  trackCount: Math.floor(Math.random() * 10),
}));

export const ProjectsList = () => {
  return (
    <Stack>
      <HStack align="baseline">
        <Heading mb="16px" as="h2" size="lg">
          projects
        </Heading>

        <Button ml="auto">
          <AddIcon />
        </Button>
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
                {p.trackCount} {p.trackCount === 1 ? "track" : "tracks"}
              </Text>
            </Stack>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
};
