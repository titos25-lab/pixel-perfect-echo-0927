import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { queryOptions } from '@tanstack/react-query';
import type { Database } from '@/integrations/supabase/types';
export const listProfessionals = createServerFn({method:'GET'}).handler(async () => {
 const url=process.env['SUPABASE_URL']; const key=process.env['SUPABASE_PUBLISHABLE_KEY'];
 if(!url || !key) throw new Error('Não foi possível carregar os profissionais.');
 const client=createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const headers=new Headers(init?.headers); if(key.startsWith('sb_') && headers.get('Authorization')===`Bearer ${key}`) headers.delete('Authorization'); headers.set('apikey',key); return fetch(input,{...init,headers});}}});
 const {data,error}=await client.from('professional_profiles').select('id,display_name,specialty,category,bio,location,public_phone,photo_key,is_verified,is_demo').eq('is_published',true).order('created_at',{ascending:false});
 if(error) throw new Error('Não foi possível carregar os profissionais. Tente novamente.');
 return data;
});
export const professionalsQuery=()=>queryOptions({queryKey:['professionals'],queryFn:()=>listProfessionals(),staleTime:60000});
export type Professional=Awaited<ReturnType<typeof listProfessionals>>[number];
