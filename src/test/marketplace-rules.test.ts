import {describe,it,expect} from 'vitest';
import {plans,categories,normalize} from '@/features/marketplace/data';
describe('LigaPro marketplace rules',()=>{
 it.each([['Gratuito',0],['Basic',150],['Professional',350],['Premium',750],['Business',1500]])('%s has the specified monthly price',(name,price)=>{expect(plans.find(p=>p.name===name)?.price).toBe(price);});
 it('offers the 15 specified service categories',()=>{expect(categories).toHaveLength(15);expect(categories.some(c=>c.name==='Saúde e bem-estar')).toBe(true);expect(categories.some(c=>c.name==='Outros serviços')).toBe(true);});
 it('matches Portuguese specialties regardless of accents',()=>{expect(normalize('Psicologia e aconselhamento').includes(normalize('psicologia'))).toBe(true);expect(normalize('Saúde').includes(normalize('saude'))).toBe(true);expect(normalize('Fotografia').includes(normalize('saude'))).toBe(false);});
});
