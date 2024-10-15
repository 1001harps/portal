import { Button, Input, Stack } from "@chakra-ui/react";

export const LoginForm = () => {
  return (
    <Stack as="form">
      <label>
        email
        <Input></Input>
      </label>

      <label>
        password
        <Input type="password"></Input>
      </label>

      <Button>Sign In</Button>
      <Button>Register</Button>
    </Stack>
  );
};
