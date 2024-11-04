import { ChakraProvider } from "@chakra-ui/react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthContextProvider } from "./auth";
import { Layout } from "./components/layout";
import { PlayerProvider } from "./components/player";
import "./index.css";
import { Home } from "./pages/home";
import { Project } from "./pages/project";
import { Projects } from "./pages/projects";
import { Track } from "./pages/track";

createRoot(document.getElementById("root")!).render(
  <ChakraProvider>
    <AuthContextProvider>
      <PlayerProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects/:id" element={<Project />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/tracks/:id" element={<Track />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </PlayerProvider>
    </AuthContextProvider>
  </ChakraProvider>
);
