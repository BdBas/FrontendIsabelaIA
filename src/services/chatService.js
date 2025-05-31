import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const chatService = {
  // Enviar mensaje y obtener respuesta
  async sendMessage(message, conversationId = null) {
    try {
      const response = await axios.post(`${API_URL}/generate-questions`, { category: message });
      return response.data;
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      throw error;
    }
  },

  // Obtener una conversación específica
  async getConversation(conversationId) {
    try {
      const response = await axios.get(`${API_URL}/results`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener conversación:', error);
      throw error;
    }
  }
};

export default chatService; 