import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { queryOptions } from '@tanstack/react-query';
import type { Database } from '@/integrations/supabase/types';
export const listProfessionals = createServerFn({method:'GET'}).handler(async () => {
 const url=process.env['SUPABASE_URL']; const key=process.env['SUPABASE_PUBLISHABLE_KEY'];
 if(!url || !key) throw new Error('Não foi possível carregar os profissionais.');
 const client=createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const headers=new Headers(init?.headers); if(key.startsWith('sb_') && headers.get('Authorization')===`Bearer ${key}`) headers.delete('Authorization'); headers.set('apikey',key); return fetch(input,{...init,headers});}}});
 const {data,error}=await client.from('professional_profiles').select('id,user_id,display_name,specialty,category,bio,location,public_phone,photo_key,is_verified,is_demo').eq('is_published',true).order('created_at',{ascending:false});
 if(error) throw new Error('Não foi possível carregar os profissionais. Tente novamente.');

 // Profile photos are stored in a private bucket. Generate short-lived URLs
 // on the server so public marketplace cards can display the owner's current photo.
 const userIds=[...new Set(data.map(person=>person.user_id).filter((id):id is string=>Boolean(id)))];
 const photoUrls=new Map<string,string>();
 if(userIds.length){
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const {data:profiles,error:profilesError}=await supabaseAdmin.from('profiles').select('id,avatar_path').in('id',userIds);
  if(profilesError) throw new Error('Não foi possível carregar as fotografias dos profissionais.');
  await Promise.all((profiles??[]).filter(profile=>profile.avatar_path).map(async profile=>{
   const {data:signed,error:signedError}=await supabaseAdmin.storage.from('profile-photos').createSignedUrl(profile.avatar_path!,86400);
   if(!signedError && signed?.signedUrl) photoUrls.set(profile.id,signed.signedUrl);
  }));
 }
 return data.map(person=>({...person,photo_url:person.user_id?photoUrls.get(person.user_id)??null:null}));
});
export const professionalsQuery=()=>queryOptions({queryKey:['professionals'],queryFn:()=>listProfessionals(),staleTime:60000});
export type Professional=Awaited<ReturnType<typeof listProfessionals>>[number];
