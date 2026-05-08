import { motion } from 'framer-motion'
import { 
  Activity, Bike, Heart, BarChart3, Calendar, Users, 
  MapPin, Trophy, Shield, Zap, Brain, Cloud
} from 'lucide-react'
import './Funcionalidades.css'

const features = [
  {
    icon: Activity,
    title: 'Treinos de Corrida',
    desc: 'Planos personalizados baseados no seu nível, objetivos e disponibilidade. Desde iniciantes até maratonistas.',
    category: 'running'
  },
  {
    icon: Bike,
    title: 'Treinos de Ciclismo',
    desc: 'Estruturação de treino por zonas de potência, cadência e frequência cardíaca. Suporta Garmin, Wahoo e mais.',
    category: 'cycling'
  },
  {
    icon: Heart,
    title: 'Monitoramento Cardiaco',
    desc: 'Acompanhe sua frequência cardíaca em tempo real e analise zonas de treino para otimizar recuperação.',
    category: 'health'
  },
  {
    icon: BarChart3,
    title: 'Análise Avançada',
    desc: 'Gráficos detalhados de desempenho, tendências, prognósticos de prova e comparativo com outros atletas.',
    category: 'analytics'
  },
  {
    icon: Calendar,
    title: 'Calendário Inteligente',
    desc: 'Organize sua semana de treino com sugestões automáticas baseadas na sua carga de treinamento.',
    category: 'planning'
  },
  {
    icon: Users,
    title: 'Comunidade',
    desc: 'Desafios entre atletas, grupos de treino, chat e acompanhamento de amigos e técnicos.',
    category: 'social'
  },
  {
    icon: MapPin,
    title: 'Rotas e GPS',
    desc: 'Importer rotas do Strava, Garmin Connect ou criar novas. Análise de altimetria e distância.',
    category: 'tracking'
  },
  {
    icon: Trophy,
    title: 'Metas e Conquitas',
    desc: 'Defina objetivos pessoais e acompanhe badges e conquistas conforme você evolui.',
    category: 'motivation'
  },
  {
    icon: Shield,
    title: 'Prevenção de Lesões',
    desc: 'Alertas de sobrecarga, sugestões de recuperação e exercícios preventivos baseados em seu histórico.',
    category: 'health'
  },
  {
    icon: Zap,
    title: 'Treinos Intervalados',
    desc: 'Crie e execute treinos intervalados com áudio-guia e alertas automáticos durante o exercício.',
    category: 'training'
  },
  {
    icon: Brain,
    title: 'IA Preditiva',
    desc: 'Nossa inteligência artificial analiza seus dados e sugere ajustes no treino para melhores resultados.',
    category: 'ai'
  },
  {
    icon: Cloud,
    title: 'Sincronização na Nuvem',
    desc: 'Seus dados sempre seguros e disponíveis. Sincronização automática com principais plataformas.',
    category: 'tech'
  }
]

function Funcionalidades() {
  return (
    <div className="funcionalidades">
      <section className="page-hero">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            FUNCIONALIDADES
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Tudo que você precisa para alcanzar seus objetivos
          </motion.p>
        </div>
      </section>

      <section className="features-section section">
        <div className="container">
          <div className="features-grid-full">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="feature-card-full glass-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="feature-icon-wrapper">
                  <feature.icon className="feature-icon" />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
                <span className="feature-category">{feature.category}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="integration-section">
        <div className="container">
          <motion.div
            className="integration-box"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>INTEGRAÇÕES</h2>
            <p>Conecte seus dispositivos e apps favoritos</p>
            <div className="integrations-list">
              {['Garmin', 'Wahoo', 'Strava', 'Polar', 'Coros', 'Apple Watch', 'Fitbit', 'Nike Run Club'].map((app, i) => (
                <div key={i} className="integration-item">{app}</div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Funcionalidades
