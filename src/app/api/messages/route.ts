import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Message, Conversation } from '@/models/Message';
import Notification from '@/models/Notification';

// GET - جلب المحادثات أو الرسائل
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const userId = searchParams.get('userId');
    const isAdmin = searchParams.get('isAdmin') === 'true';

    // جلب رسائل محادثة معينة
    if (conversationId) {
      const messages = await Message.find({ conversationId })
        .sort({ createdAt: 1 });

      // تحديث حالة القراءة
      if (userId) {
        const updateField = isAdmin ? 'adminUnreadCount' : 'unreadCount';
        await Conversation.findOneAndUpdate(
          { id: conversationId },
          { [updateField]: 0 }
        );
        
        // تحديث الرسائل كمقروءة
        const senderType = isAdmin ? 'user' : 'admin';
        await Message.updateMany(
          { conversationId, senderType, read: false },
          { read: true }
        );
      }

      return NextResponse.json({ success: true, data: messages });
    }

    // جلب محادثات المستخدم
    if (userId) {
      const query = isAdmin ? {} : { participantId: userId };
      const conversations = await Conversation.find(query)
        .sort({ lastMessageAt: -1 });

      return NextResponse.json({ success: true, data: conversations });
    }

    return NextResponse.json({ success: false, message: 'userId أو conversationId مطلوب' }, { status: 400 });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST - إنشاء محادثة جديدة أو إرسال رسالة
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      action,
      conversationId,
      senderId,
      senderType,
      senderName,
      content,
      // للمحادثة الجديدة
      participantId,
      participantName,
      participantEmail,
      subject,
      relatedTo,
    } = body;

    // إنشاء محادثة جديدة
    if (action === 'createConversation') {
      const newConversationId = `conv_${Date.now()}`;
      
      const conversation = await Conversation.create({
        id: newConversationId,
        participantId,
        participantName,
        participantEmail,
        subject,
        relatedTo,
        lastMessage: content,
        lastMessageAt: new Date(),
        adminUnreadCount: 1,
      });

      // إنشاء الرسالة الأولى
      if (content) {
        await Message.create({
          conversationId: newConversationId,
          senderId: participantId,
          senderType: 'user',
          senderName: participantName,
          content,
        });
      }

      return NextResponse.json({ success: true, data: conversation }, { status: 201 });
    }

    // إرسال رسالة جديدة
    if (!conversationId || !senderId || !senderType || !senderName || !content) {
      return NextResponse.json(
        { success: false, message: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    const message = await Message.create({
      conversationId,
      senderId,
      senderType,
      senderName,
      content,
    });

    // تحديث المحادثة
    const conversation = await Conversation.findOne({ id: conversationId });
    if (conversation) {
      const updateData: any = {
        lastMessage: content.substring(0, 100),
        lastMessageAt: new Date(),
      };

      if (senderType === 'admin') {
        updateData.unreadCount = (conversation.unreadCount || 0) + 1;
        updateData.status = 'open';
        
        // إرسال إشعار للمستخدم
        await Notification.create({
          userId: conversation.participantId,
          title: 'رسالة جديدة',
          message: `لديك رد جديد على: ${conversation.subject}`,
          type: 'message',
          link: `/messages?id=${conversationId}`,
        });
      } else {
        updateData.adminUnreadCount = (conversation.adminUnreadCount || 0) + 1;
      }

      await Conversation.findOneAndUpdate({ id: conversationId }, updateData);
    }

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating message:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT - تحديث حالة المحادثة
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { conversationId, status } = body;

    if (!conversationId) {
      return NextResponse.json({ success: false, message: 'conversationId مطلوب' }, { status: 400 });
    }

    const conversation = await Conversation.findOneAndUpdate(
      { id: conversationId },
      { status },
      { new: true }
    );

    return NextResponse.json({ success: true, data: conversation });
  } catch (error: any) {
    console.error('Error updating conversation:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
