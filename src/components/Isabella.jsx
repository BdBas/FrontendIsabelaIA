import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Phone, Mail, MapPin, Clock, User, BookOpen, CreditCard, Award, Calendar, FileText, ExternalLink } from 'lucide-react';
import chatService from '../services/chatService';

const Isabella = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'isabella',
      text: '¡Hola! Soy Isabella, tu asistente virtual de la Fundación Universitaria Católica Lumen Gentium - Unicatólica. Estoy aquí para ayudarte con todos tus trámites y consultas académicas, desde admisiones y matrícula hasta información sobre becas y vida universitaria. Mi objetivo es hacer tu experiencia universitaria más sencilla y acompañarte en cada paso de tu formación integral.',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
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
    setError(null);

    try {
      const response = await chatService.sendMessage(currentMessage, conversationId);
      
      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      const isabellaMessage = {
        id: messages.length + 2,
        sender: 'isabella',
        text: response.response,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, isabellaMessage]);
    } catch (error) {
      setError('Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.');
      console.error('Error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const quickActions = [
    { icon: <BookOpen size={16} />, text: "Inscripciones", action: "¿Cómo me inscribo a un programa?" },
    { icon: <CreditCard size={16} />, text: "Pagos", action: "Información sobre pagos y matrícula" },
    { icon: <Award size={16} />, text: "Becas", action: "¿Qué becas están disponibles?" },
    { icon: <MapPin size={16} />, text: "Sedes", action: "¿Dónde están ubicadas las sedes?" },
    { icon: <Calendar size={16} />, text: "Fechas", action: "Calendario académico 2025" },
    { icon: <Phone size={16} />, text: "Contacto", action: "Números de contacto y horarios" }
  ];

  const handleQuickAction = (action) => {
    setCurrentMessage(action);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
              <User className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Isabella</h1>
              <p className="text-blue-600 font-medium">Asistente Virtual - Unicatólica</p>
              <p className="text-sm text-gray-600">Fundación Universitaria Católica Lumen Gentium</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 flex gap-6">
        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-line text-sm">{message.text}</p>
                  <p className={`text-xs mt-2 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-center">
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu consulta sobre Unicatólica..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={isTyping}
                className={`bg-blue-600 text-white rounded-full p-2 transition-colors ${
                  isTyping ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <MessageCircle className="mr-2 text-blue-600" size={20} />
              Consultas Rápidas
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.action)}
                  className="flex flex-col items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-center"
                >
                  <div className="text-blue-600 mb-2">{action.icon}</div>
                  <span className="text-xs font-medium text-gray-700">{action.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contacto Directo</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Phone className="text-blue-600 mr-3" size={16} />
                <span>+57 (2) 312 0038</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="text-blue-600 mr-3" size={16} />
                <span>info@unicatolica.edu.co</span>
              </div>
              <div className="flex items-start text-sm">
                <MapPin className="text-blue-600 mr-3 mt-0.5" size={16} />
                <span>Cra. 122 No. 12-459, Cali</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="text-blue-600 mr-3" size={16} />
                <span>Lun-Vie: 8:00-17:30</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Enlaces Útiles</h3>
            <div className="space-y-2">
              <a href="#" className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                <ExternalLink size={14} className="mr-2" />
                Portal Estudiantil
              </a>
              <a href="#" className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                <ExternalLink size={14} className="mr-2" />
                Campus Virtual
              </a>
              <a href="#" className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                <ExternalLink size={14} className="mr-2" />
                Inscripciones
              </a>
              <a href="#" className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                <ExternalLink size={14} className="mr-2" />
                Biblioteca Digital
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Isabella; 