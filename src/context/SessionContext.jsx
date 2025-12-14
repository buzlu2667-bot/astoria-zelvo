import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { sendShopAlert } from "../utils/sendShopAlert";

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  let mounted = true;

  supabase.auth.getSession().then(({ data }) => {
    if (!mounted) return;
    setSession(data.session);
    setLoading(false);

    handleNewUser(data.session);
  });

  const { data: listener } = supabase.auth.onAuthStateChange(
    async (_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      handleNewUser(newSession);
    }
  );

  async function handleNewUser(session) {
    const user = session?.user;
    if (!user) return;

    // ✅ GERÇEK YENİ ÜYE KONTROLÜ
    const isNewUser =
      user.created_at === user.last_sign_in_at;

    if (!isNewUser) return;

    const key = `tg_new_user_${user.id}`;
    if (localStorage.getItem(key)) return;

    await sendShopAlert(`
🆕 YENİ ÜYE KAYDI
📧 Mail: ${user.email}
👤 Ad: ${user.user_metadata?.full_name || "-"}
🔑 Kaynak: ${user.app_metadata?.provider || "email"}
`);

    localStorage.setItem(key, "1");
  }

  return () => {
    mounted = false;
    listener.subscription.unsubscribe();
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
