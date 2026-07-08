const FALLBACK_AR = 'حدث خطأ غير متوقع، حاول مرة أخرى'

const translations: Array<[RegExp, string]> = [
  [/Booking time is outside service listing availability/i, 'وقت الحجز خارج مواعيد الإتاحة لهذه الخدمة. اختر وقتاً يسمح بانتهاء الحجز قبل نهاية وقت العمل'],
  [/service is already booked|service listing is already booked|already booked in this time|محجوزة بالفعل/i, 'هذه الخدمة محجوزة بالفعل في هذا التوقيت. من فضلك اختر وقتاً آخر'],
  [/another assignment in the same time|مشغل لديه مهمة أخرى|المشغل لديه مهمة أخرى/i, 'المشغل لديه مهمة أخرى في نفس التوقيت. اختر مشغلاً آخر أو وقتاً مختلفاً'],
  [/No availability exists for the selected day/i, 'اليوم المحدد غير متاح لهذه الخدمة. اختر يوماً من أيام الإتاحة المعروضة'],
  [/Booking is not allowed on a blackout date/i, 'لا يمكن الحجز في هذا اليوم لأنه غير متاح لدى المزود'],
  [/Minimum booking duration/i, 'مدة الحجز أقل من الحد الأدنى المسموح لهذه الخدمة'],
  [/Booking location is outside provider service zone/i, 'موقع الحجز خارج نطاق خدمة المزود. يجب الموافقة على التكلفة الإضافية خارج النطاق'],
  [/Selected address was not found/i, 'العنوان المحدد غير موجود أو غير تابع لحسابك'],
  [/Selected address must have latitude and longitude/i, 'العنوان المحدد لا يحتوي على إحداثيات الموقع. يرجى تحديث العنوان أو إدخال الموقع يدوياً'],
  [/Governorate and district are required/i, 'يرجى إدخال المحافظة والمنطقة عند عدم استخدام عنوان محفوظ'],
  [/Latitude and longitude are required/i, 'يرجى إدخال إحداثيات الموقع عند عدم استخدام عنوان محفوظ'],
  [/time adjustment request is still waiting/i, 'يوجد طلب زيادة وقت بانتظار رد العميل، ولا يمكن إنهاء الخدمة قبل الموافقة أو الرفض'],
  [/approved time adjustment must be paid/i, 'تمت الموافقة على طلب زيادة الوقت، ويجب دفع قيمة الزيادة قبل إنهاء الخدمة'],
  [/time adjustment can only be requested/i, 'يمكن طلب زيادة الوقت فقط أثناء تنفيذ الخدمة وقبل اكتمالها'],
  [/pending time adjustment request/i, 'يوجد طلب زيادة وقت قيد الانتظار لهذا الحجز بالفعل'],
  [/Customer or provider account must be active/i, 'يجب أن يكون الحساب نشطاً قبل تنفيذ هذا الإجراء'],
  [/account has been deactivated|deactivated/i, 'تم تعطيل حسابك، يرجى التواصل مع الدعم'],
  [/identity verification|national id|verified/i, 'يجب توثيق الحساب بالبطاقة الشخصية قبل تنفيذ هذا الإجراء'],
  [/User not found/i, 'المستخدم غير موجود'],
  [/Invalid Token Claims/i, 'بيانات جلسة الدخول غير صحيحة'],
  [/Invalid Refresh Token/i, 'جلسة الدخول غير صالحة'],
  [/Logged out successfully/i, 'تم تسجيل الخروج بنجاح'],
  [/email.*already|already.*email|duplicateemail/i, 'البريد الإلكتروني مستخدم بالفعل'],
  [/user.?name.*already|already.*user.?name|duplicateusername/i, 'اسم المستخدم مستخدم بالفعل'],
  [/phone.*already|already.*phone/i, 'رقم الهاتف مستخدم بالفعل'],
  [/invalid.*email|email.*invalid/i, 'صيغة البريد الإلكتروني غير صحيحة'],
  [/passwords? must be at least|password.*least/i, 'كلمة المرور يجب أن تكون 6 رموز على الأقل'],
  [/password.*digit|PasswordRequiresDigit/i, 'كلمة المرور يجب أن تكون 6 رموز على الأقل'],
  [/password.*lowercase|PasswordRequiresLower/i, 'كلمة المرور يجب أن تكون 6 رموز على الأقل'],
  [/password.*uppercase|PasswordRequiresUpper/i, 'كلمة المرور يجب أن تكون 6 رموز على الأقل'],
  [/password.*non.?alphanumeric|password.*special|PasswordRequiresNonAlphanumeric/i, 'كلمة المرور يجب أن تكون 6 رموز على الأقل'],
  [/not found/i, 'العنصر المطلوب غير موجود'],
  [/not authorized|unauthorized|forbidden/i, 'ليس لديك صلاحية لتنفيذ هذا الإجراء'],
  [/validation error|one or more validation errors/i, 'يوجد خطأ في البيانات المدخلة، يرجى مراجعتها'],
  [/required/i, 'يرجى استكمال جميع الحقول المطلوبة'],
  [/cannot/i, 'لا يمكن تنفيذ هذا الإجراء بالحالة الحالية'],
  [/already/i, 'هذا الإجراء تم تنفيذه من قبل أو أن البيانات موجودة مسبقاً'],
  [/invalid/i, 'البيانات المدخلة غير صحيحة'],
  [/must be/i, 'القيمة المدخلة لا توافق الشروط المطلوبة'],
  [/minimum requirements/i, 'لا يمكن الموافقة لأن البيانات المطلوبة غير مكتملة'],
  [/active held escrow|escrow/i, 'لا يوجد سجل ضمان مالي نشط لهذا الطلب'],
  [/image file is required|file is required/i, 'يرجى اختيار ملف للرفع'],
  [/unsupported file type|file type/i, 'نوع الملف غير مدعوم'],
  [/file size|maximum file/i, 'حجم الملف أكبر من المسموح'],
  [/network error|failed to fetch|connection/i, 'تعذر الاتصال بالخادم. تأكد من تشغيل الباك اند وحاول مرة أخرى'],
  [/An unexpected error occurred|unexpected error/i, FALLBACK_AR]
]

