function businessModelScene(i) {
  return `${head(i,tx('نقدم خطاك للجهات المشغّلة للرعاية لتوفير الفحص الوقائي للحجاج والمعتمرين.','We provide STEPS to care providers for preventive screening of Hajj and Umrah pilgrims.'))}
  <div class="business-model-grid">
    <section class="business-card business-buyers enter">
      <div class="business-card-top"><span class="business-symbol">${ic('hospital')}</span><span class="business-step">01</span></div>
      <h2>${tx('من يشتري الجهاز؟','Who buys the device?')}</h2>
      <ul class="business-buyer-list">
        <li>${ic('shield-check')}<span>${tx('الجهات الحكومية والصحية','Government and health agencies')}</span></li>
        <li>${ic('stethoscope')}<span>${tx('المستشفيات والمراكز الطبية','Hospitals and medical centers')}</span></li>
        <li>${ic('users-round')}<span>${tx('مشغلو خدمات الحج والعمرة','Hajj and Umrah service operators')}</span></li>
      </ul>
      <p class="business-card-note">${tx('تستخدمه هذه الجهات في نقاط الرعاية والفحص لخدمة الحجاج والمعتمرين.','Providers use the device at care and screening points to serve pilgrims.')}</p>
    </section>
    <section class="business-card business-service enter">
      <div class="business-card-top"><span class="business-symbol">${ic('settings-2')}</span><span class="business-step">02</span></div>
      <h2>${tx('كيف نقدّم الخدمة؟','How do we deliver?')}</h2>
      <div class="business-service-step">${ic('circuit-board')}<div><h3>${tx('تجهيز وتشغيل','Setup and training')}</h3><p>${tx('توريد الجهاز وتركيبه، وتدريب المشغلين على إجراء الفحص وقراءة التقرير.','Supply and install the device. Train operators to perform screening and read reports.')}</p></div></div>
      <div class="business-service-step">${ic('hand-heart')}<div><h3>${tx('دعم مستمر','Ongoing support')}</h3><p>${tx('يتولى الفريق تطوير النظام ودعمه وصيانته، بالتعاون مع الموردين التقنيين والجهات الصحية.','Develop, support and maintain the system with technology suppliers and healthcare organizations.')}</p></div></div>
    </section>
    <section class="business-card business-revenue enter">
      <div class="business-card-top"><span class="business-symbol">${ic('circle-dollar-sign')}</span><span class="business-step">03</span></div>
      <h2>${tx('كيف نحقق الإيراد؟','How do we earn revenue?')}</h2>
      <div class="business-offer"><span>${tx('بيع الجهاز · سعر مقترح للوحدة','Device sale · proposed unit price')}</span><div class="business-price"><b>1,500</b><small>${tx('ريال','SAR')}</small></div></div>
      <div class="business-alternative"><span>${tx('أو اشتراك بديل','Or an alternative subscription')}</span><div><b>500</b><small>${tx('ريال شهريًا','SAR / month')}</small></div></div>
      <p class="business-card-note">${ic('clipboard-list')}${tx('تشمل الخدمة الفحص الوقائي والتقرير.','The service includes preventive screening and a report.')}</p>
    </section>
  </div>
  <aside class="business-channel-band enter" aria-label="${tx('قنوات الوصول','Channels')}">
    <div class="business-channel-title"><h2>${tx('قنوات الوصول','Channels')}</h2><p>${tx('نتواصل مع العملاء عبر','We reach customers through')}</p></div>
    ${[['hospital','المنشآت الصحية','Healthcare facilities'],['users-round','المعارض المهنية','Professional exhibitions'],['route','شركات توزيع الأجهزة','Medical-device distributors']].map(c=>`<div class="business-channel-item"><span>${ic(c[0])}</span><b>${tx(c[1],c[2])}</b></div>`).join('')}
  </aside>`;
}
