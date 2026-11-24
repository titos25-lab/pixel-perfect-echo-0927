import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
const AuthContext = createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true });
export function AuthProvider({ children }: { children: ReactNode }) {
 const [user,setUser]=useState<User|null>(null); const [loading,setLoading]=useState(true); const router=useRouter(); const queryClient=useQueryClient();
 useEffect(()=>{let active=true;const refresh=async()=>{const {data}=await supabase.auth.getUser();if(active){setUser(data.user);setLoading(false);}};
 const {data:{subscription}}=supabase.auth.onAuthStateChange(event=>{if(!["SIGNED_IN","SIGNED_OUT","USER_UPDATED"].includes(event))return;if(event==="SIGNED_OUT"){setUser(null);queryClient.clear();}else{void refresh();void queryClient.invalidateQueries();}void router.invalidate();});
 void refresh();return()=>{active=false;subscription.unsubscribe();};},[router,queryClient]);
 return <AuthContext.Provider value={{user,loading}}>{children}</AuthContext.Provider>;
}
export function useAuth(){return useContext(AuthContext);}
