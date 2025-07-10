import React, { useEffect, useRef, useState } from 'react';
import { sendUserMessage } from '@/lib/firebase/support';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  MessageSquare,
  Phone,
  Mail,
  Clock,
  Send,
  HelpCircle,
  Search
} from 'lucide-react';
import { db } from '@/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  setDoc
} from 'firebase/firestore';

interface ChatMessage {
  sender: 'user' | 'admin';
  text: string;
  timestamp: any;
}

const Support = () => {
  const { user, isAuthenticated } = useAuth();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatActive, setIsChatActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const markAdminMessagesAsRead = async () => {
    if (!user) return;

    const q = query(collection(db, 'supportMessages'), where('userId', '==', user.id));
    const snapshot = await onSnapshot(q, () => {}); // fuerza lectura directa

    snapshot(); // nos da la función para desuscribir, pero lo usamos solo para ejecutar la lectura
    const doc = (await getDocs(q)).docs[0];

    if (!doc) return;

    const data = doc.data();
    const messages = data.messages || [];

    const updatedMessages = messages.map((msg: any) => {
      if (msg.sender === 'admin' && !msg.read) {
        return { ...msg, read: true };
      }
      return msg;
    });

    await setDoc(doc.ref, { ...data, messages: updatedMessages });
  };

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'supportMessages'), where('userId', '==', user.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs[0]?.data();
      if (data?.messages) {
        setChatMessages(data.messages);
      } else {
        setChatMessages([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleStartChat = async () => {
    setIsChatActive(true);
    await markAdminMessagesAsRead(); // marcar como leídos al iniciar
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleString();
  };


  const faqs = [
    {
      question: '¿Cuánto tiempo tarda la entrega?',
      answer: 'El tiempo de entrega varía entre 20-45 minutos dependiendo del restaurante y tu ubicación.'
    },
    {
      question: '¿Cómo puedo rastrear mi pedido?',
      answer: 'Una vez realizado el pedido, puedes rastrearlo en tiempo real desde la sección "Mis Pedidos".'
    },
    {
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos tarjetas de crédito, débito, PayPal y pagos en efectivo al momento de la entrega.'
    },
    {
      question: '¿Puedo cancelar mi pedido?',
      answer: 'Puedes cancelar tu pedido sin costo hasta 5 minutos después de realizarlo.'
    },
    {
      question: '¿Hay costo de envío?',
      answer: 'El costo de envío varía entre $2.99 - $4.99 dependiendo de la distancia y el restaurante.'
    },
    {
      question: '¿Qué hago si mi pedido llega incorrecto?',
      answer: 'Contacta inmediatamente a soporte a través del chat o teléfono para resolver el problema.'
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    try {
      await sendUserMessage(user.id, user.name, user.email, newMessage.trim());
      toast.success('Mensaje enviado al equipo de soporte');
      setNewMessage('');
    } catch (error) {
      toast.error('Error al enviar el mensaje');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Centro de Ayuda</h1>
          <p className="text-xl text-gray-600">
            Estamos aquí para ayudarte. Encuentra respuestas rápidas o contacta con nuestro equipo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Chat Card */}
          <Card className="text-center card-hover">
            <CardContent className="p-6">
              <MessageSquare className="mx-auto h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chat en Vivo</h3>
              <p className="text-gray-600 mb-4">Chatea con nuestro equipo de soporte</p>
              <Button onClick={handleStartChat} className="btn-primary w-full">
                Iniciar Chat
              </Button>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">En línea</span>
              </div>
            </CardContent>
          </Card>

          {/* Teléfono Card */}
          <Card className="text-center card-hover">
            <CardContent className="p-6">
              <Phone className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Teléfono</h3>
              <p className="text-gray-600 mb-4">Llámanos para ayuda inmediata</p>
              <Button variant="outline" className="w-full mb-2">
                <Phone size={16} className="mr-2" />
                +1 (555) 123-4567
              </Button>
              <div className="flex items-center justify-center gap-2">
                <Clock size={14} />
                <span className="text-sm text-gray-500">24/7 disponible</span>
              </div>
            </CardContent>
          </Card>

          {/* Email Card */}
          <Card className="text-center card-hover">
            <CardContent className="p-6">
              <Mail className="mx-auto h-12 w-12 text-purple-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Email</h3>
              <p className="text-gray-600 mb-4">Envíanos un email detallado</p>
              <Button variant="outline" className="w-full mb-2">
                <Mail size={16} className="mr-2" />
                soporte@fooddelivery.com
              </Button>
              <div className="flex items-center justify-center gap-2">
                <Clock size={14} />
                <span className="text-sm text-gray-500">Respuesta en 2-4 horas</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preguntas Frecuentes */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Preguntas Frecuentes
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    placeholder="Buscar en las preguntas frecuentes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFaqs.map((faq, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <h4 className="font-semibold mb-2">{faq.question}</h4>
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                  {filteredFaqs.length === 0 && (
                    <div className="text-center py-8">
                      <HelpCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600">No se encontraron preguntas que coincidan con tu búsqueda</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat de Soporte */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat de Soporte
                </CardTitle>
                <Badge className="bg-green-100 text-green-800">En línea</Badge>
              </CardHeader>
              <CardContent>
                {!isChatActive ? (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">
                      {isAuthenticated
                        ? 'Haz clic para iniciar una conversación con nuestro equipo de soporte'
                        : 'Inicia sesión para usar el chat de soporte'}
                    </p>
                    <Button onClick={handleStartChat} className="btn-primary" disabled={!isAuthenticated}>
                      Iniciar Chat
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="h-64 overflow-y-auto border rounded-lg p-4 mb-4 space-y-3">
                      {chatMessages.map((message, index) => (
                        <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-xs rounded-lg p-3 ${
                              message.sender === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                            <span className="text-xs opacity-70 block mt-1">
                              {formatDate(message.timestamp)}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Escribe tu mensaje..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button onClick={handleSendMessage} className="btn-primary" disabled={!newMessage.trim()}>
                        <Send size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Acciones Rápidas */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Reportar un problema con mi pedido
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Cambiar información de mi cuenta
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Información sobre reembolsos
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Cómo funciona la app
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
