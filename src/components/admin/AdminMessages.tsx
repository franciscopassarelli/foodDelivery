import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { MessageSquare, Reply, Clock } from 'lucide-react';
import { toast } from 'sonner';
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  orderBy,
  query
} from 'firebase/firestore';
import { db } from '@/firebase';

interface ChatMsg {
  sender: 'user' | 'admin';
  text: string;
  timestamp: any;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  messages: ChatMsg[];
  status: 'new' | 'replied' | 'closed';
  createdAt: any;
}

export const AdminMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll al fondo cuando cambia el mensaje seleccionado
  useEffect(() => {
    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [selectedMessage?.messages]);

  useEffect(() => {
    const q = query(collection(db, 'supportMessages'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !replyText.trim()) return;

    const reply = {
      sender: 'admin',
      text: replyText,
      timestamp: new Date()
    };

    try {
      const ref = doc(db, 'supportMessages', selectedMessage.id);
      await updateDoc(ref, {
        messages: [...(selectedMessage.messages || []), reply],
        status: 'replied'
      });

      setReplyText('');
      setIsReplyDialogOpen(false);
      setSelectedMessage(null);
      toast.success('Respuesta enviada correctamente');
    } catch (error) {
      console.error(error);
      toast.error('Error al enviar la respuesta');
    }
  };

  const getStatusBadge = (status: Message['status']) => {
    const styles = {
      new: 'bg-red-100 text-red-800',
      replied: 'bg-blue-100 text-blue-800',
      closed: 'bg-green-100 text-green-800'
    };
    const labels = {
      new: 'Nuevo',
      replied: 'Respondido',
      closed: 'Cerrado'
    };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mensajería</h1>
        <p className="text-gray-600">Gestiona los mensajes de tus clientes</p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['new', 'replied', 'closed'].map((status) => (
          <Card key={status}>
            <CardContent className="p-4 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                status === 'new' ? 'bg-red-100 text-red-600' :
                status === 'replied' ? 'bg-blue-100 text-blue-600' :
                'bg-green-100 text-green-600'
              }`}>
                {status === 'new' ? <MessageSquare className="h-4 w-4" /> :
                 status === 'replied' ? <Reply className="h-4 w-4" /> :
                 <Clock className="h-4 w-4" />}
              </div>
              <div>
                <p className="text-sm text-gray-600 capitalize">{status}</p>
                <p className="text-xl font-bold">
                  {messages.filter(m => m.status === status).length}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista de Mensajes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lista de usuarios */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {messages.map((message) => {
                const lastMsg = message.messages?.slice(-1)[0];
                const isNew = message.status === 'new' && selectedMessage?.id !== message.id;

                return (
                  <div
                    key={message.id}
                    className={`p-3 rounded border cursor-pointer ${
                      selectedMessage?.id === message.id
                        ? 'bg-blue-100 border-blue-400'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setSelectedMessage(message);
                      setIsReplyDialogOpen(true);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-sm">{message.userName}</h4>
                        <p className="text-xs text-gray-600">{lastMsg?.text.slice(0, 30)}...</p>
                      </div>
                      {isNew && <Badge variant="default">Nuevo</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Panel de conversación */}
        {selectedMessage && (
          <Card className="relative">
            <CardHeader>
              <CardTitle>Chat con {selectedMessage.userName}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="h-80 overflow-y-auto px-2 border rounded p-2 space-y-3 bg-gray-50">
                {selectedMessage.messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs p-2 rounded-lg text-sm ${
                      msg.sender === 'admin' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                    }`}>
                      <p>{msg.text}</p>
                      <span className="block text-[10px] opacity-70 mt-1">
                        {msg.timestamp?.seconds
                          ? new Date(msg.timestamp.seconds * 1000).toLocaleString()
                          : new Date(msg.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messageEndRef} />
              </div>

              <form onSubmit={handleReply} className="flex flex-col gap-3">
                <Textarea
                  placeholder="Escribe tu respuesta..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setSelectedMessage(null)}>
                    Cerrar
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Enviar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
