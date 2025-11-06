// دالة للتحقق من بيانات المستخدم
// في التطبيق الحقيقي، يتم التحقق من قاعدة البيانات

export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123', // في الإنتاج: استخدم متغيرات البيئة والتجزئة
};

export const VALID_USERS = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User',
  },
  {
    id: 2,
    username: 'user',
    password: 'user123',
    role: 'user',
    name: 'Regular User',
  },
];

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
  name: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  message?: string;
}

// دالة للتحقق من بيانات المستخدم
export function validateCredentials(username: string, password: string): User | null {
  const user = VALID_USERS.find((u) => u.username === username && u.password === password);
  if (user) {
    // لا نرجع كلمة المرور أبداً
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }
  return null;
}
