import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'admin';
  senderName: string;
  content: string;
  read: boolean;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation extends Document {
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
  lastMessageAt?: Date;
  unreadCount: number;
  adminUnreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    senderType: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    attachments: [{
      type: String,
    }],
  },
  { timestamps: true }
);

const ConversationSchema = new Schema<IConversation>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    participantId: {
      type: String,
      required: true,
      index: true,
    },
    participantName: {
      type: String,
      required: true,
    },
    participantEmail: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    relatedTo: {
      type: {
        type: String,
        enum: ['order', 'product', 'general'],
      },
      id: String,
      name: String,
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'pending'],
      default: 'open',
    },
    lastMessage: {
      type: String,
    },
    lastMessageAt: {
      type: Date,
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    adminUnreadCount: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// فهارس للبحث السريع
MessageSchema.index({ conversationId: 1, createdAt: 1 });
ConversationSchema.index({ participantId: 1, status: 1, lastMessageAt: -1 });

export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
export const Conversation = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);
