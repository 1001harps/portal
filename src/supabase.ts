import { createClient, PostgrestSingleResponse } from "@supabase/supabase-js";
import { Database, Tables } from "./supabase.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export type Track = Tables<"tracks">;

export type Project =
  Database["public"]["Functions"]["get_projects"]["Returns"][number];

export type ProjectWithTracks = Tables<"projects"> & {
  tracks: Tables<"tracks">[];
};

// export const register = async (email: string, password: string) => {
//   const { data, error } = await supabase.auth.signUp({
//     email,
//     password,
//   });

//   return { data, error };
// };

export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
};

export const logout = async () => {
  return await supabase.auth.signOut();
};

export const getProjects = () => {
  return supabase.rpc("get_projects");
};

export const getProject = async (
  id: string,
): Promise<PostgrestSingleResponse<ProjectWithTracks>> => {
  return supabase
    .from("projects")
    .select(
      `*,
      tracks ( * )`,
    )
    .eq("id", id)
    .limit(1)
    .single();
};

export const createProject = (name: string) => {
  return supabase.from("projects").insert({
    name,
  });
};

export const deleteProject = (projectId: string) => {
  return supabase.from("projects").delete().eq("id", projectId);
};

export const getTrack = (id: string) => {
  return supabase
    .from("tracks")
    .select()
    .eq("id", id)
    .limit(1)
    .single();
};

export const createTrack = async (name: string, projectId: string) => {
  return supabase
    .from("tracks")
    .insert({ name, project_id: projectId })
    .select()
    .limit(1)
    .single();
};

export const deleteTrack = (trackId: string) => {
  return supabase.from("tracks").delete().eq("id", trackId);
};

export const setTrackUploaded = (trackId: string) => {
  return supabase
    .from("tracks")
    .update({ uploaded: true })
    .eq("id", trackId);
};

export const updateTrackName = (id: string, name: string) => {
  return supabase
    .from("tracks")
    .update({ name: name })
    .eq("id", id!)
    .select();
};

export const getTrackUrl = async (path: string) => {
  const result = await supabase.storage
    .from("uploads")
    .createSignedUrl(path, 3600);

  if (result.error) {
    throw result.error;
  }

  return result.data.signedUrl;
};
