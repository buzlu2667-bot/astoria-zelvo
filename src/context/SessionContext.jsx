import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 🔥 İlk session sadece 1 kez alınır
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    // 🔥 Auth event listener (tek stabil kaynak)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession); // tek güncelleme noktası
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // 🔒 TAB’A GERİ GELİNCE SESSION CANLANDIRICI (RELOAD YOK)
  useEffect(() => {
    const reviveSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        await supabase.auth.refreshSession();
      }
    };

    window.addEventListener("focus", reviveSession);
    document.addEventListener("visibilitychange", reviveSession);

    return () => {
      window.removeEventListener("focus", reviveSession);
      document.removeEventListener("visibilitychange", reviveSession);
    };
  }, []);

  return (
    <SessionContext.Provider
      value={{
        session,
        loading,
        signOut: async () => {
          await supabase.auth.signOut();
          setSession(null);
        },
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
