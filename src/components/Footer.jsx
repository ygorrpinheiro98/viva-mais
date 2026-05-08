import { Link } from 'react-router-dom'
import { Zap, Instagram, Twitter, Youtube, Facebook } from 'lucide-react'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <Zap className="logo-icon" />
              <span>VIVA<span className="logo-accent">MAIS</span></span>
            </Link>
            <p className="footer-desc">
              Potencialize seus treinos de corrida e ciclismo com tecnologia de ponta. 
              Transforme seus objetivos em resultados reais.
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <h4>Navegação</h4>
              <Link to="/">Home</Link>
              <Link to="/funcionalidades">Funcionalidades</Link>
              <Link to="/planos">Planos</Link>
              <Link to="/contato">Contato</Link>
            </div>

            <div className="footer-col">
              <h4>Esportes</h4>
              <a href="#">Corrida</a>
              <a href="#">Ciclismo</a>
              <a href="#">Triathlon</a>
              <a href="#">Trail</a>
            </div>

            <div className="footer-col">
              <h4>Legal</h4>
              <a href="#">Termos de Uso</a>
              <a href="#">Privacidade</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 Viva Mais. Todos os direitos reservados.</p>
          <div className="footer-social">
            <a href="#"><Instagram size={20} /></a>
            <a href="#"><Twitter size={20} /></a>
            <a href="#"><Youtube size={20} /></a>
            <a href="#"><Facebook size={20} /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
