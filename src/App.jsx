import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Phone, Mail, MapPin, Clock, User, BookOpen, CreditCard, Award, Calendar, FileText, ExternalLink } from 'lucide-react';
import axios from 'axios';
import './App.css';

const quickActions = [
  { icon: <BookOpen size={16} />, text: "Inscripciones", action: "¿Cómo me inscribo a un programa?" },
  { icon: <CreditCard size={16} />, text: "Pagos", action: "Información sobre pagos y matrícula" },
  { icon: <Award size={16} />, text: "Becas", action: "¿Qué becas están disponibles?" },
  { icon: <MapPin size={16} />, text: "Sedes", action: "¿Dónde están ubicadas las sedes?" },
  { icon: <Calendar size={16} />, text: "Fechas", action: "Calendario académico 2025" },
  { icon: <Phone size={16} />, text: "Contacto", action: "Números de contacto y horarios" }
];

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'isabella',
      text: '¡Hola! Soy Isabella, tu asistente virtual de la Fundación Universitaria Católica Lumen Gentium - Unicatólica. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (currentMessage.trim() === '') return;

    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: currentMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.post('http://localhost:3001/api/chat', { prompt: currentMessage });
      if (response.data && response.data.content) {
        const isabellaMessage = {
          id: messages.length + 2,
          sender: 'isabella',
          text: response.data.content,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, isabellaMessage]);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Error al procesar el mensaje. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const handleQuickAction = (action) => {
    setCurrentMessage(action);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <div className="app-bg">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-avatar">
            <User size={32} />
          </div>
          <div>
            <h1 className="header-title">Isabella</h1>
            <div className="header-subtitle">Asistente Virtual - Unicatólica</div>
            <div className="header-desc">Fundación Universitaria Católica Lumen Gentium</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-container">
        {/* Chat Area */}
        <div className="chat-area">
          <div className="chat-messages">
            {error && (
              <div className="chat-error">{error}</div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message ${message.sender === 'user' ? 'chat-message-user' : 'chat-message-bot'}`}
              >
                <div className="chat-message-content">
                  <p>{message.text}</p>
                  <span className="chat-message-time">{message.timestamp}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message chat-message-bot">
                <div className="chat-message-content">
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Input */}
          <div className="chat-input-row">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu consulta sobre Unicatólica..."
              className="chat-input"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="chat-send-btn"
            >
              <Send size={20} />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="sidebar">
          {/* Quick Actions */}
          <div className="sidebar-card">
            <div className="sidebar-card-title">
              <MessageCircle size={18} className="sidebar-icon" />
              Consultas Rápidas
            </div>
            <div className="quick-actions">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action.action)}
                  className="quick-action-btn"
                >
                  {action.icon}
                  <span>{action.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="sidebar-card">
            <div className="sidebar-card-title">Contacto Directo</div>
            <div className="sidebar-contact">
              <div><Phone size={16} className="sidebar-icon" /> +57 (2) 312 0038</div>
              <div><Mail size={16} className="sidebar-icon" /> info@unicatolica.edu.co</div>
              <div><MapPin size={16} className="sidebar-icon" /> Cra. 122 No. 12-459, Cali</div>
              <div><Clock size={16} className="sidebar-icon" /> Lun-Vie: 8:00-17:30</div>
            </div>
          </div>

          {/* Useful Links */}
          <div className="sidebar-card">
            <div className="sidebar-card-title">Enlaces Útiles</div>
            <div className="sidebar-links">
              <a href="#"><ExternalLink size={14} className="sidebar-icon" /> Portal Estudiantil</a>
              <a href="#"><ExternalLink size={14} className="sidebar-icon" /> Campus Virtual</a>
              <a href="#"><ExternalLink size={14} className="sidebar-icon" /> Inscripciones</a>
              <a href="#"><ExternalLink size={14} className="sidebar-icon" /> Biblioteca Digital</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;