export function translateBackendMessage(message: string | null | undefined): string {
  if (!message) return FALLBACK_AR

  const trimmed = String(message).trim()
  if (!trimmed) return FALLBACK_AR

  // Keep Arabic messages as-is.
  if (/[\u0600-\u06FF]/.test(trimmed)) return trimmed

  const exact = translations.find(([pattern]) => pattern.test(trimmed))
  if (exact) return exact[1]

  return FALLBACK_AR
}

function translateValue(value: any): any {
  if (value == null) return value

  if (typeof value === 'string') {
    return translateBackendMessage(value)
  }

  if (Array.isArray(value)) {
    return value.map(item => translateValue(item))
  }

  if (typeof value === 'object') {
    const translated: Record<string, any> = { ...value }

    for (const key of Object.keys(translated)) {
      const lowerKey = key.toLowerCase()
      const shouldTranslateDirectly = [
        'message',
        'Message'.toLowerCase(),
        'title',
        'detail',
        'error',
        'exceptionmessage',
        'innerexception',
        'description'
      ].includes(lowerKey)

      if (shouldTranslateDirectly || lowerKey.includes('message') || lowerKey.includes('error')) {
        translated[key] = translateValue(translated[key])
      } else if (lowerKey === 'errors' || lowerKey === 'failures') {
        translated[key] = translateValue(translated[key])
      } else if (typeof translated[key] === 'object') {
        translated[key] = translateValue(translated[key])
      }
    }

    return translated
  }

  return value
}

export function normalizeErrorPayload(payload: any): any {
  if (!payload) return { message: FALLBACK_AR }

  if (typeof payload === 'string') {
    return { message: translateBackendMessage(payload) }
  }

  const normalized = translateValue(payload)

  if (!normalized.message && !normalized.Message) {
    const message = getErrorMessage({ error: normalized })
    return { ...normalized, message }
  }

  return normalized
}

export function getErrorMessage(error: any, fallback: string = FALLBACK_AR): string {
  const response = error?.error ?? error

  if (!response) {
    return fallback
  }

  if (typeof response === 'string') {
    return translateBackendMessage(response) || fallback
  }

  if (
    response.exceptionMessage &&
    (response.message === 'An unexpected error occurred.' || response.message === FALLBACK_AR)
  ) {
    return translateBackendMessage(response.exceptionMessage)
  }

  if (response.exceptionMessage) {
    return translateBackendMessage(response.exceptionMessage)
  }

  if (response.message) {
    return translateBackendMessage(response.message)
  }

  if (response.Message) {
    return translateBackendMessage(response.Message)
  }

  if (response.detail) {
    return translateBackendMessage(response.detail)
  }

  if (response.title) {
    return translateBackendMessage(response.title)
  }

  if (response.error) {
    return translateBackendMessage(response.error)
  }

  if (response.errors) {
    const errors = response.errors

    if (Array.isArray(errors)) {
      return errors.map(x => translateBackendMessage(String(x))).join('، ')
    }

    if (typeof errors === 'object') {
      const message = Object.values(errors)
        .flat()
        .map(x => translateBackendMessage(String(x)))
        .join('، ')
      return message || fallback
    }
  }

  return fallback
}
