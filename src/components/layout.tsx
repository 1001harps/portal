import { HamburgerIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Heading,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useSession } from "../auth";
import { logout } from "../supabase";
import { Player } from "./player";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useSession();

  return (
    <Stack as="main" align="center">
      <HStack p="16px" py="24px" as="header" bg="black" w="100%">
        <Heading size="xl" color="white">
          <Link to="/">portal</Link>
        </Heading>

        <Menu>
          <MenuButton ml="auto" as={Button}>
            <HamburgerIcon />
          </MenuButton>
          <MenuList>
            {isLoggedIn && <MenuItem onClick={logout}>Sign Out</MenuItem>}
          </MenuList>
        </Menu>
      </HStack>
      <Box maxW="800px" w="100%" p="16px">
        {children}
      </Box>

      <Player />
    </Stack>
  );
};
