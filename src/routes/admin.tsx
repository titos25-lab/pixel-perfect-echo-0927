import { createFileRoute, redirect, Link } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  LayoutDashboard, Users, BriefcaseBusiness, ShieldCheck, Search,
  RefreshCw, CheckCircle2, XCircle, Eye, EyeOff, LogOut, AlertCircle, Trash2, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Professional = {
  id: string;
  user_id: string | null;
  display_name: string;
  category: string;
  specialty: string;
  location: string;
  public_phone: string;
  is_published: boolean;
  is_verified: boolean;
  is_featured: boolean;
  featured_until: string | null;
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string;
  location: string;
  phone: string;
  created_at: string;
};

export const Route = createFileRoute('/admin')({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: '/auth', search: { modo: 'entrar' } });
    const { data: allowed, error: roleError } = await supabase.rpc('has_role', {
      _role: 'admin',
      _user_id: data.user.id,
    });
    if (roleError || allowed !== true) throw redirect({ to: '/' });
  },
  head: () => ({
    meta: [
      { title: 'Administração — DA UM TOUCH' },
      { name: 'description', content: 'Painel de administração da DA UM TOUCH.' },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [section, setSection] = useState<'overview' | 'professionals' | 'users'>('overview');
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    const [professionalResult, profileResult] = await Promise.all([
      supabase.from('professional_profiles').select('id,user_id,display_name,category,specialty,location,public_phone,is_published,is_verified,is_featured,featured_until,created_at').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id,full_name,location,phone,created_at').order('created_at', { ascending: false }),
    ]);
    if (professionalResult.error || profileResult.error) {
      setError('Não foi possível carregar os dados. Confirme as permissões administrativas e as políticas de acesso da base de dados.');
    } else {
      setProfessionals((professionalResult.data ?? []) as Professional[]);
      setProfiles((profileResult.data ?? []) as Profile[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const filteredProfessionals = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('pt-MZ');
    if (!term) return professionals;
    return professionals.filter((p) =>
      [p.display_name, p.category, p.specialty, p.location].some((value) =>
        value?.toLocaleLowerCase('pt-MZ').includes(term),
      ),
    );
  }, [professionals, query]);

  const filteredProfiles = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('pt-MZ');
    if (!term) return profiles;
    return profiles.filter((p) =>
      [p.full_name, p.location, p.phone].some((value) =>
        value?.toLocaleLowerCase('pt-MZ').includes(term),
      ),
    );
  }, [profiles, query]);

  async function updateProfessional(id: string, changes: Partial<Pick<Professional, 'is_verified' | 'is_published' | 'is_featured' | 'featured_until'>>) {
    setBusyId(id);
    setError('');
    const { error: updateError } = await supabase.from('professional_profiles').update(changes).eq('id', id);
    if (updateError) {
      setError('Não foi possível actualizar este perfil. Verifique as políticas RLS para administradores.');
    } else {
      setProfessionals((items) => items.map((item) => item.id === id ? { ...item, ...changes } : item));
    }
    setBusyId(null);
  }

  async function deleteProfessional(id: string) {
    if (!window.confirm('Tem a certeza de que pretende eliminar permanentemente este perfil profissional?')) return;
    setBusyId(id);
    setError('');
    const { error: deleteError } = await supabase.from('professional_profiles').delete().eq('id', id);
    if (deleteError) setError('Não foi possível eliminar o perfil. Verifique as permissões administrativas.');
    else setProfessionals((items) => items.filter((item) => item.id !== id));
    setBusyId(null);
  }

  async function toggleFeatured(p: Professional) {
    const active = p.is_featured && (!p.featured_until || new Date(p.featured_until).getTime() > Date.now());
    await updateProfessional(p.id, active
      ? { is_featured: false, featured_until: null }
      : { is_featured: true, featured_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() });
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.assign('/auth');
  }

  const pending = professionals.filter((p) => !p.is_verified).length;
  const published = professionals.filter((p) => p.is_published).length;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3 font-bold tracking-tight text-foreground">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><ShieldCheck size={21}/></span>
            <span>DA UM TOUCH <span className="ml-1 text-xs font-medium text-muted-foreground">ADMIN</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void loadData()} disabled={loading}><RefreshCw size={15} className="mr-2"/>Actualizar</Button>
            <Button variant="ghost" size="sm" onClick={() => void signOut()}><LogOut size={15} className="mr-2"/>Sair</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[230px_1fr]">
        <aside className="space-y-2">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gestão da plataforma</p>
          {([
            ['overview', LayoutDashboard, 'Visão geral'],
            ['professionals', BriefcaseBusiness, 'Profissionais'],
            ['users', Users, 'Utilizadores'],
          ] as const).map(([key, Icon, label]) => (
            <button key={key} onClick={() => { setSection(key); setQuery(''); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors ${section === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
              <Icon size={18}/>{label}
            </button>
          ))}
          <div className="mt-6 rounded-xl border bg-background p-3 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck size={17} className="mb-2 text-primary"/>
            Acesso restrito a contas com a função administrativa atribuída na base de dados.
          </div>
        </aside>

        <main className="min-w-0 space-y-6">
          <div>
            <p className="text-sm font-medium text-primary">Painel de controlo</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
              {section === 'overview' ? 'Visão geral' : section === 'professionals' ? 'Gestão de profissionais' : 'Utilizadores registados'}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Administração da plataforma DA UM TOUCH.</p>
          </div>

          {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"><AlertCircle size={18} className="mt-0.5 shrink-0"/>{error}</div>}

          {section === 'overview' && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Utilizadores" value={profiles.length} icon={<Users size={19}/>} />
                <StatCard label="Profissionais" value={professionals.length} icon={<BriefcaseBusiness size={19}/>} />
                <StatCard label="Por verificar" value={pending} icon={<AlertCircle size={19}/>} />
                <StatCard label="Perfis publicados" value={published} icon={<Eye size={19}/>} />
              </div>
              <section className="rounded-2xl border bg-background p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div><h2 className="font-semibold">Últimos profissionais registados</h2><p className="text-sm text-muted-foreground">Revise os perfis e o estado de verificação.</p></div>
                  <Button variant="outline" size="sm" onClick={() => setSection('professionals')}>Gerir profissionais</Button>
                </div>
                <ProfessionalTable items={professionals.slice(0, 5)} busyId={busyId} onUpdate={updateProfessional} onDelete={deleteProfessional} onFeature={toggleFeatured}/>
              </section>
            </>
          )}

          {section !== 'overview' && (
            <section className="overflow-hidden rounded-2xl border bg-background">
              <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
                <div><h2 className="font-semibold">{section === 'professionals' ? 'Directório de profissionais' : 'Contas da plataforma'}</h2><p className="text-sm text-muted-foreground">{section === 'professionals' ? `${filteredProfessionals.length} perfil(is)` : `${filteredProfiles.length} utilizador(es)`}</p></div>
                <div className="relative w-full sm:max-w-xs"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar..." className="pl-9"/></div>
              </div>
              {section === 'professionals' ? <ProfessionalTable items={filteredProfessionals} busyId={busyId} onUpdate={updateProfessional} onDelete={deleteProfessional} onFeature={toggleFeatured}/> : (
                <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-muted/50 text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">Nome</th><th className="px-4 py-3">Localização</th><th className="px-4 py-3">Contacto</th><th className="px-4 py-3">Registo</th></tr></thead><tbody className="divide-y">{filteredProfiles.map((p) => <tr key={p.id}><td className="px-4 py-3 font-medium">{p.full_name || 'Sem nome'}</td><td className="px-4 py-3">{p.location || '—'}</td><td className="px-4 py-3">{p.phone || '—'}</td><td className="px-4 py-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString('pt-MZ')}</td></tr>)}</tbody></table>{filteredProfiles.length === 0 && <EmptyState text="Nenhum utilizador encontrado."/>}</div>
              )}
            </section>
          )}
          {loading && <p className="text-center text-sm text-muted-foreground">A carregar dados administrativos…</p>}
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return <div className="rounded-2xl border bg-background p-5"><div className="flex items-center justify-between text-muted-foreground"><span className="text-sm">{label}</span><span className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</span></div><p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{value}</p></div>;
}

