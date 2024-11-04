import { createClient } from "@supabase/supabase-js";
import { Database } from "./supabase.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

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

export const getTrackUrl = async (path: string) => {
  const result = await supabase.storage
    .from("uploads")
    .createSignedUrl(path, 3600);

  if (result.error) {
    throw result.error;
  }

  return result.data.signedUrl;
};
