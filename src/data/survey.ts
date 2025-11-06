// نموذج بيانات الاستبانة

export interface SurveyResponse {
  id: string;
  furnitureType: string;
  purchaseFrequency: string;
  onlinePurchase: string;
  onlinePurchaseReason?: string;
  mainConcern: string;
  preferredDelivery: string;
  preferredPayment: string;
  installmentInterest: string;
  appWishlist: string;
  timestamp: number;
  userAgent?: string;
}

export const SURVEY_QUESTIONS = {
  furnitureType: {
    label: 'ما نوع الأثاث الذي تشتريه عادة؟',
    type: 'checkbox',
    options: [
      'غرفة معيشة (أرائك، كراسي)',
      'غرفة نوم (سرير، خزانة)',
      'مطبخ (طاولات، كراسي)',
      'ديكور ومفروشات',
      'أثاث مكتبي',
      'متنوع',
    ],
  },
  purchaseFrequency: {
    label: 'كم مرة تشتري أثاث جديد في السنة؟',
    type: 'radio',
    options: [
      'أقل من مرة واحدة في السنة',
      'مرة واحدة في السنة',
      'مرتين إلى ثلاث مرات',
      'أكثر من ثلاث مرات',
    ],
  },
  onlinePurchase: {
    label: 'هل سبق أن اشتريت أثاث عبر الإنترنت؟',
    type: 'radio',
    options: ['نعم', 'لا'],
  },
  onlinePurchaseReason: {
    label: 'إذا كانت الإجابة "لا"، لماذا لم تشتر أثاث عبر الإنترنت؟',
    type: 'textarea',
    placeholder: 'شارك أسبابك...',
  },
  mainConcern: {
    label: 'ما أكثر شيء يقلقك عند الشراء أونلاين؟',
    type: 'select',
    options: [
      'جودة المنتج والمواد',
      'التوصيل والتركيب',
      'السعر والتكاليف الإضافية',
      'خدمة العملاء والضمان',
      'وقت التسليم',
      'الأمان والثقة',
      'أخرى',
    ],
  },
  preferredDelivery: {
    label: 'ما الطريقة المفضلة للتوصيل؟',
    type: 'radio',
    options: [
      'توصيل إلى المنزل مع التركيب',
      'توصيل إلى المنزل بدون تركيب',
      'استلام من محل قريب',
      'لا أهتم',
    ],
  },
  preferredPayment: {
    label: 'ما الطريقة المفضلة للدفع؟',
    type: 'radio',
    options: [
      'الدفع عند الاستلام',
      'بطاقة ائتمان',
      'محفظة رقمية (Apple Pay, Google Pay)',
      'تحويل بنكي',
      'لا أهتم',
    ],
  },
  installmentInterest: {
    label: 'هل ترغب بميزة التقسيط أو الحجز المسبق؟',
    type: 'checkbox',
    options: [
      'نعم، ميزة التقسيط (أقساط شهرية)',
      'نعم، الحجز المسبق (دفع جزئي)',
      'كلاهما',
      'لا أحتاج',
    ],
  },
  appWishlist: {
    label: 'الذي تتمنى وجوده في تطبيق بيع الأثاث؟',
    type: 'textarea',
    placeholder: 'أخبرنا عن أحلامك وتوقعاتك...',
  },
};
