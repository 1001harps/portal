import { Box, Button, Heading, HStack, Text } from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box as="main">
      <HStack p="16px" py="24px" as="header" bg="black" color="white">
        <Heading size="xl">portal</Heading>
        <Button ml="auto">
          <HamburgerIcon />
        </Button>
      </HStack>
      <Box p="16px">{children}</Box>
    </Box>
  );
};
