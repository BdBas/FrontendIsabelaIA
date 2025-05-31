import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Phone, Mail, MapPin, Clock, User, BookOpen, CreditCard, Award, Calendar, FileText, ExternalLink } from 'lucide-react';
import axios from 'axios';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';

// Base de conocimiento para respuestas rápidas
const knowledgeBase = {
  sedes: {
    pance: {
      direccion: "Cra. 122 No. 12 – 459, Cali, Valle del Cauca",
      extensiones: "2102 – 2104 – 2106 – 0100",
      descripcion: "Campus Principal"
    },
    melendez: {
      direccion: "Cra. 94 No. 4C – 04, Barrio Meléndez, Cali",
      extensiones: "3112 – 3116 – 3118 – 4100",
      telefono: "+57 (2) 312 0038",
      servicios: "Facultad de Ciencias Administrativas, Cartera Universidad"
    },
    centro: {
      direccion: "Cra. 5 No. 11-42, Centro, Cali",
      extensiones: "3112 – 3114 – 3116 – 3118",
      especialidad: "Programa de Derecho"
    }
  },
  inscripciones: {
    pin: "$94.000 COP",
    cuenta: "Banco de Bogotá, Cuenta Corriente N° 249.038.035",
    whatsapp: "318 4624342",
    telefonos: "310 456 1890 / 321 807 6501",
    portal: "https://inscripciones.unicatolica.edu.co/pregrado/"
  },
  fechas2025: {
    inscripciones: "21 oct 2024 - 22 nov 2024",
    matricula: "1 dic 2024",
    inicioClases: "10 feb 2025",
    finSemestre: "7 jun 2025"
  },
  becas: [
    {
      nombre: "Beca de Excelencia",
      requisito: "Promedio ≥ 4.5",
      beneficio: "30-50% de descuento"
    },
    {
      nombre: "Becas Lumen Gentium",
      requisito: "Estratos 1, 2 y 3",
      beneficio: "Descuentos especiales"
    },
    {
      nombre: "Beca de Reconocimiento a Grupos Representativos",
      requisito: "Participación en grupos culturales/deportivos",
      beneficio: "Porcentaje según convocatoria"
    }
  ]
};

const quickActions = [
  { icon: <BookOpen size={16} />, text: "Inscripciones", action: "¿Cómo me inscribo a un programa?" },
  { icon: <CreditCard size={16} />, text: "Pagos", action: "Información sobre pagos y matrícula" },
  { icon: <Award size={16} />, text: "Becas", action: "¿Qué becas están disponibles?" },
  { icon: <MapPin size={16} />, text: "Sedes", action: "¿Dónde están ubicadas las sedes?" },
  { icon: <Calendar size={16} />, text: "Fechas", action: "Calendario académico 2025" },
  { icon: <Phone size={16} />, text: "Contacto", action: "Números de contacto y horarios" }
];

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;