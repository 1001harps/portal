import { createRoot } from "react-dom/client";
import "./index.css";
import { ChakraProvider } from "@chakra-ui/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "./pages/home";
import { Layout } from "./components/layout";
import { Projects } from "./pages/projects";
import { Project } from "./pages/project";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/projects/:id",
    element: <Project />,
  },
  {
    path: "/projects",
    element: <Projects />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <ChakraProvider>
    <Layout>
      <RouterProvider router={router} />
    </Layout>
  </ChakraProvider>
);
