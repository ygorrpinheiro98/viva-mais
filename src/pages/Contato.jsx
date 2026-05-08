import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Mail, MapPin, Phone, CheckCircle } from 'lucide-react'
import './Contato.css'

function Contato() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    mensagem: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.nome && formData.email && formData.mensagem) {
      setSubmitted(true)
    }
  }

  return (
    <div className="contato">
      <section className="page-hero">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            FALE CONOSCO
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Tem dúvidas? Estamos aqui para ajudar
          </motion.p>
        </div>
      </section>

      <section className="contact-section section">
        <div className="container">
          <div className="contact-grid">
            <motion.div
              className="contact-info"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2>ENTRE EM CONTATO</h2>
              <p>
                Tem alguma dúvida sobre o Viva Mais? Quer saber mais sobre 
                nossos planos ou agendar uma demonstração? Preencha o formulário 
                ou nos contate diretamente.
              </p>

              <div className="contact-details">
                <div className="contact-item">
                  <Mail className="contact-icon" />
                  <div>
                    <span>Email</span>
                    <p>contato@vivamais.com.br</p>
                  </div>
                </div>
                <div className="contact-item">
                  <Phone className="contact-icon" />
                  <div>
                    <span>Telefone</span>
                    <p>(11) 99999-9999</p>
                  </div>
                </div>
                <div className="contact-item">
                  <MapPin className="contact-icon" />
                  <div>
                    <span>Endereço</span>
                    <p>São Paulo, SP - Brasil</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="contact-form-wrapper glass-card"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {submitted ? (
                <div className="success-message">
                  <CheckCircle size={48} className="success-icon" />
                  <h3>Mensagem Enviada!</h3>
                  <p>Obrigado pelo contato. Retornaremos em breve.</p>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setSubmitted(false)}
                  >
                    Enviar outra mensagem
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3>Envie uma mensagem</h3>
                  
                  <div className="form-group">
                    <label htmlFor="nome">Nome</label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="mensagem">Mensagem</label>
                    <textarea
                      id="mensagem"
                      name="mensagem"
                      value={formData.mensagem}
                      onChange={handleChange}
                      placeholder="Sua mensagem..."
                      rows="5"
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary">
                    <Send size={18} />
                    Enviar Mensagem
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contato
