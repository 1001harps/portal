import { useContext } from "react";
import { LoginForm } from "../components/login-form";
import { ProjectsList } from "../components/projects-list";
import { AuthContext } from "../auth";

export const Home = () => {
  const { isLoggedIn } = useContext(AuthContext);

  return <>{isLoggedIn ? <ProjectsList /> : <LoginForm />}</>;
};
