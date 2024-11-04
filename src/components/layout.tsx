import {
  Box,
  Button,
  Heading,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { logout } from "../supabase";
import { useSession } from "../auth";
import { Player } from "./player";
import { Link } from "react-router-dom";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useSession();

  return (
    <Box as="main">
      <HStack p="16px" py="24px" as="header" bg="black">
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
      <Box p="16px">{children}</Box>

      <Player />
    </Box>
  );
};
