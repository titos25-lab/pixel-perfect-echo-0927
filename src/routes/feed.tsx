import {createFileRoute,redirect} from "@tanstack/react-router";
import {useEffect,useState,type FormEvent,type ChangeEvent} from "react";
import {Heart,MessageCircle,Send,Newspaper,ImagePlus,X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {supabase} from "@/integrations/supabase/client";
import {useAuth} from "@/features/account/auth-context";

export const Route=createFileRoute("/feed")({ssr:false,beforeLoad:async()=>{const {data}=await supabase.auth.getUser();if(!data.user)throw redirect({to:"/auth"});},head:()=>({meta:[{title:"Comunidade — Ágape"}]}),component:Feed});
type Post={id:string;author_id:string;body:string;image_url:string|null;created_at:string};
type Member={user_id:string;display_name:string;denomination:string};
type Comment={id:string;post_id:string;author_id:string;body:string;created_at:string};
type CouplePost={id:string;couple_label:string;body:string;created_at:string};

function Feed(){
 const {user}=useAuth();
 const [posts,setPosts]=useState<Post[]>([]);
 const [couplePosts,setCouplePosts]=useState<CouplePost[]>([]);
 const [members,setMembers]=useState<Record<string,Member>>({});
 const [body,setBody]=useState("");
 const [photo,setPhoto]=useState<File|null>(null);
 const [preview,setPreview]=useState("");
 const [comments,setComments]=useState<Record<string,Comment[]>>({});
 const [drafts,setDrafts]=useState<Record<string,string>>({});
 const [likes,setLikes]=useState<Record<string,number>>({});
 const [liked,setLiked]=useState<string[]>([]);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");

 async function load(){
  const [{data},{data:coupleData}]=await Promise.all([
   supabase.from("posts").select("*").order("created_at",{ascending:false}).limit(50),
   supabase.from("couple_posts").select("id,couple_label,body,created_at").order("created_at",{ascending:false}).limit(20)
  ]);
  setCouplePosts((coupleData??[]) as CouplePost[]);
  const list=(data??[]) as Post[];
  setPosts(list);
  const ids=[...new Set(list.map(p=>p.author_id))];
  if(ids.length){
   const {data:people}=await supabase.from("member_profiles").select("user_id,display_name,denomination").in("user_id",ids);
   const map:Record<string,Member>={};
   (people??[]).forEach(p=>map[p.user_id]=p as Member);
   setMembers(map);
   const {data:allComments}=await supabase.from("post_comments").select("*").in("post_id",list.map(p=>p.id)).order("created_at");
   const grouped:Record<string,Comment[]>={};
   (allComments??[]).forEach(c=>{grouped[c.post_id]=[...(grouped[c.post_id]??[]),c as Comment];});
   setComments(grouped);
  }
  if(list.length){
   const {data:all}=await supabase.from("post_likes").select("post_id,user_id").in("post_id",list.map(p=>p.id));
   const count:Record<string,number>={};const own:string[]=[];
   (all??[]).forEach(x=>{count[x.post_id]=(count[x.post_id]??0)+1;if(x.user_id===user?.id)own.push(x.post_id);});
   setLikes(count);setLiked(own);
  }else{setComments({});setLikes({});setLiked([]);}
 }
 useEffect(()=>{void load();},[user?.id]);
 useEffect(()=>{if(!photo){setPreview("");return;}const url=URL.createObjectURL(photo);setPreview(url);return()=>URL.revokeObjectURL(url);},[photo]);

 function choosePhoto(e:ChangeEvent<HTMLInputElement>){
  const file=e.target.files?.[0];e.target.value="";
  if(!file)return;
  if(!["image/jpeg","image/png","image/webp"].includes(file.type)){setError("Escolhe uma imagem JPG, PNG ou WebP.");return;}
  if(file.size>15*1024*1024){setError("A imagem deve ter no máximo 15 MB.");return;}
  setError("");setPhoto(file);
 }

 async function publish(e:FormEvent){
  e.preventDefault();if(!user||(!body.trim()&&!photo))return;
  setBusy(true);setError("");let uploadedPath:string|undefined;
  try{
   let imageUrl:string|null=null;
   if(photo){
    const ext=photo.type==="image/png"?"png":photo.type==="image/webp"?"webp":"jpg";
    uploadedPath=user.id+"/"+crypto.randomUUID()+"."+ext;
    const {error:uploadError}=await supabase.storage.from("agape-post-media").upload(uploadedPath,photo,{contentType:photo.type});
    if(uploadError)throw new Error("Não foi possível enviar a fotografia. Verifica se o armazenamento de publicações está activo.");
    imageUrl=supabase.storage.from("agape-post-media").getPublicUrl(uploadedPath).data.publicUrl;
   }
   const {error:insertError}=await supabase.from("posts").insert({author_id:user.id,body:body.trim(),image_url:imageUrl});
   if(insertError)throw insertError;
   setBody("");setPhoto(null);await load();
  }catch(err){
   if(uploadedPath)await supabase.storage.from("agape-post-media").remove([uploadedPath]);
   console.error("Erro ao publicar:",err);
   setError(err instanceof Error?err.message:"Não foi possível publicar. Tenta novamente.");
  }finally{setBusy(false);}
 }
 async function toggleLike(id:string){
  if(!user)return;
  if(liked.includes(id))await supabase.from("post_likes").delete().eq("post_id",id).eq("user_id",user.id);
  else await supabase.from("post_likes").insert({post_id:id,user_id:user.id});
  await load();
 }
 async function comment(postId:string){
  if(!user||!drafts[postId]?.trim())return;
  const {error:err}=await supabase.from("post_comments").insert({post_id:postId,author_id:user.id,body:drafts[postId].trim()});
  if(err){setError("Não foi possível comentar. Tenta novamente.");return;}
  setDrafts(old=>({...old,[postId]:""}));await load();
 }

 return <section className="container mx-auto max-w-3xl px-4 py-10">
  <div className="mb-8"><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-green-500"><Newspaper size={15}/> Comunidade Ágape</p><h1 className="mt-2 text-3xl font-semibold">Um espaço para partilhar.</h1><p className="mt-2 text-muted-foreground">Publica fotografias e frases, tal como numa rede social.</p></div>
  <form onSubmit={publish} className="rounded-2xl border bg-card p-5">
   <label htmlFor="post-body" className="text-sm font-semibold">Escreve uma frase ou legenda</label>
   <textarea id="post-body" className="mt-3 min-h-24 w-full rounded-xl border bg-background p-3 text-sm" maxLength={3000} value={body} onChange={e=>setBody(e.target.value)} placeholder="O que gostarias de partilhar?"/>
   {preview&&<div className="relative mt-3 overflow-hidden rounded-xl"><img src={preview} alt="Pré-visualização da publicação" className="max-h-[420px] w-full rounded-xl object-contain"/><button type="button" aria-label="Remover fotografia" onClick={()=>setPhoto(null)} className="absolute right-2 top-2 rounded-full bg-black/75 p-2 text-white"><X size={17}/></button></div>}
   <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
    <div className="flex items-center gap-3"><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"><ImagePlus size={17}/> Adicionar foto<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto}/></label><span className="text-xs text-muted-foreground">{body.length}/3000</span></div>
    <Button type="submit" disabled={busy||(!body.trim()&&!photo)}>{busy?"A publicar…":"Publicar"} <Send size={15}/></Button>
   </div>
   <p className="mt-2 text-xs text-muted-foreground">JPG, PNG ou WebP · até 15 MB</p>
  </form>
  {error&&<p role="alert" className="mt-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
  <div className="mt-7 space-y-4">
   {couplePosts.map(p=><article key={p.id} className="rounded-2xl border border-green-700/30 bg-green-950/20 p-5"><p className="text-xs font-semibold uppercase tracking-wider text-green-500">Nossa Jornada</p><h2 className="mt-1 font-semibold">{p.couple_label}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7">{p.body}</p><p className="mt-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString("pt-MZ")}</p></article>)}
   {posts.map(p=><article key={p.id} className="overflow-hidden rounded-2xl border bg-card">
    <div className="flex items-center gap-3 p-5"><div className="grid size-10 place-items-center rounded-full bg-green-900/40 font-semibold text-green-400">{(members[p.author_id]?.display_name??"M").slice(0,1).toUpperCase()}</div><div><p className="text-sm font-semibold">{members[p.author_id]?.display_name??"Membro Ágape"}</p><p className="text-xs text-muted-foreground">{members[p.author_id]?.denomination??"Comunidade cristã"} · {new Date(p.created_at).toLocaleString("pt-MZ")}</p></div></div>
    {p.image_url&&<img src={p.image_url} alt="Fotografia da publicação" loading="lazy" className="max-h-[620px] w-full bg-black/5 object-contain"/>}
    {p.body&&<p className="whitespace-pre-wrap px-5 pt-4 text-sm leading-7">{p.body}</p>}
    <div className="px-5 pb-4 pt-4"><div className="border-t pt-3"><button onClick={()=>void toggleLike(p.id)} className={liked.includes(p.id)?"inline-flex items-center gap-2 text-sm text-rose-500":"inline-flex items-center gap-2 text-sm text-muted-foreground"}><Heart size={17} fill={liked.includes(p.id)?"currentColor":"none"}/>{likes[p.id]??0} gosto(s)</button><span className="ml-5 inline-flex items-center gap-2 text-sm text-muted-foreground"><MessageCircle size={17}/>{comments[p.id]?.length??0} comentários</span></div>
     <div className="mt-3 space-y-2">{(comments[p.id]??[]).map(c=><p key={c.id} className="rounded-lg bg-muted/50 px-3 py-2 text-sm"><strong>{members[c.author_id]?.display_name??"Membro"}:</strong> {c.body}</p>)}</div>
     <div className="mt-3 flex gap-2"><input className="min-w-0 flex-1 rounded-lg border bg-background px-3 text-sm" value={drafts[p.id]??""} onChange={e=>setDrafts(old=>({...old,[p.id]:e.target.value}))} maxLength={1500} placeholder="Escreve um comentário…"/><Button size="sm" variant="outline" onClick={()=>void comment(p.id)}>Comentar</Button></div>
    </div>
   </article>)}
   {posts.length===0&&<div className="rounded-2xl border border-dashed p-10 text-center"><Newspaper className="mx-auto text-muted-foreground" size={30}/><p className="mt-3 font-medium">Ainda não há publicações.</p><p className="mt-1 text-sm text-muted-foreground">Sê uma das primeiras pessoas a partilhar algo positivo.</p></div>}
  </div>
 </section>;
}
