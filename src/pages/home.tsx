import { LoginForm } from "../components/login-form";
import { ProjectsList } from "../components/projects-list";

export const Home = () => {
  const isLoggedIn = true;
  return <>{isLoggedIn ? <ProjectsList /> : <LoginForm />}</>;
};
