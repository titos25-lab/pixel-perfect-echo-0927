import { createServerFn } from '@tanstack/react-start';
import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
export const profileSchema=z.object({full_name:z.string().trim().min(2,'Indique o seu nome.').max(100),phone:z.string().trim().max(20).regex(/^[+\d\s()-]*$/,'Contacto inválido.'),location:z.string().trim().min(2).max(100),display_name:z.string().trim().max(100),specialty:z.string().trim().max(100),category:z.string().max(100),bio:z.string().trim().max(2000),public_phone:z.string().trim().max(20).regex(/^[+\d\s()-]*$/,'Contacto inválido.'),is_published:z.boolean()});
export const getAccount=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {supabase,userId}=context;
 const [profile,roles,professional]=await Promise.all([supabase.from('profiles').select('*').eq('id',userId).single(),supabase.from('user_roles').select('role').eq('user_id',userId),supabase.from('professional_profiles').select('*').eq('user_id',userId).maybeSingle()]);
 if(profile.error || roles.error || professional.error) throw new Error('Não foi possível abrir o seu perfil.');
 let avatarUrl:string|null=null;
 if(profile.data.avatar_path){const signed=await supabase.storage.from('profile-photos').createSignedUrl(profile.data.avatar_path,3600); avatarUrl=signed.data?.signedUrl??null;}
 return {profile:profile.data,roles:roles.data,professional:professional.data,avatarUrl};
});
export const accountQuery=()=>queryOptions({queryKey:['account'],queryFn:()=>getAccount()});
export const saveAccount=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(profileSchema).handler(async({data,context})=>{
 const {supabase,userId}=context;
 const {error}=await supabase.from('profiles').update({full_name:data.full_name,phone:data.phone,location:data.location}).eq('id',userId);
 if(error) throw new Error('Não foi possível guardar o perfil.');
 const {data:roles,error:roleError}=await supabase.from('user_roles').select('role').eq('user_id',userId);
 if(roleError) throw new Error('Não foi possível confirmar o tipo de conta.');
 if(roles.some(r=>r.role==='professional')) {
  if(data.is_published && (!data.display_name || !data.specialty || !data.category)) throw new Error('Preencha o nome profissional, especialidade e categoria antes de publicar.');
  const {error:err}=await supabase.from('professional_profiles').update({display_name:data.display_name,specialty:data.specialty,category:data.category,bio:data.bio,location:data.location,public_phone:data.public_phone,is_published:data.is_published}).eq('user_id',userId);
  if(err) throw new Error('Não foi possível guardar o perfil profissional.');
 }
 return {success:true};
});
