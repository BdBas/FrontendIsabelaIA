import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Phone, Mail, MapPin, Clock, User, BookOpen, CreditCard, Award, Calendar, FileText, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Chat.css';

// Eliminar la base de conocimiento local y la función processUserMessage,
// ya que la lógica se manejará en el backend.
// const knowledgeBase = { ... }; // ELIMINAR
// const processUserMessage = (message) => { ... }; // ELIMINAR

const quickActions = [
  { id: 'inscripciones', icon: <BookOpen size={16} />, text: "Inscripciones", action: "¿Cómo me inscribo a un programa?" },
  { id: 'pagos', icon: <CreditCard size={16} />, text: "Pagos", action: "Información sobre pagos y matrícula" },
  { id: 'becas', icon: <Award size={16} />, text: "Becas", action: "¿Qué becas están disponibles?" },
  { id: 'sedes', icon: <MapPin size={16} />, text: "Sedes", action: "¿Dónde están ubicadas las sedes?" },
  { id: 'fechas', icon: <Calendar size={16} />, text: "Fechas", action: "Calendario académico 2025" },
  { id: 'contacto', icon: <Phone size={16} />, text: "Contacto", action: "Números de contacto y horarios" }
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Chat = () => {
  const [messages, setMessages] = useState([]); // Inicializar con array vacío para cargar del backend
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const { user, logout } = useAuth();

  // Efecto para cargar la conversación al montar el componente
  useEffect(() => {
    const loadConversation = async () => {
      try {
        const response = await axios.get(`${API_URL}/chat/conversation`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.data && response.data.messages && response.data.messages.length > 0) {
          // Procesar los mensajes para asegurar que tengan toda la información necesaria
          const processedMessages = response.data.messages.map(msg => ({
            ...msg,
            id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: msg.timestamp || new Date().toLocaleTimeString(),
            metadata: msg.metadata || {},
            type: msg.type || 'text',
            status: msg.status || 'sent'
          }));
          setMessages(processedMessages);
        } else {
          // Mensaje de bienvenida inicial con metadata
          setMessages([
            {
              id: `welcome-${Date.now()}`,
              sender: 'isabella',
              text: '¡Hola! Soy Isabella, tu asistente virtual de la Fundación Universitaria Católica Lumen Gentium - Unicatólica. ¿En qué puedo ayudarte hoy?',
              timestamp: new Date().toLocaleTimeString(),
              type: 'welcome',
              metadata: {
                version: '1.0',
                sessionId: Date.now(),
                features: ['chat', 'quick_actions', 'file_sharing']
              }
            }
          ]);
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
        setError('Error al cargar la conversación.');
        setMessages([
          {
            id: `error-${Date.now()}`,
            sender: 'isabella',
            text: '¡Hola! Soy Isabella, tu asistente virtual de la Fundación Universitaria Católica Lumen Gentium - Unicatólica. ¿En qué puedo ayudarte hoy?',
            timestamp: new Date().toLocaleTimeString(),
            type: 'welcome',
            metadata: {
              version: '1.0',
              sessionId: Date.now(),
              features: ['chat', 'quick_actions', 'file_sharing']
            }
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadConversation();
    }
  }, [user]);

  // Efecto para hacer scroll al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollBy({
      top: messagesEndRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages]);

  const handleSendMessage = async () => {
    if (currentMessage.trim() === '') return;

    const userMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender: 'user',
      text: currentMessage,
      timestamp: new Date().toLocaleTimeString(),
      type: 'text',
      metadata: {
        userId: user?.id,
        sessionId: Date.now(),
        platform: 'web'
      },
      status: 'sending'
    };

    // Añadir el mensaje del usuario inmediatamente a la UI
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/chat/message`,
        { 
          message: userMessage.text,
          metadata: userMessage.metadata
        },
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      // Actualizar el estado del mensaje del usuario
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, status: 'sent' }
          : msg
      ));

      // Procesar la respuesta de Isabella
      const aiResponse = response.data;
      const isabellaMessage = {
        id: `isabella-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sender: 'isabella',
        text: aiResponse.response,
        timestamp: new Date().toLocaleTimeString(),
        type: aiResponse.type || 'text',
        metadata: {
          ...aiResponse.metadata,
          confidence: aiResponse.confidence,
          sources: aiResponse.sources,
          suggestedActions: aiResponse.suggestedActions
        },
        status: 'sent'
      };
      
      setMessages(prev => [...prev, isabellaMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.response?.data?.message || 'Error al enviar el mensaje.');
      
      // Actualizar el estado del mensaje del usuario a error
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, status: 'error' }
          : msg
      ));
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
    // Delay slightly before sending to allow state update
    setTimeout(() => handleSendMessage(), 50);
  };

  // Show loading state while conversation history is being loaded
  if (isLoading && messages.length <= 1) {
       return (
        <div className="app-bg">
          <header className="header">
              <div key="header-content" className="header-content">
                  <div key="avatar" className="header-avatar">
                      <User size={32} />
                  </div>
                  <div key="title-container">
                      <h1 className="header-title">Isabella</h1>
                      <div className="header-subtitle">Cargando chat...</div>
                      <div className="header-desc">Estableciendo conexión segura</div>
                  </div>
                  <button key="loading-button" className="logout-button" disabled>Cargando...</button>
              </div>
          </header>
           <div key="loading-container" className="main-container" style={{justifyContent: 'center', alignItems: 'center'}}>
              <div>Cargando historial de conversación...</div>
           </div>
        </div>
      );
  }

  return (
    <div className="app-bg">
      <header className="header">
        <div key="header-content" className="header-content">
          <div key="avatar" className="header-avatar">
            <User size={32} />
          </div>
          <div key="title-container">
            <h1 className="header-title">Isabella</h1>
            <div className="header-subtitle">Asistente Virtual - Unicatólica</div>
            <div className="header-desc">Fundación Universitaria Católica Lumen Gentium</div>
          </div>
          <button key="logout-button" onClick={logout} className="logout-button">
            Cerrar Sesión
          </button>
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
                key={`message-${message.id}`}
                className={`chat-message ${message.sender === 'user' ? 'chat-message-user' : 'chat-message-bot'}`}
              >
                <div className="chat-message-content">
                  <p>{message.text}</p>
                  {message.timestamp && (
                    <span key={`timestamp-${message.id}`} className="chat-message-time">{message.timestamp}</span>
                  )}
                  {message.metadata?.sources && (
                    <div key={`sources-${message.id}`} className="message-sources">
                      <small>Fuentes: {message.metadata.sources.join(', ')}</small>
                    </div>
                  )}
                  {message.metadata?.confidence && (
                    <div key={`confidence-${message.id}`} className="message-confidence">
                      <small>Confianza: {message.metadata.confidence}%</small>
                    </div>
                  )}
                  {message.status === 'error' && (
                    <div key={`error-${message.id}`} className="message-error">
                      <small>Error al enviar el mensaje</small>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div key="typing-indicator" className="chat-message chat-message-bot">
                <div className="chat-message-content">
                  <div className="typing-indicator">
                    <span key="dot1"></span><span key="dot2"></span><span key="dot3"></span>
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
              placeholder="Escribe tu consulta sobre Unicatolica..."
              className="chat-input"
              disabled={isLoading} // Deshabilitar input mientras carga respuesta
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || currentMessage.trim() === ''} // Deshabilitar si carga o mensaje vacío
              className="chat-send-btn"
            >
              {isLoading ? '' : <Send size={20} />} {/* Icono de envío o vacío si carga */}
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
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.action)}
                  className="quick-action-btn"
                  disabled={isLoading}
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
              <div key="phone"><Phone size={16} className="sidebar-icon" /> +57 (2) 312 0038</div>
              <div key="email"><Mail size={16} className="sidebar-icon" /> info@unicatolica.edu.co</div>
              <div key="address"><MapPin size={16} className="sidebar-icon" /> Cra. 122 No. 12-459, Cali</div>
              <div key="hours"><Clock size={16} className="sidebar-icon" /> Lun-Vie: 8:00-17:30</div>
            </div>
          </div>

          {/* Useful Links */}
          <div className="sidebar-card">
            <div className="sidebar-card-title">Enlaces Útiles</div>
            <div className="sidebar-links">
              <a key="portal" href="https://www.unicatolica.edu.co/estudiantes/" target="_blank" rel="noopener noreferrer"><ExternalLink size={14} className="sidebar-icon" /> Portal Estudiantil</a>
              <a key="campus" href="https://apps.unicatolica.edu.co/estudiantes/" target="_blank" rel="noopener noreferrer"><ExternalLink size={14} className="sidebar-icon" /> Campus Virtual</a>
              <a key="inscripciones" href="https://inscripciones.unicatolica.edu.co/" target="_blank" rel="noopener noreferrer"><ExternalLink size={14} className="sidebar-icon" /> Inscripciones</a>
              <a key="biblioteca" href="https://www.unicatolica.edu.co/biblioteca/" target="_blank" rel="noopener noreferrer"><ExternalLink size={14} className="sidebar-icon" /> Biblioteca Digital</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Chat; 