import React from 'react';
import { Shield, Clock, CheckCircle, AlertCircle, Phone } from 'lucide-react';

export default function WarrantyPage() {
  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            سياسة الضمان
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            نحن في Wonderland نلتزم بتقديم منتجات عالية الجودة مع ضمان شامل لراحة بالك
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 space-y-8">
          {/* مدة الضمان */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">مدة الضمان</h2>
            </div>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <p>• <strong>الأثاث الخشبي:</strong> ضمان لمدة سنتين (2) ضد عيوب التصنيع</p>
              <p>• <strong>الأجهزة الكهربائية:</strong> ضمان لمدة سنة (1) كاملة</p>
              <p>• <strong>المفروشات والأقمشة:</strong> ضمان لمدة 6 أشهر</p>
              <p>• <strong>الإكسسوارات والديكور:</strong> ضمان لمدة 3 أشهر</p>
            </div>
          </section>

          {/* ما يشمله الضمان */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">ما يشمله الضمان</h2>
            </div>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                عيوب التصنيع والمواد الخام
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                مشاكل الهيكل والتركيب الأساسي
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                الأعطال الميكانيكية في الأجزاء المتحركة
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                تقشر أو تلف الطلاء خلال فترة الضمان
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                الإصلاح أو الاستبدال المجاني
              </li>
            </ul>
          </section>

          {/* ما لا يشمله الضمان */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">ما لا يشمله الضمان</h2>
            </div>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">✗</span>
                الأضرار الناتجة عن سوء الاستخدام
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">✗</span>
                التلف بسبب الحوادث أو الكوارث الطبيعية
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">✗</span>
                التآكل والبلى الطبيعي من الاستخدام اليومي
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">✗</span>
                التعديلات أو الإصلاحات من قبل جهات غير معتمدة
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">✗</span>
                الأضرار الناتجة عن التعرض للرطوبة أو أشعة الشمس المباشرة
              </li>
            </ul>
          </section>

          {/* كيفية تفعيل الضمان */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Phone className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">كيفية تفعيل الضمان</h2>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <ol className="space-y-4 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <span>احتفظ بفاتورة الشراء الأصلية</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <span>تواصل معنا عبر الرسائل أو الهاتف مع وصف المشكلة</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <span>سيقوم فريقنا بالتواصل معك خلال 24-48 ساعة</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  <span>سيتم الإصلاح أو الاستبدال حسب الحالة</span>
                </li>
              </ol>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