function ProfessionalTable({ items, busyId, onUpdate, onDelete, onFeature }: { items: Professional[]; busyId: string | null; onUpdate: (id: string, changes: Partial<Pick<Professional, 'is_verified' | 'is_published' | 'is_featured' | 'featured_until'>>) => Promise<void>; onDelete: (id: string) => Promise<void>; onFeature: (professional: Professional) => Promise<void> }) {
  if (items.length === 0) return <EmptyState text="Ainda não existem profissionais para apresentar."/>;
  return <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-muted/50 text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">Profissional</th><th className="px-4 py-3">Localização</th><th className="px-4 py-3">Verificação</th><th className="px-4 py-3">Publicação</th><th className="px-4 py-3">Destaque</th><th className="px-4 py-3">Acções</th></tr></thead><tbody className="divide-y">{items.map((p) => <tr key={p.id}><td className="px-4 py-3"><p className="font-semibold">{p.display_name}</p><p className="text-xs text-muted-foreground">{p.category}{p.specialty ? ` · ${p.specialty}` : ''}</p></td><td className="px-4 py-3">{p.location || '—'}</td><td className="px-4 py-3">{p.is_verified ? <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle2 size={14}/>Verificado</span> : <span className="inline-flex items-center gap-1 text-amber-700"><AlertCircle size={14}/>Pendente</span>}</td><td className="px-4 py-3">{p.is_published ? 'Publicado' : 'Oculto'}</td><td className="px-4 py-3">{p.is_featured && (!p.featured_until || new Date(p.featured_until).getTime() > Date.now()) ? 'Premium' : 'Normal'}</td><td className="px-4 py-3"><div className="flex flex-wrap items-center gap-2"><Button size="sm" variant="outline" disabled={busyId === p.id} onClick={() => void onUpdate(p.id, { is_verified: !p.is_verified })}>{p.is_verified ? <><XCircle size={14} className="mr-1"/>Retirar</> : <><CheckCircle2 size={14} className="mr-1"/>Verificar</>}</Button><Button size="sm" variant="ghost" disabled={busyId === p.id} onClick={() => void onUpdate(p.id, { is_published: !p.is_published })}>{p.is_published ? <><EyeOff size={14} className="mr-1"/>Ocultar</> : <><Eye size={14} className="mr-1"/>Publicar</>}</Button><Button size="sm" variant="outline" disabled={busyId === p.id} onClick={() => void onFeature(p)}><Sparkles size={14} className="mr-1"/>{p.is_featured ? 'Retirar destaque' : 'Destacar 30 dias'}</Button><Button size="sm" variant="ghost" disabled={busyId === p.id} onClick={() => void onDelete(p.id)} aria-label="Eliminar profissional"><Trash2 size={14}/></Button></div></td></tr>)}</tbody></table></div>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="px-4 py-12 text-center text-sm text-muted-foreground">{text}</div>;
}
