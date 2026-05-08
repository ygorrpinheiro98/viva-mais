import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import './Planos.css'

const plans = [
  {
    name: 'Iniciante',
    price: 'Grátis',
    period: '',
    description: 'Perfeito para quem está começando',
    features: [
      'Acesso a 20+ treinos',
      'Rastreador básico',
      'Calendário de treino',
      'Estatísticas simples',
      'Comunidade básica'
    ],
    popular: false,
    cta: 'Começar Grátis'
  },
  {
    name: 'Atleta',
    price: 'R$ 49',
    period: '/mês',
    description: 'Para atletas que querem evoluir',
    features: [
      'Todos os treinos ilimitados',
      'Análise avançada',
      'Planos personalizados',
      'Sincronização com dispositivos',
      'Metas e conquistas',
      'Relatórios detalhados',
      'Suporte prioritário'
    ],
    popular: true,
    cta: 'Escolher Plano'
  },
  {
    name: 'Pro',
    price: 'R$ 99',
    period: '/mês',
    description: 'Para profissionais e técnicos',
    features: [
      'Tudo do plano Atleta',
      'IA preditiva',
      'Análise de kelompok',
      'Ferramentas de técnico',
      'Relatórios ilimitados',
      'API de acesso',
      'Consultoria mensal',
      'Badge premium'
    ],
    popular: false,
    cta: 'Falar com Consultor'
  }
]

function Planos() {
  return (
    <div className="planos">
      <section className="page-hero">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            PLANOS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Escolha o plano ideal para seus objetivos
          </motion.p>
        </div>
      </section>

      <section className="plans-section section">
        <div className="container">
          <div className="plans-grid">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                className={`plan-card glass-card ${plan.popular ? 'popular' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                {plan.popular && (
                  <div className="popular-badge">
                    <Sparkles size={14} />
                    Mais Popular
                  </div>
                )}
                
                <h3>{plan.name}</h3>
                <div className="plan-price">
                  <span className="price">{plan.price}</span>
                  <span className="period">{plan.period}</span>
                </div>
                <p className="plan-desc">{plan.description}</p>
                
                <ul className="plan-features">
                  {plan.features.map((feature, j) => (
                    <li key={j}>
                      <Check size={16} className="check-icon" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            PERGUNTAS FREQUENTES
          </motion.h2>
          
          <div className="faq-grid">
            {[
              { q: 'Posso cancelar a qualquer momento?', a: 'Sim! Você pode cancelar sua assinatura quando quiser, sem taxas adicionais.' },
              { q: 'Como funciona o período de teste?', a: 'Oferecemos 7 dias gratis no plano Atleta para você experimentar todos os recursos.' },
              { q: 'Posso mudar de plano depois?', a: 'Absolutely! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.' },
              { q: 'Quais dispositivos são suportados?', a: 'Funciona no Android, iOS, web e sincroniza com Garmin, Wahoo, Apple Watch e mais.' }
            ].map((faq, i) => (
              <motion.div
                key={i}
                className="faq-item glass-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <h4>{faq.q}</h4>
                <p>{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Planos
