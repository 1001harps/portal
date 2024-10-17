import { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

type AuthContextValue =
  | {
      isLoggedIn: true;
      session: Session;
    }
  | {
      isLoggedIn: false;
      session: null;
    };

const authContextDefaultValue: AuthContextValue = {
  isLoggedIn: false,
  session: null,
};

export const AuthContext = createContext<AuthContextValue>(
  authContextDefaultValue
);

interface AuthContextProviderProps {
  children: React.ReactNode;
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [value, setValue] = useState<AuthContextValue>(authContextDefaultValue);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValue({ isLoggedIn: true, session: session });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === "SIGNED_OUT") {
        setValue({ isLoggedIn: false, session: null });
      } else {
        if (session) {
          setValue({ isLoggedIn: true, session: session });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useSession = () => {
  return useContext(AuthContext);
};
