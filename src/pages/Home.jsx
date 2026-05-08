import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Activity, Bike, TrendingUp, Heart } from 'lucide-react'
import Scene3D from '../components/Scene3D'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient"></div>
          <div className="hero-particles"></div>
        </div>
        
        <div className="hero-container">
          <div className="hero-content">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="hero-badge">
                <TrendingUp size={14} />
                O futuro do seu desempenho
              </span>
            </motion.div>

            <motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              VIVA<span className="title-accent">MAIS</span>
              <br />
              <span className="title-sub">DOE SEU CORPO</span>
            </motion.h1>

            <motion.p
              className="hero-subtitle"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              A plataforma completa para corredores e ciclistas. 
              Treinos personalizados, análise de desempenho e comunidade 
              que te impulsiona além dos limites.
            </motion.p>

            <motion.div
              className="hero-ctas"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link to="/contato" className="btn btn-primary">
                Começar Agora
                <ArrowRight size={18} />
              </Link>
              <Link to="/funcionalidades" className="btn btn-secondary">
                Ver Funcionalidades
              </Link>
            </motion.div>

            <motion.div
              className="hero-stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Atletas</span>
              </div>
              <div className="stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">Treinos</span>
              </div>
              <div className="stat">
                <span className="stat-number">98%</span>
                <span className="stat-label">Satisfação</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="hero-3d"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <Scene3D />
          </motion.div>
        </div>

        <div className="scroll-indicator">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="scroll-mouse">
              <div className="scroll-wheel"></div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="features-preview section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            FEITO PARA ATLETAS
          </motion.h2>
          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Recursos pensados para quem leva o esporte a sério
          </motion.p>

          <div className="features-grid">
            {[
              { icon: Activity, title: 'Corrida', desc: 'Planos de treino personalizados para todos os níveis' },
              { icon: Bike, title: 'Ciclismo', desc: 'Treinos estruturados e análise de pedaladas' },
              { icon: Heart, title: 'Saúde', desc: 'Monitoramento de FC, sono e recuperação' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="feature-card glass-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <feature.icon className="feature-icon" />
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <motion.div
            className="cta-box"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2>PRONTO PARA TRANSFORMAR SEU DESEMPENHO?</h2>
            <p>Junte-se a milhares de atletas que já usam o Viva Mais</p>
            <Link to="/contato" className="btn btn-primary">
              Começar Gratuitamente
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
