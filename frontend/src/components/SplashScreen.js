import React, { useEffect, useRef } from 'react';
import Vivus from 'vivus';
import './SplashScreen.css';

const SplashScreen = ({ onFinish }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    // تهيئة تأثير الرسم
    const vivus = new Vivus(svgRef.current, {
      type: 'delayed',       // تأخير بين المسارات
      duration: 200,         // مدة الرسم (كلما زاد الرقم كان أبطأ)
      start: 'autostart',    // يبدأ تلقائياً
      animTimingFunction: Vivus.LINEAR, // حركة خطية
      pathTimingFunction: Vivus.LINEAR
    });

    // بعد الانتهاء من الرسم، ننتظر قليلاً ثم ننهي العرض
    const timer = setTimeout(() => {
      onFinish();
    }, 3000); // 3 ثوانٍ بعد بدء الرسم (يمكن تعديلها)

    return () => {
      clearTimeout(timer);
      vivus.stop();
    };
  }, [onFinish]);

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <object
          ref={svgRef}
          data="/logo.svg"
          type="image/svg+xml"
          className="splash-svg"
          aria-label="شعار موكب الحياك"
        >
          {/* إذا لم يتم تحميل SVG، يظهر نص بديل */}
          <img src="/logo.png" alt="موكب الحياك" className="splash-fallback" />
        </object>
        <div className="splash-text">
          <h1>موكب الحياك</h1>
          <p>الحسابات والمخزن والارشيف</p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;