import React from 'react';
import { RotateCcw, Package, Clock, CheckCircle, AlertTriangle, Truck } from 'lucide-react';

export default function ReturnPolicyPage() {
  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <RotateCcw className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            سياسة الإرجاع والاستبدال
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            رضاكم هو أولويتنا. نوفر سياسة إرجاع مرنة لضمان تجربة تسوق مريحة
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 space-y-8">
          {/* مدة الإرجاع */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">مدة الإرجاع</h2>
            </div>
            <div className="bg-primary/10 rounded-xl p-6 text-center">
              <p className="text-4xl font-bold text-primary mb-2">14 يوم</p>
              <p className="text-gray-600 dark:text-gray-400">
                يمكنك إرجاع المنتج خلال 14 يوماً من تاريخ الاستلام
              </p>
            </div>
          </section>

          {/* شروط الإرجاع */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">شروط قبول الإرجاع</h2>
            </div>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                المنتج في حالته الأصلية ولم يتم استخدامه
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                جميع الملصقات والتغليف الأصلي متوفرة
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                وجود فاتورة الشراء أو رقم الطلب
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                المنتج خالٍ من أي تلف أو خدوش
              </li>
            </ul>
          </section>

          {/* المنتجات غير القابلة للإرجاع */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">منتجات غير قابلة للإرجاع</h2>
            </div>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                المنتجات المصنوعة حسب الطلب أو المخصصة
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                المفروشات والأقمشة التي تم فتحها
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                المنتجات المعروضة للبيع بتخفيض خاص (Sale)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                الإكسسوارات الصغيرة والشموع
              </li>
            </ul>
          </section>

          {/* خطوات الإرجاع */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Truck className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">خطوات الإرجاع</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 text-center">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">1</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">تقديم الطلب</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">تواصل معنا وأخبرنا برقم الطلب وسبب الإرجاع</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 text-center">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">2</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">الموافقة</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">سنراجع طلبك ونوافق عليه خلال 24 ساعة</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 text-center">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">3</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">الاستلام والاسترداد</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">سنستلم المنتج ونعيد المبلغ خلال 3-5 أيام</p>
              </div>
            </div>
          </section>

          {/* الاستبدال */}
          <section className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">🔄 الاستبدال</h2>
            <p className="text-gray-600 dark:text-gray-400">
              يمكنك استبدال المنتج بمنتج آخر بنفس القيمة أو بدفع/استرداد الفرق. الاستبدال مجاني في حالة وجود عيب في المنتج.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
