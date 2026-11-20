import { createFileRoute, Link } from '@tanstack/react-router';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
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

      <div className="notice">
        <strong>Como funciona a adesão:</strong> os preços apresentados são mensais. Nesta fase, a solicitação e a confirmação do pagamento são feitas manualmente pela equipa LigaPro MZ. A subscrição só é activada depois da validação do pagamento. Ainda não existem cobranças automáticas nem renovação automática.
      </div>
      <p className="text-sm text-muted-foreground">Pode começar com o perfil gratuito e solicitar a mudança de plano posteriormente. Os planos pagos destinam-se a profissionais e empresas registados na plataforma.</p>
    </div>
  );
}