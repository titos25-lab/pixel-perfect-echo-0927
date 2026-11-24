import {createFileRoute,Link} from '@tanstack/react-router';
import {useState,type FormEvent} from 'react';
import {z} from 'zod';
import {zodValidator} from '@tanstack/zod-adapter';
import {UserRound,BriefcaseBusiness,ArrowRight,Mail,LogIn,UserPlus} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from '@/features/account/auth-context';
export const Route=createFileRoute('/auth')({validateSearch:zodValidator(z.object({modo:z.enum(['inicio','registo','entrar']).optional()})),head:()=>({meta:[{title:'Entrar ou criar conta — Dá Um Touch'},{name:'description',content:'Aceda à sua conta ou registe-se na Dá Um Touch.'},{property:'og:title',content:'Dá Um Touch'},{property:'og:description',content:'Encontre profissionais e serviços em Moçambique.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),component:AuthPage});
function AuthPage(){
 const search=Route.useSearch();const navigate=Route.useNavigate();const {user,loading}=useAuth();
 const mode=search.modo??'inicio';
 const [type,setType]=useState<'client'|'professional'>('client');
 const [name,setName]=useState('');const [age,setAge]=useState('');const [email,setEmail]=useState('');const [code,setCode]=useState('');
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [created,setCreated]=useState(false);
 async function register(e:FormEvent){
  e.preventDefault();setError('');
  const numericAge=Number(age);
  if(!Number.isInteger(numericAge)||numericAge<18||numericAge>100){setError('Indique uma idade válida (18 a 100 anos).');return;}
  setBusy(true);
  try{
   const {data,error:invokeError}=await supabase.functions.invoke('issue-initial-code',{body:{email:email.trim().toLowerCase(),name:name.trim(),age:numericAge,accountType:type}});
   if(invokeError)throw invokeError;
   if(data?.error)throw new Error(data.error);
   setCreated(true);
  }catch(err){const message=err instanceof Error?err.message:'';setError(message.includes('already')||message.includes('409')?'Este email já tem uma conta. Escolha Entrar.':message||'Não foi possível criar a conta. Verifique os dados e tente novamente.');}
  finally{setBusy(false);}
 }
 async function login(e:FormEvent){
  e.preventDefault();setError('');setBusy(true);
  try{
   const {error:loginError}=await supabase.auth.signInWithPassword({email:email.trim().toLowerCase(),password:code});
   if(loginError)throw loginError;
   const {data:authData}=await supabase.auth.getUser();
   if(authData.user){
    const {data:isAdmin}=await supabase.rpc('has_role',{_role:'admin',_user_id:authData.user.id});
    void navigate({to:isAdmin?'/admin':'/conta'});
   }
  }catch(err){const message=err instanceof Error?err.message:'';setError(message.includes('Invalid login')?'Email ou código incorrectos. Verifique os dados e tente novamente.':'Não foi possível entrar. Confirme o email e o código de acesso.');}
  finally{setBusy(false);}
 }
 if(user&&!loading)return <section className="auth-page"><div className="auth-panel"><h1>Já tem sessão iniciada.</h1><p>Continue para a sua área pessoal.</p><Button asChild variant="positive"><Link to="/conta">A minha conta<ArrowRight/></Link></Button></div></section>;
 if(created)return <section className="auth-page"><div className="auth-panel"><div className="eyebrow mb-3"><Mail size={14}/> CONFIRME O SEU EMAIL</div><h1>A sua conta está criada!</h1><p>Enviámos o seu código permanente de acesso para <strong>{email}</strong>. Abra o email, copie o código e volte à página de entrada para iniciar sessão.</p><div className="form-success mt-5"><Mail className="mb-2"/>O código é pessoal. Guarde-o num local seguro e não o partilhe.</div><Button className="mt-5 w-full" variant="positive" onClick={()=>{setCreated(false);setCode('');void navigate({search:{modo:'entrar'}});}}>Voltar e entrar com o código<ArrowRight/></Button></div></section>;
 if(mode==='inicio')return <section className="auth-page"><div className="auth-panel"><div className="eyebrow mb-3">DÁ UM TOUCH</div><h1>Bem-vindo à Dá Um Touch</h1><p>Para continuar, escolha uma opção.</p><div className="form-stack mt-6"><Button className="h-12 justify-start" variant="positive" onClick={()=>void navigate({search:{modo:'registo'}})}><UserPlus/>Criar conta<ArrowRight className="ml-auto"/></Button><Button className="h-12 justify-start" variant="outline" onClick={()=>void navigate({search:{modo:'entrar'}})}><LogIn/>Entrar<ArrowRight className="ml-auto"/></Button></div></div></section>;
 if(mode==='registo')return <section className="auth-page"><div className="auth-panel"><div className="eyebrow mb-3">NOVO REGISTO</div><h1>Criar a sua conta</h1><p>Preencha os seus dados. Não precisa de criar palavra-passe: enviaremos um código permanente para o seu email.</p><form className="form-stack mt-5" onSubmit={register}><div className="role-picker"><Button type="button" variant={type==='client'?'default':'outline'} onClick={()=>setType('client')}><UserRound/>Sou cliente</Button><Button type="button" variant={type==='professional'?'default':'outline'} onClick={()=>setType('professional')}><BriefcaseBusiness/>Sou profissional</Button></div><label className="field">Nome completo<Input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="O seu nome completo"/></label><label className="field">Idade<Input required type="number" min={18} max={100} step={1} value={age} onChange={e=>setAge(e.target.value)} placeholder="A sua idade"/></label><label className="field">Email<Input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nome@exemplo.com"/></label>{error&&<div className="form-error" role="alert">{error}</div>}<Button type="submit" variant="positive" disabled={busy} className="h-11">{busy?'A criar conta…':'Criar conta e receber código'}<ArrowRight/></Button></form><div className="auth-switch">Já tem conta? <Button variant="link" className="h-auto p-0 text-xs" onClick={()=>void navigate({search:{modo:'entrar'}})}>Entrar</Button></div></div></section>;
 return <section className="auth-page"><div className="auth-panel"><div className="eyebrow mb-3">BEM-VINDO DE VOLTA</div><h1>Entrar na plataforma</h1><p>Introduza o email e o código permanente que recebeu quando criou a sua conta.</p><form className="form-stack mt-5" onSubmit={login}><label className="field">Email<Input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nome@exemplo.com"/></label><label className="field">Código de acesso<Input required type="password" autoComplete="current-password" value={code} onChange={e=>setCode(e.target.value)} placeholder="Cole aqui o código recebido por email"/></label>{error&&<div className="form-error" role="alert">{error}</div>}<Button type="submit" variant="positive" disabled={busy} className="h-11">{busy?'A verificar…':'Entrar'}<ArrowRight/></Button></form><div className="auth-switch">Ainda não tem conta? <Button variant="link" className="h-auto p-0 text-xs" onClick={()=>void navigate({search:{modo:'registo'}})}>Criar conta</Button></div><Button variant="link" className="mt-3 h-auto p-0 text-xs" onClick={()=>void navigate({search:{modo:'inicio'}})}>Voltar</Button></div></section>;
}
