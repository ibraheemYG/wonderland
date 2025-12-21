'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'admin';
  senderName: string;
  content: string;
  read: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  subject: string;
  relatedTo?: {
    type: 'order' | 'product' | 'general';
    id?: string;
    name?: string;
  };
  status: 'open' | 'closed' | 'pending';
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

function MessagesContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('id');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConversation, setNewConversation] = useState({
    subject: '',
    relatedType: 'general' as 'order' | 'product' | 'general',
    content: '',
  });

  // جلب المحادثات
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchConversations = async () => {
      try {
        const res = await fetch(`/api/messages?userId=${user.id}`);
        const data = await res.json();
        if (data.success) {
          setConversations(data.data);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user?.id]);

  // جلب رسائل المحادثة المحددة
  useEffect(() => {
    if (!selectedId || !user?.id) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?conversationId=${selectedId}&userId=${user.id}`);
        const data = await res.json();
        if (data.success) {
          setMessages(data.data);
          // تحديث عدد الرسائل غير المقروءة
          setConversations(prev =>
            prev.map(c => c.id === selectedId ? { ...c, unreadCount: 0 } : c)
          );
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
    // تحديث كل 10 ثواني
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [selectedId, user?.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedId || !user) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedId,
          senderId: user.id,
          senderType: 'user',
          senderName: user.name || 'مستخدم',
          content: newMessage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
        // تحديث آخر رسالة في المحادثة
        setConversations(prev =>
          prev.map(c => c.id === selectedId
            ? { ...c, lastMessage: newMessage, lastMessageAt: new Date().toISOString() }
            : c
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleCreateConversation = async () => {
    if (!newConversation.subject.trim() || !newConversation.content.trim() || !user) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createConversation',
          participantId: user.id,
          participantName: user.name || 'مستخدم',
          participantEmail: user.email,
          subject: newConversation.subject,
          relatedTo: { type: newConversation.relatedType },
          content: newConversation.content,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setConversations(prev => [data.data, ...prev]);
        setShowNewConversation(false);
        setNewConversation({ subject: '', relatedType: 'general', content: '' });
        router.push(`/messages?id=${data.data.id}`);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">يرجى تسجيل الدخول لعرض الرسائل</p>
          <Link href="/login" className="text-primary hover:underline">تسجيل الدخول</Link>
        </div>
      </div>
    );
  }

  const selectedConversation = conversations.find(c => c.id === selectedId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الرسائل</h1>
          <button
            onClick={() => setShowNewConversation(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            محادثة جديدة
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="flex h-[calc(100vh-200px)] min-h-[500px]">
            {/* قائمة المحادثات */}
            <div className="w-full md:w-80 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  <p>لا توجد محادثات</p>
                  <p className="text-sm mt-2">ابدأ محادثة جديدة مع فريق الدعم</p>
                </div>
              ) : (
                conversations.map(conv => (
                  <Link
                    key={conv.id}
                    href={`/messages?id=${conv.id}`}
                    className={`block p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      selectedId === conv.id ? 'bg-primary/5 dark:bg-primary/10' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {conv.subject}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                          {conv.lastMessage || 'لا توجد رسائل'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {conv.unreadCount > 0 && (
                          <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          conv.status === 'open' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          conv.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {conv.status === 'open' ? 'مفتوحة' : conv.status === 'pending' ? 'قيد الانتظار' : 'مغلقة'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* منطقة المحادثة */}
            <div className="flex-1 flex flex-col hidden md:flex">
              {selectedConversation ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="font-semibold text-gray-900 dark:text-white">{selectedConversation.subject}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {selectedConversation.relatedTo?.type === 'product' ? '📦 استفسار عن منتج' :
                       selectedConversation.relatedTo?.type === 'order' ? '🛒 استفسار عن طلب' : '💬 استفسار عام'}
                    </p>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(msg => (
                      <div
                        key={msg._id}
                        className={`flex ${msg.senderType === 'user' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          msg.senderType === 'user'
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                            : 'bg-primary text-white'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${
                            msg.senderType === 'user' ? 'text-gray-500 dark:text-gray-400' : 'text-white/70'
                          }`}>
                            {new Date(msg.createdAt).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        placeholder="اكتب رسالتك..."
                        className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={sending || !newMessage.trim()}
                        className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50 transition-colors"
                      >
                        {sending ? '...' : 'إرسال'}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <span className="text-4xl mb-4 block">💬</span>
                    <p>اختر محادثة للعرض</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal لمحادثة جديدة */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">محادثة جديدة</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  نوع الاستفسار
                </label>
                <select
                  value={newConversation.relatedType}
                  onChange={(e) => setNewConversation({ ...newConversation, relatedType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="general">استفسار عام</option>
                  <option value="product">استفسار عن منتج</option>
                  <option value="order">استفسار عن طلب</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الموضوع
                </label>
                <input
                  type="text"
                  value={newConversation.subject}
                  onChange={(e) => setNewConversation({ ...newConversation, subject: e.target.value })}
                  placeholder="عنوان موجز للاستفسار"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الرسالة
                </label>
                <textarea
                  value={newConversation.content}
                  onChange={(e) => setNewConversation({ ...newConversation, content: e.target.value })}
                  placeholder="اكتب رسالتك هنا..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateConversation}
                disabled={sending || !newConversation.subject.trim() || !newConversation.content.trim()}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors font-medium"
              >
                {sending ? 'جاري الإرسال...' : 'إرسال'}
              </button>
              <button
                onClick={() => setShowNewConversation(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MessagesLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesLoading />}>
      <MessagesContent />
    </Suspense>
  );
}
