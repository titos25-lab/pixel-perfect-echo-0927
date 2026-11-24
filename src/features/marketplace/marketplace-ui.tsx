import {Link} from '@tanstack/react-router';
import {MapPin,ArrowUpRight,BadgeCheck,UserRound,Search,ChevronDown} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {photos} from './data';
import type {Professional} from './marketplace.functions';
import {useState,type FormEvent} from 'react';
export function ProfessionalCard({professional:p}:{professional:Professional}) {
 const photo=p.photo_url||photos[p.photo_key];
 return <article className="professional-card"><Link to="/profissionais/$id" params={{id:p.id}} className="card-photo">{photo?<img src={photo} alt={p.display_name} loading="lazy"/>:<div className="photo-fallback"><UserRound size={60}/></div>}<span className="photo-label">{p.is_featured ? 'Destaque Premium' : p.is_verified ? 'Profissional verificado' : 'Novo na Dá Um Touch'}</span></Link><div className="card-content"><div className="card-category">{p.category}</div><Link to="/profissionais/$id" params={{id:p.id}} className="card-name">{p.display_name}{p.is_verified&&<BadgeCheck className="text-positive" size={18}/>}</Link><p className="card-specialty">{p.specialty}</p><div className="card-bottom"><span><MapPin size={14}/>{p.location}</span><Link to="/profissionais/$id" params={{id:p.id}} aria-label={`Ver perfil de ${p.display_name}`} className="profile-arrow"><ArrowUpRight size={19}/></Link></div></div></article>;
}
export function SearchBar({onSearch,initialQuery='',initialLocation=''}:{onSearch:(q:string,l:string)=>void;initialQuery?:string;initialLocation?:string}) {
 const [query,setQuery]=useState(initialQuery);const [location,setLocation]=useState(initialLocation);
 function submit(e:FormEvent){e.preventDefault();onSearch(query,location);}
 return <form onSubmit={submit} className="search-bar"><label className="search-service"><Search size={20}/><span><span className="search-label">O que procura?</span><input aria-label="Profissional ou serviço" placeholder="Profissional, serviço ou especialidade" value={query} onChange={e=>setQuery(e.target.value)}/></span></label><label className="search-location"><MapPin size={20}/><span><span className="search-label">Onde?</span><select aria-label="Localização" value={location} onChange={e=>setLocation(e.target.value)}><option value="">Todo o Moçambique</option>{['Maputo','Matola','Beira','Nampula','Tete','Quelimane','Pemba','Inhambane','Xai-Xai','Chimoio','Lichinga'].map(l=><option key={l}>{l}</option>)}</select></span><ChevronDown size={14}/></label><Button type="submit" variant="positive" className="search-submit"><Search/>Pesquisar</Button></form>;
}
