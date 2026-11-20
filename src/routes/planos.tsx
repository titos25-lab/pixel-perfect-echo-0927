import { createFileRoute, Link } from '@tanstack/react-router';
import { Check, ArrowRight, Sparkles, Smartphone, Copy, ShieldCheck, Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { plans, money } from '@/features/marketplace/data';

export const Route = createFileRoute('/planos')({
  head: () => ({
    meta: [
      { title: 'Planos mensais para profissionais — LigaPro MZ' },
      { name: 'description', content: 'Compare os planos mensais da LigaPro MZ para profissionais e empresas moçambicanas, a partir de 150 MT.' },
      { property: 'og:title', content: 'Planos mensais LigaPro MZ' },
      { property: 'og:description', content: 'Mais visibilidade, ferramentas e oportunidades para o seu negócio.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: Plans,
});

function Plans() {
  const copyNumber = () => {
    void navigator.clipboard?.writeText('875414048');
  };

  return (
    <div className="container section">
      <div className="page-title">
        <div className="eyebrow">CRESÇA COM A LIGAPRO MZ</div>
        <h1>O plano certo para fazer crescer o seu negócio.</h1>
        <p>Comece gratuitamente e escolha um plano mensal quando quiser mais ferramentas, visibilidade e oportunidades.</p>
      </div>

      <div className="plan-grid">
        {plans.map((plan) => {
          const featured = plan.name === 'Premium';
          return (
            <article key={plan.name} className={`plan-card ${featured ? 'featured' : ''}`}>
              {featured && <div className="eyebrow"><Sparkles size={14} /> MAIS VISIBILIDADE</div>}
              <h2>{plan.name}</h2>
              <div className="plan-price">
                {money(plan.price)}
                <span>{plan.price === 0 ? 'Sem mensalidade' : 'por mês · cobrança mensal'}</span>
              </div>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}><Check size={14} />{feature}</li>
                ))}
              </ul>
              <Button variant={featured || plan.price === 0 ? 'positive' : 'outline'} asChild className="w-full">
                <Link to="/auth" search={{ modo: 'registo', tipo: 'professional' }}>
                  {plan.price === 0 ? 'Criar perfil gratuito' : 'Criar conta para solicitar'}
                  <ArrowRight />
                </Link>
              </Button>
            </article>
          );
        })}
      </div>

      <section className="notice mt-8">
        <div className="flex items-center gap-2 font-semibold"><Smartphone size={19} /> Pagamento por eMola</div>
        <p className="mt-2">Para pagar um plano mensal, faça uma transferência ou depósito eMola com os seguintes dados:</p>
        <div className="my-4 rounded-lg border bg-background p-4">
          <div className="text-sm text-muted-foreground">Número eMola</div>
          <div className="flex items-center justify-between gap-3">
            <strong className="text-xl tracking-wide">875 414 048</strong>
            <Button type="button" variant="outline" size="sm" onClick={copyNumber}><Copy size={15}/> Copiar</Button>
          </div>
          <div className="mt-3 text-sm text-muted-foreground">Nome do titular</div>
          <strong>Titos José Cossa</strong>
        </div>
        <ol className="ml-5 list-decimal space-y-1 text-sm">
          <li>Escolha o plano pretendido e crie a sua conta profissional.</li>
          <li>Envie o valor correspondente ao número eMola indicado.</li>
          <li>Guarde o comprovativo e a referência/ID da transacção.</li>
          <li>Envie o comprovativo à equipa LigaPro MZ para validação, indicando o seu nome e o plano escolhido.</li>
        </ol>
        <p className="mt-3 text-sm"><strong>Importante:</strong> a subscrição será activada apenas depois da confirmação do pagamento. Não envie PIN, palavra-passe ou código de segurança eMola a ninguém.</p>
      </section>

      <div className="notice mt-4">
        <div className="flex items-center gap-2 font-semibold"><ShieldCheck size={18}/> Activação e renovação</div>
        <p className="mt-1">Os preços são mensais. Nesta fase, a validação e a activação são manuais; não existem cobranças automáticas nem renovação automática. A equipa confirma o pagamento antes de activar o plano.</p>
      </div>
      <div className="mt-6 flex items-start gap-3 text-sm text-muted-foreground">
        <Clock3 size={18} className="mt-0.5 shrink-0"/>
        <p>Pode começar com o perfil gratuito e solicitar a mudança de plano posteriormente. Os planos pagos destinam-se a profissionais e empresas registados na plataforma.</p>
      </div>
    </div>
  );
}
