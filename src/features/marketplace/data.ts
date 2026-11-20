import { HeartPulse, Brain, Scale, Camera, Sparkles, GraduationCap, Monitor, BriefcaseBusiness, Hammer, Car, PartyPopper, BrushCleaning, Palette, FileText, Shapes } from 'lucide-react';
import p0 from '@/assets/professional-0.asset.json';
import p1 from '@/assets/professional-1.asset.json';
import p2 from '@/assets/professional-2.asset.json';
import p3 from '@/assets/professional-3.asset.json';
export const categories = [
 {name:'Saúde e bem-estar',icon:HeartPulse}, {name:'Psicologia e aconselhamento',icon:Brain}, {name:'Advocacia e serviços jurídicos',icon:Scale}, {name:'Fotografia e videografia',icon:Camera}, {name:'Beleza e estética',icon:Sparkles}, {name:'Educação e explicações',icon:GraduationCap}, {name:'Tecnologia e informática',icon:Monitor}, {name:'Consultoria empresarial',icon:BriefcaseBusiness}, {name:'Construção civil e manutenção',icon:Hammer}, {name:'Mecânica e serviços automóveis',icon:Car}, {name:'Eventos e decoração',icon:PartyPopper}, {name:'Limpeza e serviços domésticos',icon:BrushCleaning}, {name:'Marketing e design',icon:Palette}, {name:'Serviços administrativos',icon:FileText}, {name:'Outros serviços',icon:Shapes},
];
export const photos: Record<string,string> = {'0':p0.url,'1':p1.url,'2':p2.url,'3':p3.url};
export const plans = [
 {name:'Gratuito',price:0,features:['Perfil básico','Presença nas pesquisas','Informações de contacto']},
 {name:'Basic',price:150,features:['Perfil completo e serviços','Pedidos de reserva','Calendário e gestão de reservas']},
 {name:'Professional',price:350,features:['Tudo do Basic','Serviços ilimitados e portefólio','Gestão de clientes e estatísticas']},
 {name:'Premium',price:750,features:['Tudo do Professional','Perfil destacado nas pesquisas','Relatórios avançados e divulgação']},
 {name:'Business',price:1500,features:['Perfil empresarial','Equipa e múltiplos calendários','Gestão centralizada de serviços']},
];
export function money(value:number) {return `${new Intl.NumberFormat('pt-MZ').format(value)} MT`;}
export function normalize(value:string) {return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
