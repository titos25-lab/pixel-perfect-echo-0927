import {createFileRoute,redirect} from "@tanstack/react-router";
import {useEffect,useMemo,useState} from "react";
import {ShieldCheck,Flag,Check,X,Users,LayoutDashboard,Search,RefreshCw,Eye,UserCheck,UserX} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {toast} from "sonner";
import {supabase} from "@/integrations/supabase/client";
import {useAuth} from "@/features/account/auth-context";

export const Route=createFileRoute("/admin")({
  ssr:false,
  beforeLoad:async()=>{
    const {data}=await supabase.auth.getUser();
    if(!data.user)throw redirect({to:"/auth"});
    const {data:ok,error}=await supabase.rpc("has_role",{_role:"admin",_user_id:data.user.id});
    if(error||!ok)throw redirect({to:"/feed"});
  },
  head:()=>({meta:[{title:"Administração — ÁGAPE"},{name:"robots",content:"noindex"}]}),
  component:Admin
});

type Report={id:string;reporter_id:string;reported_user_id:string;category:string;details:string;status:string};
type Member={user_id:string;display_name:string;location:string;denomination:string;is_active:boolean;is_verified:boolean};

function Admin(){
  const {user}=useAuth();
  const [reports,setReports]=useState<Report[]>([]);
  const [members,setMembers]=useState<Member[]>([]);
  const [names,setNames]=useState<Record<string,string>>({});
  const [tab,setTab]=useState<"overview"|"reports"|"members">("overview");
  const [query,setQuery]=useState("");
  const [loading,setLoading]=useState(true);
  const [busyId,setBusyId]=useState("");
  async function load(){
    setLoading(true);
    const [r,m]=await Promise.all([
      supabase.from("reports").select("*").order("created_at",{ascending:false}),
      supabase.from("member_profiles").select("user_id,display_name,location,denomination,is_active,is_verified").order("created_at",{ascending:false}).limit(500)
    ]);
    if(r.error||m.error){toast.error("Não foi possível carregar todos os dados administrativos.");}
    const reportRows=(r.data??[]) as Report[];
    const memberRows=(m.data??[]) as Member[];
    setReports(reportRows);setMembers(memberRows);
    const ids=[...new Set(reportRows.flatMap(x=>[x.reporter_id,x.reported_user_id]))];
    if(ids.length){
      const {data}=await supabase.from("member_profiles").select("user_id,display_name").in("user_id",ids);
      const map:Record<string,string>={};(data??[]).forEach(p=>map[p.user_id]=p.display_name);setNames(map);
    }else setNames({});
    setLoading(false);
  }
  useEffect(()=>{if(user?.id)void load();},[user?.id]);
  const pending=reports.filter(r=>r.status==="pending");
  const active=members.filter(m=>m.is_active);
  const verified=members.filter(m=>m.is_verified);
  const filteredMembers=useMemo(()=>members.filter(m=>{
    const q=query.trim().toLocaleLowerCase();
    return !q||[m.display_name,m.location,m.denomination].some(v=>(v||"").toLocaleLowerCase().includes(q));
  }),[members,query]);
  async function setStatus(r:Report,status:"reviewing"|"resolved"|"dismissed"){
    if(!user)return;setBusyId(r.id);
    const {error}=await supabase.from("reports").update({status,reviewed_by:user.id,updated_at:new Date().toISOString()}).eq("id",r.id);
    if(error)toast.error("Não foi possível actualizar a denúncia.");else{toast.success("Denúncia actualizada.");await load();}
    setBusyId("");
  }
  async function setMember(m:Member,changes:{is_active?:boolean;is_verified?:boolean}){
    setBusyId(m.user_id);
    const {error}=await supabase.from("member_profiles").update(changes).eq("user_id",m.user_id);
    if(error)toast.error("Não foi possível actualizar o membro.");else{toast.success("Membro actualizado.");await load();}
    setBusyId("");
  }
  const tabs=[{id:"overview" as const,label:"Visão geral",icon:LayoutDashboard},{id:"reports" as const,label:"Denúncias",icon:Flag,count:pending.length},{id:"members" as const,label:"Membros",icon:Users,count:members.length}];
  return <section className="container mx-auto max-w-6xl px-4 py-8 pb-24 md:py-10">
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3"><div className="grid size-12 place-items-center rounded-xl bg-amber-100 text-amber-900"><ShieldCheck/></div><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">ÁGAPE · ÁREA RESTRITA</p><h1 className="text-3xl font-semibold">Painel administrativo</h1><p className="mt-1 text-sm text-muted-foreground">Gestão da comunidade e moderação da plataforma.</p></div></div>
      <Button variant="outline" size="sm" onClick={()=>void load()} disabled={loading}><RefreshCw size={15} className={loading?"animate-spin":""}/> Actualizar dados</Button>
    </div>
    <div className="mb-6 flex flex-wrap gap-2">{tabs.map(t=>{const Icon=t.icon;return <Button key={t.id} variant={tab===t.id?"default":"outline"} onClick={()=>setTab(t.id)}><Icon size={15}/>{t.label}{t.count!==undefined&&<span className="ml-1 rounded-full bg-background/20 px-2 py-0.5 text-xs">{t.count}</span>}</Button>;})}</div>
    {loading?<div className="rounded-xl border p-10 text-center text-sm text-muted-foreground">A carregar dados administrativos…</div>:<>
      {tab==="overview"&&<div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={Users} label="Membros registados" value={members.length}/>
          <Stat icon={UserCheck} label="Contas activas" value={active.length}/>
          <Stat icon={ShieldCheck} label="Perfis verificados" value={verified.length}/>
          <Stat icon={Flag} label="Denúncias pendentes" value={pending.length} warning={pending.length>0}/>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border bg-card p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Denúncias recentes</h2><Button size="sm" variant="ghost" onClick={()=>setTab("reports")}>Ver todas</Button></div>
            {reports.slice(0,4).length?reports.slice(0,4).map(r=><div key={r.id} className="border-t py-3 first:border-0"><div className="flex justify-between gap-3"><p className="text-sm font-medium">{r.category}</p><span className="text-xs text-muted-foreground">{r.status}</span></div><p className="mt-1 text-xs text-muted-foreground">Denunciado: {names[r.reported_user_id]??"Membro"}</p></div>):<p className="rounded-lg bg-muted/40 p-5 text-center text-sm text-muted-foreground">Ainda não existem denúncias.</p>}
          </div>
          <div className="rounded-2xl border bg-card p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Membros recentes</h2><Button size="sm" variant="ghost" onClick={()=>setTab("members")}>Ver todos</Button></div>
            {members.slice(0,5).map(m=><div key={m.user_id} className="flex items-center justify-between gap-3 border-t py-3 first:border-0"><div className="min-w-0"><p className="truncate text-sm font-medium">{m.display_name}</p><p className="truncate text-xs text-muted-foreground">{m.location||"Localização não indicada"}</p></div><span className="shrink-0 text-xs text-muted-foreground">{m.is_active?"Activo":"Oculto"}</span></div>)}
            {!members.length&&<p className="text-sm text-muted-foreground">Sem membros registados.</p>}
          </div>
        </div>
      </div>}
      {tab==="reports"&&<div className="space-y-3">{reports.map(r=><article key={r.id} className="rounded-xl border bg-card p-5"><div className="flex flex-wrap justify-between gap-2"><div><p className="font-semibold">{r.category}</p><p className="mt-1 text-xs text-muted-foreground">Denunciado: {names[r.reported_user_id]??"Membro"} · Por: {names[r.reporter_id]??"Membro"}</p><p className="mt-3 text-sm">{r.details||"Sem detalhes adicionais."}</p></div><span className="text-xs text-muted-foreground">{r.status}</span></div><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={busyId===r.id} onClick={()=>void setStatus(r,"reviewing")}>Em análise</Button><Button size="sm" disabled={busyId===r.id} onClick={()=>void setStatus(r,"resolved")}><Check size={14}/> Resolvida</Button><Button size="sm" variant="outline" disabled={busyId===r.id} onClick={()=>void setStatus(r,"dismissed")}><X size={14}/> Arquivar</Button></div></article>)}{reports.length===0&&<Empty text="Não existem denúncias registadas."/>}</div>}
      {tab==="members"&&<div className="space-y-4"><div className="relative max-w-md"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" placeholder="Pesquisar por nome, localização ou igreja…" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="overflow-x-auto rounded-xl border bg-card"><table className="w-full text-left text-sm"><thead className="bg-muted"><tr><th className="p-3">Membro</th><th className="p-3">Localização</th><th className="p-3">Denominação</th><th className="p-3">Estado</th><th className="p-3">Acções</th></tr></thead><tbody>{filteredMembers.map(m=><tr key={m.user_id} className="border-t"><td className="p-3 font-medium">{m.display_name}</td><td className="p-3">{m.location||"—"}</td><td className="p-3">{m.denomination||"—"}</td><td className="p-3"><span className={m.is_active?"text-green-700":"text-muted-foreground"}>{m.is_active?"Activo":"Oculto"}</span><span className="block text-xs text-muted-foreground">{m.is_verified?"Verificado":"Não verificado"}</span></td><td className="p-3"><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={busyId===m.user_id} onClick={()=>void setMember(m,{is_active:!m.is_active})}>{m.is_active?<><Eye size={14}/> Ocultar</>:<><UserX size={14}/> Reactivar</>}</Button><Button size="sm" variant="outline" disabled={busyId===m.user_id} onClick={()=>void setMember(m,{is_verified:!m.is_verified})}>{m.is_verified?"Retirar selo":"Verificar"}</Button></div></td></tr>)}</tbody></table>{filteredMembers.length===0&&<p className="p-8 text-center text-sm text-muted-foreground">Nenhum membro corresponde à pesquisa.</p>}</div></div>}
    </>}
  </section>;
}
function Stat({icon:Icon,label,value,warning=false}:{icon:typeof Users;label:string;value:number;warning?:boolean}){return <div className="rounded-2xl border bg-card p-5"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{label}</span><Icon size={18} className={warning?"text-amber-700":"text-muted-foreground"}/></div><p className="mt-3 text-3xl font-semibold tabular-nums">{value}</p></div>;}
function Empty({text}:{text:string}){return <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">{text}</p>;}
