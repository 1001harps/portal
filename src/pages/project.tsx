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
import { useParams } from "react-router-dom";
import { ArrowLeftIcon } from "@chakra-ui/icons";

const tracks = Array.from({ length: 5 }).map((_, i) => ({
  id: i.toString(),
  name: `Track ${i}`,
}));

export const Project = () => {
  const { id } = useParams();

  if (!id) return <>404</>;

  const name = `Project ${id}`;

  return (
    <>
      <HStack align="baseline" mb="16px">
        <Heading mb="16px" as="h2" size="lg">
          {name}
        </Heading>

        <Button ml="auto">Add Collaborator</Button>
      </HStack>

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
