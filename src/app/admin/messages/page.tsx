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
  participantEmail: string;
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
  adminUnreadCount: number;
}

function AdminMessagesContent() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('id');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'pending' | 'closed'>('all');

  useEffect(() => {
    if (!user || !isAdmin()) {
      router.push('/login');
    }
  }, [user, isAdmin, router]);

  // جلب المحادثات
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchConversations = async () => {
      try {
        const res = await fetch(`/api/messages?userId=${user.id}&isAdmin=true`);
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
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // جلب رسائل المحادثة المحددة
  useEffect(() => {
    if (!selectedId || !user?.id) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?conversationId=${selectedId}&userId=${user.id}&isAdmin=true`);
        const data = await res.json();
        if (data.success) {
          setMessages(data.data);
          setConversations(prev =>
            prev.map(c => c.id === selectedId ? { ...c, adminUnreadCount: 0 } : c)
          );
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
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
          senderType: 'admin',
          senderName: 'فريق الدعم',
          content: newMessage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
        setConversations(prev =>
          prev.map(c => c.id === selectedId
            ? { ...c, lastMessage: newMessage, lastMessageAt: new Date().toISOString(), status: 'open' }
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

  const handleUpdateStatus = async (conversationId: string, status: 'open' | 'closed' | 'pending') => {
    try {
      await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, status }),
      });
      
      setConversations(prev =>
        prev.map(c => c.id === conversationId ? { ...c, status } : c)
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredConversations = conversations.filter(c => 
    filter === 'all' || c.status === filter
  );

  const totalUnread = conversations.reduce((acc, c) => acc + (c.adminUnreadCount || 0), 0);
  const selectedConversation = conversations.find(c => c.id === selectedId);

  if (!user || !isAdmin()) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">💬 الرسائل</h1>
            {totalUnread > 0 && (
              <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-full">
                {totalUnread} جديدة
              </span>
            )}
          </div>
          <Link href="/admin/dashboard" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-sm">
            ← لوحة التحكم
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {['all', 'open', 'pending', 'closed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {f === 'all' ? 'الكل' : f === 'open' ? 'مفتوحة' : f === 'pending' ? 'قيد الانتظار' : 'مغلقة'}
              {f !== 'all' && (
                <span className="mr-1 text-xs">
                  ({conversations.filter(c => c.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex h-[calc(100vh-250px)] min-h-[500px]">
            {/* قائمة المحادثات */}
            <div className="w-full md:w-96 border-l border-white/10 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-white/10 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-white/50">
                  <p>لا توجد محادثات</p>
                </div>
              ) : (
                filteredConversations.map(conv => (
                  <Link
                    key={conv.id}
                    href={`/admin/messages?id=${conv.id}`}
                    className={`block p-4 border-b border-white/10 hover:bg-white/5 transition-colors ${
                      selectedId === conv.id ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white text-sm truncate">
                            {conv.participantName}
                          </h3>
                          {conv.adminUnreadCount > 0 && (
                            <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                              {conv.adminUnreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-primary mt-0.5">{conv.subject}</p>
                        <p className="text-xs text-white/50 mt-1 line-clamp-1">
                          {conv.lastMessage || 'لا توجد رسائل'}
                        </p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        conv.status === 'open' ? 'bg-green-500/20 text-green-400' :
                        conv.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {conv.status === 'open' ? 'مفتوحة' : conv.status === 'pending' ? 'قيد الانتظار' : 'مغلقة'}
                      </span>
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
                  <div className="p-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-semibold text-white">{selectedConversation.participantName}</h2>
                        <p className="text-xs text-white/50">{selectedConversation.participantEmail}</p>
                        <p className="text-xs text-primary mt-1">{selectedConversation.subject}</p>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={selectedConversation.status}
                          onChange={(e) => handleUpdateStatus(selectedConversation.id, e.target.value as any)}
                          className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                        >
                          <option value="open">مفتوحة</option>
                          <option value="pending">قيد الانتظار</option>
                          <option value="closed">مغلقة</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(msg => (
                      <div
                        key={msg._id}
                        className={`flex ${msg.senderType === 'admin' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          msg.senderType === 'admin'
                            ? 'bg-primary text-white'
                            : 'bg-white/10 text-white'
                        }`}>
                          <p className="text-xs font-medium mb-1 opacity-70">{msg.senderName}</p>
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-[10px] mt-1 opacity-50">
                            {new Date(msg.createdAt).toLocaleString('ar-IQ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-white/10">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        placeholder="اكتب ردك..."
                        className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={sending || !newMessage.trim()}
                        className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50 transition-colors font-medium"
                      >
                        {sending ? '...' : 'إرسال'}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-white/50">
                  <div className="text-center">
                    <span className="text-5xl mb-4 block">💬</span>
                    <p>اختر محادثة للرد عليها</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function AdminMessagesLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/70">جاري التحميل...</p>
      </div>
    </div>
  );
}

export default function AdminMessagesPage() {
  return (
    <Suspense fallback={<AdminMessagesLoading />}>
      <AdminMessagesContent />
    </Suspense>
  );
}
