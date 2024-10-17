import { Alert, AlertIcon, Box, Button, Input, Stack } from "@chakra-ui/react";
import { useState } from "react";
import { login } from "../supabase";
import { AuthError } from "@supabase/supabase-js";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<AuthError | null>(null);

  const onSignInClick = async () => {
    const { error } = await login(email, password);
    if (error) setError(error);
  };

  return (
    <Stack as="form" onSubmit={(e) => e.preventDefault()}>
      {error && (
        <Alert status="error">
          <AlertIcon />
          {error.message}
        </Alert>
      )}

      <label>
        email
        <Input value={email} onChange={(e) => setEmail(e.target.value)}></Input>
      </label>

      <label>
        password
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        ></Input>
      </label>

      <Button onClick={onSignInClick}>Sign In</Button>
    </Stack>
  );
};
