import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [isRecovering, setIsRecovering] = useState(false);

  // ✅ Çıkış fonksiyonu EKLENDİ
  async function doSignOut() {
    await supabase.auth.signOut();
    setSession(null);
    console.log("✅ SignOut Tamamlandı!");
  }

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const current = data.session;
      if (current?.type === "recovery") {
        setIsRecovering(true);
        setSession(null);
      } else {
        setSession(current);
      }
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        switch (event) {
          case "PASSWORD_RECOVERY":
            setIsRecovering(true);
            setSession(null);
            break;

          case "SIGNED_IN":
            if (!isRecovering) setSession(newSession);
            break;

          case "SIGNED_OUT":
            setIsRecovering(false);
            setSession(null);
            break;

          default:
            break;
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [isRecovering]);

  return (
    <SessionContext.Provider
      value={{
        session,
        isRecovering,
        signOut: doSignOut, // ✅ ARTIK BASINCA ÇALIŞIR
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
