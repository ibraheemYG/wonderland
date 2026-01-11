import React from 'react';
import { Lock, Eye, Database, Shield, Mail, Cookie } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
            <Lock className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            سياسة الخصوصية
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية
          </p>
          <p className="text-sm text-gray-500 mt-2">آخر تحديث: يناير 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 space-y-8">
          {/* البيانات التي نجمعها */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">البيانات التي نجمعها</h2>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">معلومات الحساب:</h3>
                <ul className="list-disc list-inside mr-4 space-y-1">
                  <li>الاسم الكامل</li>
                  <li>البريد الإلكتروني</li>
                  <li>رقم الهاتف</li>
                  <li>عنوان التوصيل</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">معلومات الطلبات:</h3>
                <ul className="list-disc list-inside mr-4 space-y-1">
                  <li>سجل المشتريات</li>
                  <li>المنتجات المفضلة</li>
                  <li>تفضيلات التصفح</li>
                </ul>
              </div>
            </div>
          </section>

          {/* كيف نستخدم بياناتك */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">كيف نستخدم بياناتك</h2>
            </div>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                معالجة وتوصيل طلباتك
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                إرسال تحديثات حول حالة الطلب
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                تحسين تجربة التسوق وتخصيص المحتوى
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                إرسال العروض الترويجية (بموافقتك)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                تقديم خدمة عملاء أفضل
              </li>
            </ul>
          </section>

          {/* حماية البيانات */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">حماية بياناتك</h2>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 space-y-3 text-gray-600 dark:text-gray-400">
              <p>نتخذ إجراءات أمنية صارمة لحماية بياناتك:</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  تشفير SSL لجميع البيانات المنقولة
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  تخزين آمن للبيانات في خوادم محمية
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  عدم مشاركة بياناتك مع أطراف ثالثة دون موافقتك
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  إمكانية حذف حسابك وبياناتك في أي وقت
                </li>
              </ul>
            </div>
          </section>

          {/* ملفات تعريف الارتباط */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">ملفات تعريف الارتباط (Cookies)</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              نستخدم ملفات تعريف الارتباط لتحسين تجربتك على الموقع. يمكنك:
            </p>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                قبول جميع ملفات تعريف الارتباط
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                رفض ملفات تعريف الارتباط غير الضرورية
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                تعديل إعدادات المتصفح للتحكم في ملفات تعريف الارتباط
              </li>
            </ul>
          </section>

          {/* حقوقك */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">حقوقك</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">الوصول للبيانات</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">يمكنك طلب نسخة من بياناتك المخزنة لدينا</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">تعديل البيانات</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">تحديث معلوماتك الشخصية في أي وقت</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">حذف البيانات</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">طلب حذف حسابك وجميع بياناتك</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">إلغاء الاشتراك</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">إلغاء الاشتراك من الرسائل التسويقية</p>
              </div>
            </div>
          </section>

          {/* التواصل */}
          <section className="bg-primary/10 rounded-xl p-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">لديك أسئلة؟</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              تواصل معنا للاستفسار عن سياسة الخصوصية أو لممارسة حقوقك
            </p>
            <p className="text-primary font-semibold">privacy@wonderland.iq</p>
          </section>
        </div>
      </div>
    </main>
  );
}
