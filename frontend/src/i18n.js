// Complete Bilingual Translation System (EN default / AR on demand)
export const translations = {
  en: {
    // Brand & Navigation
    brandTitle: "STOCKPRED TERMINAL",
    brandSubtitle: "Multi-Expert Breakout & Bull Trap Quantitative Detection // Team Stockbrokers",
    engineOnline: "ENGINE ONLINE // 3 EXPERTS LOADED",
    engineOnlineCompact: "3 EXPERTS ONLINE",
    benchmarkCases: "Benchmark Cases:",
    consolidation: "Consolidation",
    switchLanguage: "Language",
    marketTimeNYC: "NYC Market Time",
    marketOpen: "MARKET OPEN",
    marketClosed: "MARKET CLOSED",
    afterHours: "AFTER-HOURS",
    preMarket: "PRE-MARKET",
    closesIn: "Closes in",
    endsIn: "Ends in",
    opensIn: "Opens in",
    nextBell: "Next Bell",
    regularSessionTarget: "Closes at 4:00 PM",
    afterHoursTarget: "Ends at 8:00 PM",
    preMarketTarget: "Regular Open at 9:30 AM",
    today: "Today",
    tomorrow: "Tomorrow",
    marketScheduleTooltip: "New York Stock Exchange (NYSE/NASDAQ) | Regular Session: 9:30 AM - 4:00 PM EDT",
    systemInfoTag: "System Info",
    clickForSystemInfo: "Click to view full architecture & system specifications",
    systemDetailedDesc: "StockPred Terminal is a high-conviction quantitative trading system developed by Team Stockbrokers. It combines a 30-day volatility screener with a tri-expert machine learning ensemble (XGBoost & LightGBM) to differentiate institutional breakout velocity from dangerous bull traps.",
    specArchitecture: "Pipeline Architecture",
    specModels: "Underlying Models",
    specCapitalRules: "Capital Allocation Rules",
    specTeam: "Development Team",
    close: "Close",

    // Preset benchmark titles
    preset_nvda_tier1_title: "NVDA Institutional Breakout (Tier 1 Consensus)",
    preset_nvda_tier1_desc: "Massive post-consolidation clearance above resistance. Unanimous institutional approval (3/3 Experts, 100% Full Allocation).",
    preset_nvda_tier2_title: "NVDA Speculative Momentum (Tier 2 Half-Size)",
    preset_nvda_tier2_desc: "Momentum Hunter approved, but Conservative model flagged doubt. Half-size allocation (50%) + tight stop (-2.50%).",
    preset_cmcsa_tier3_title: "CMCSA Classic Bull Trap (Tier 3 Trap Alert)",
    preset_cmcsa_tier3_desc: "Price pierced resistance but formed large upper wick. Unanimous rejection (0/3 Approved); capital completely preserved!",
    preset_tsla_consolidation_title: "TSLA Rangebound Consolidation (Stable State)",
    preset_tsla_consolidation_desc: "Asset trading within baseline boundaries below resistance. Demonstrates stage 1 screener avoiding unnecessary model evaluation.",

    // Controls
    assetEquity: "Asset / Equity (50 US Stocks)",
    searchStockPlaceholder: "Search ticker or company name...",
    noStocksFound: "No stocks found matching search",
    screeningCheckpointsTitle: "Screening Checkpoints & Gate Evaluation:",
    inspectionDate: "Inspection Date",
    todayLatest: "Today / Latest",
    setToLatest: "Set to Latest",
    jumpToLatestTitle: "Jump to the most recent trading day available",
    modelFocus: "Quantitative Model Focus",
    modelConsensus: "Tri-Expert Consensus (Tiered Strategy)",
    modelConservative: "Conservative (Capital Preserver - XGBoost w=5.0)",
    modelBalanced: "Balanced (LightGBM Alpha Booster w=3.0)",
    modelAggressive: "Aggressive (Momentum Hunter - XGBoost w=1.0)",
    liveFetch: "Live Fetch",
    fetching: "Fetching...",
    liveFetchTitle: "Fetch latest real-time prices directly from Yahoo Finance",
    runAudit: "Run Audit",
    auditingEngine: "Auditing Engine...",

    // Chart Header Metrics
    metricAuditedDate: "AUDITED DATE",
    metricDate: "DATE",
    metricClose: "CLOSE",
    metric30dResistance: "30D RESISTANCE",
    metricVolume: "VOLUME",
    auditedDateBadge: "AUDITED DATE",
    volSurgeRef: "VOL (SURGE REF 1.20x)",

    // Decision Card
    decisionPrompt: "Select a stock and inspection date, then click \"Run Audit\" to begin.",
    tacticalVerdictTitle: "TACTICAL STRATEGY VERDICT",
    tacticalVerdictSubtitle: "Quantitative Execution Conviction & Risk Management",
    badgeConsolidation: "CONSOLIDATION // NORMAL RANGE",
    badgeTier1: "TIER 1: FULL POSITION SIZE",
    badgeTier2: "TIER 2: SPECULATIVE HALF-SIZE",
    badgeTier3: "TIER 3: AVOID TRADE // BULL TRAP",
    allocationLabel: "RECOMMENDED POSITION SIZE",
    consensusLabel: "COMMITTEE CONSENSUS",
    executionGuidanceLabel: "Execution Guidance:",
    riskManagementLabel: "Risk Management:",
    screenerFailuresTitle: "STAGE 1 SCREENER CRITERIA NOT MET:",
    statusMessageConsolidation: "Stock is currently consolidating within normal boundaries. No breakout signal triggered today.",

    // Tri-Expert Matrix
    triExpertHeader: "TRI-EXPERT COMMITTEE EVALUATION",
    verdictApproved: "APPROVED",
    verdictRejected: "REJECTED",
    breakoutProbability: "Breakout Probability",
    expertConservativeName: "Conservative",
    expertBalancedName: "Balanced",
    expertAggressiveName: "Aggressive",

    // TreeSHAP
    shapTitle: "EXPLAINABLE AI // DECISION ATTRIBUTION (TreeSHAP)",
    supportDrivers: "Support Drivers (+SHAP)",
    trapRisks: "Trap Risks & Doubt Factors (-SHAP)",
    noSupportFactors: "No strong positive drivers detected for this setup today.",
    noDoubtFactors: "No significant trap risks detected (clean breakout environment).",

    // Footer
    footerTitle: "STOCKPRED AI TERMINAL // TEAM STOCKBROKERS // FASTAPI + REACT VITE",
    footerWinRate: "WIN RATE: 83.3% - 90.1%",
    footerCapture: "MARKET CAPTURE: 98.6%",
    footerLiveFetch: "LIVE MARKET FETCH: ACTIVE (YFINANCE)",

    // Copilot AI Assistant
    copilotButton: "AI Chat",
    copilotTitle: "STOCKPRED AI COPILOT",
    copilotSubtitle: "Autonomous Quantitative Financial Analyst // Groq Llama/Qwen & Whisper",
    copilotOnlineBadge: "QUANT COPILOT ACTIVE",
    copilotPlaceholder: "Ask about any stock or date (e.g. Why was NVDA a fakeout in March?)...",
    copilotListening: "Listening... speak now",
    copilotProcessingAudio: "Transcribing voice via Groq Whisper...",
    copilotThinking: "Auditing quantitative indicators...",
    copilotVoiceNotSupported: "Recording audio for Groq Whisper...",
    copilotVoiceError: "Microphone access error. Please grant permissions or type your question.",
    copilotSend: "Send",
    copilotViewOnChart: "View on Chart",
    copilotClearChat: "Clear Chat",
    copilotMaximize: "Maximize Window",
    copilotMinimize: "Restore Window",
    copilotWelcome: "Hello! I am the StockPred Autonomous AI Analyst. Ask me about breakout confirmation, bull trap risks, or quantitative metrics for any stock. You can type or click the microphone to speak.",
    copilotQuickChip1: "Why was NVDA a fakeout on 2024-03-15?",
    copilotQuickChip2: "Audit AAPL latest breakout setup",
    copilotQuickChip3: "Check CMCSA 2019-03-15 trap details"
  },
  ar: {
    // Brand & Navigation
    brandTitle: "منصة StockPred",
    brandSubtitle: "نظام كمي متعدد الخبراء لكشف الاختراقات والمصائد السعرية // فريق Stockbrokers",
    engineOnline: "المحرك متصل // تم تحميل 3 خبراء",
    engineOnlineCompact: "3 خبراء متصلون",
    benchmarkCases: "حالات مرجعية للتجربة:",
    consolidation: "تجميع عرضي",
    switchLanguage: "اللغة",
    marketTimeNYC: "توقيت بورصة نيويورك",
    marketOpen: "السوق مفتوح",
    marketClosed: "السوق مغلق",
    afterHours: "تداول مسائي",
    preMarket: "ما قبل الافتتاح",
    closesIn: "ينتهي خلال",
    endsIn: "ينتهي خلال",
    opensIn: "يبدأ خلال",
    nextBell: "الجلسة القادمة",
    regularSessionTarget: "إغلاق الجلسة 4:00 م",
    afterHoursTarget: "نهاية التداول المسائي 8:00 م",
    preMarketTarget: "افتتاح الجلسة 9:30 ص",
    today: "اليوم",
    tomorrow: "غداً",
    mon: "الإثنين",
    marketScheduleTooltip: "بورصة نيويورك (NYSE/NASDAQ) | ساعات التداول الرسمية: 9:30 ص - 4:00 م بتوقيت نيويورك",
    systemInfoTag: "تفاصيل النظام",
    clickForSystemInfo: "انقر لعرض تفاصيل المعمارية ومواصفات النظام",
    systemDetailedDesc: "منصة StockPred هي نظام تداول كمي فائق الدقة طوره فريق Stockbrokers. تجمع المنصة بين فلتر مرحلي لحساب مستويات المقاومة والتقلب (30 يوماً) ولجنة ثلاثية من نماذج الذكاء الاصطناعي (XGBoost و LightGBM) للتمييز بين الاختراقات المؤسسية الحقيقية ومصائد الثيران السعرية مع قواعد صارمة لحماية رأس المال.",
    specArchitecture: "معمارية خط المعالجة",
    specModels: "النماذج الكمية المستخدمة",
    specCapitalRules: "قواعد تخصيص رأس المال",
    specTeam: "فريق التطوير والبحث",
    close: "إغلاق",

    // Preset benchmark titles
    preset_nvda_tier1_title: "اختراق مؤسسي لسهم NVDA (إجماع المستوى الأول)",
    preset_nvda_tier1_desc: "تجاوز قوي لمستويات المقاومة بعد تجميع سعري. موافقة جماعية من الخبراء (3/3 خبراء، مركز كامل 100%).",
    preset_nvda_tier2_title: "زخم مضاربي لسهم NVDA (المستوى الثاني نصف الحجم)",
    preset_nvda_tier2_desc: "وافق صائد الزخم بينما أبدى الخبير المحافظ تحفظات. دخول بنصف الحجم (50%) مع وقف خسارة ضيق (-2.50%).",
    preset_cmcsa_tier3_title: "مصيدة ثيران كلاسيكية لسهم CMCSA (المستوى الثالث تحذير)",
    preset_cmcsa_tier3_desc: "اخترق السعر المقاومة لكنه شكل ظلاً علوياً طويلاً. رفض جماعي من النماذج (0/3 موافقة) وحماية رأس المال بالكامل!",
    preset_tsla_consolidation_title: "تجميع عرضي لسهم TSLA (حالة مستقرة)",
    preset_tsla_consolidation_desc: "يتداول السهم ضمن نطاقه الطبيعي تحت المقاومة دون استدعاء غير ضروري للنماذج الكمية.",

    // Controls
    assetEquity: "الأصل / السهم (50 سهماً أمريكياً)",
    inspectionDate: "تاريخ الفحص",
    todayLatest: "اليوم / الأحدث",
    setToLatest: "الانتقال للأحدث",
    jumpToLatestTitle: "الانتقال إلى آخر يوم تداول متاح",
    modelFocus: "التركيز على النموذج الكمي",
    modelConsensus: "إجماع الخبراء الثلاثة (استراتيجية المستويات)",
    modelConservative: "المحافظ (حماية رأس المال - XGBoost w=5.0)",
    modelBalanced: "المتوازن (تعزيز العائد - LightGBM w=3.0)",
    modelAggressive: "الهجومي (صائد الزخم - XGBoost w=1.0)",
    liveFetch: "تحديث مباشر",
    fetching: "جاري الجلب...",
    liveFetchTitle: "جلب أحدث الأسعار الحية مباشرة من Yahoo Finance",
    runAudit: "فحص كمي",
    auditingEngine: "جاري الفحص...",

    // Chart Header Metrics
    metricAuditedDate: "تاريخ الفحص المستهدف",
    metricDate: "التاريخ",
    metricClose: "الإغلاق",
    metric30dResistance: "مقاومة 30 يوماً",
    metricVolume: "حجم التداول",
    auditedDateBadge: "شمعة الفحص",
    volSurgeRef: "الحجم (مرجع الانفجار 1.20x)",

    // Decision Card
    decisionPrompt: "حدد السهم وتاريخ الفحص، ثم اضغط على \"فحص كمي\" لبدء التدقيق.",
    tacticalVerdictTitle: "القرار التكتيكي للاستراتيجية",
    tacticalVerdictSubtitle: "توجيهات التنفيذ الاستثماري وإدارة المخاطر",
    badgeConsolidation: "تجميع عرضي // نطاق طبيعي",
    badgeTier1: "المستوى 1: دخول كامل الحجم",
    badgeTier2: "المستوى 2: دخول مضاربي نصف الحجم",
    badgeTier3: "المستوى 3: تفادي الصفقة // مصيدة ثيران",
    allocationLabel: "حجم المركز الموصى به",
    consensusLabel: "إجماع لجنة النماذج",
    executionGuidanceLabel: "توجيه التنفيذ:",
    riskManagementLabel: "إدارة المخاطر:",
    screenerFailuresTitle: "أسباب عدم اجتياز فلتر الاختراق الأولي (المرحلة 1):",
    statusMessageConsolidation: "السهم في مرحلة تجميع طبيعي ضمن حدوده السعرية المعتادة. لا توجد إشارة اختراق اليوم.",

    // Tri-Expert Matrix
    triExpertHeader: "تقييم لجنة الخبراء الثلاثة",
    verdictApproved: "مقبول",
    verdictRejected: "مرفوض",
    breakoutProbability: "احتمالية الاختراق",
    expertConservativeName: "الخبير المحافظ",
    expertBalancedName: "الخبير المتوازن",
    expertAggressiveName: "الخبير الهجومي",

    // TreeSHAP
    shapTitle: "الذكاء الاصطناعي القابل للتفسير // تحليل المساهمات (TreeSHAP)",
    supportDrivers: "عوامل تدعم نجاح الاختراق (+SHAP)",
    trapRisks: "عوامل الحذر ومخاطر المصيدة (-SHAP)",
    noSupportFactors: "لا توجد عوامل إيجابية بارزة تؤيد الاختراق اليوم.",
    noDoubtFactors: "لا توجد عوامل تحذيرية سلبية بارزة (بيئة الاختراق نقية).",

    // Footer
    footerTitle: "منصة StockPred للذكاء الاصطناعي // فريق Stockbrokers // FASTAPI + REACT VITE",
    footerWinRate: "معدل الفوز: 83.3% - 90.1%",
    footerCapture: "اقتناص الفرص: 98.6%",
    footerLiveFetch: "جلب بيانات السوق المباشرة: نشط (YFINANCE)",

    // Copilot AI Assistant
    copilotButton: "المحادثة الذكية",
    copilotTitle: "مساعد StockPred الذكي",
    copilotSubtitle: "محلل مالي كمي ذكي // مدعوم بنماذج Groq السريعة ومحرك Whisper",
    copilotOnlineBadge: "المحلل الكمي متصل",
    copilotPlaceholder: "اسأل عن أي سهم أو تاريخ (مثلاً: لماذا حدث فيك آوت لسهم NVDA في مارس؟)...",
    copilotListening: "جاري الاستماع... تحدث الآن",
    copilotProcessingAudio: "جاري تحويل الصوت لنص عبر Groq Whisper...",
    copilotThinking: "جاري تدقيق المؤشرات الكمية واستخراج النتائج...",
    copilotVoiceNotSupported: "جاري تسجيل مقطع الصوت لتحليله عبر Groq Whisper...",
    copilotVoiceError: "تعذر الوصول للميكروفون، يرجى تفعيل الإذن أو الكتابة في الصندوق.",
    copilotSend: "إرسال",
    copilotViewOnChart: "عرض على الرسم البياني",
    copilotClearChat: "مسح المحادثة",
    copilotMaximize: "تكبير النافذة",
    copilotMinimize: "استعادة الحجم",
    copilotWelcome: "مرحباً بك! أنا المحلل المالي الكمي الذكي لمنصة StockPred. يمكنك سؤالي عن أسباب مصائد الثيران، فرص الاختراق، أو المؤشرات الفنية لأي سهم. اكتب سؤالك أو اضغط على أيقونة الميكروفون للتحدث صوتياً.",
    copilotQuickChip1: "لماذا اعتبر سهم NVDA مصيدة في 2024-03-15؟",
    copilotQuickChip2: "حلل أحدث إعداد لسهم آبل AAPL",
    copilotQuickChip3: "ما تفاصيل مصيدة سهم CMCSA في 2019-03-15؟"
  }
};

// Helper translation functions for dynamic backend text
export function translateAllocation(allocStr, lang) {
  if (!allocStr) return '';
  if (lang === 'en') return allocStr;
  if (allocStr.includes('100%')) return '100% (حجم المركز كاملاً)';
  if (allocStr.includes('50%')) return '50% (نصف حجم المركز)';
  if (allocStr.includes('0%')) return '0% (الوقوف جانباً / لا سيولة معرضة للمخاطرة)';
  return allocStr;
}

export function translateConsensusRate(rateStr, lang) {
  if (!rateStr) return '';
  if (lang === 'en') return rateStr;
  const match = rateStr.match(/(\d+)\/3/);
  if (match) {
    return `موافقة ${match[1]} من 3 خبراء`;
  }
  return rateStr;
}

export function translateActionGuidance(actionStr, lang) {
  if (!actionStr) return '';
  if (lang === 'en') return actionStr;
  if (actionStr.includes('STRONG LONG')) {
    return 'تنفيذ صفقة شراء قوية ومباشرة';
  }
  if (actionStr.includes('ENTER LONG WITH TIGHT STOP')) {
    return 'دخول شراء مع وقف خسارة ضيق (عدم تفويت الصعود مع تحجيم خسارة المصيدة!)';
  }
  if (actionStr.includes('AVOID TRADE')) {
    return 'تجنب الصفقة تماماً / عدم الدخول لحماية رأس المال';
  }
  return actionStr;
}

export function translateRiskManagement(riskStr, lang) {
  if (!riskStr) return '';
  if (lang === 'en') return riskStr;
  if (riskStr.includes('Standard Stop-Loss')) {
    return riskStr.replace('Standard Stop-Loss:', 'وقف خسارة قياسي:');
  }
  if (riskStr.includes('TIGHT Dynamic Stop-Loss')) {
    return riskStr
      .replace('TIGHT Dynamic Stop-Loss:', 'وقف خسارة ديناميكي ضيق:')
      .replace('or Breakeven on Day +2', 'أو نقل الوقف لنقطة الدخول باليوم +2');
  }
  if (riskStr.includes('Trade filtered to preserve capital') || riskStr.includes('N/A')) {
    return 'غير متاح - تم استبعاد الصفقة لحماية السيولة ورأس المال.';
  }
  return riskStr;
}

export function translateRationale(rationaleStr, lang) {
  if (!rationaleStr) return '';
  if (lang === 'en') return rationaleStr;
  if (rationaleStr.includes('2 or 3 experts approved')) {
    return 'تمت الموافقة من خبيرين أو 3 خبراء. النموذج يمتلك احتمالية عالية جداً لاستمرار الصعود خلال 30 يوماً (نسبة فوز ~88-90%).';
  }
  if (rationaleStr.includes('Momentum Hunter approved')) {
    return 'صائد الزخم وافق بينما أبدى الخبير المحافظ تحفظات. تخصيص نصف الحجم يستغل الصعود الكبير (+15% إلى +30%) ويحد من مخاطر المصيدة لأقل من -1.25% على المحفظة!';
  }
  if (rationaleStr.includes('All quantitative experts rejected')) {
    return 'رفض جميع الخبراء الكميين هذا النموذج. خطر مرتفع جداً لحدوث هبوط عكسي حاد ومصيدة سعرية.';
  }
  return rationaleStr;
}

export function translateScreenerReason(reason, lang) {
  if (!reason) return '';
  if (lang === 'en') return reason;

  // Price below resistance
  let match = reason.match(/Price is below 30-day resistance \(\$([0-9.]+)\) by ([0-9.]+)%/);
  if (match) {
    return `السعر أدنى من مقاومة الـ 30 يوماً ($${match[1]}) بنسبة ${match[2]}%.`;
  }
  // Clearance hurdle
  match = reason.match(/Price breached resistance but failed the 1% clearance hurdle \(\+([0-9.]+)% vs required \+1\.00%\)/);
  if (match) {
    return `اخترق السعر المقاومة لكنه لم يتجاوز هامش الأمان المطلوب 1% (+${match[1]}% مقابل +1.00%).`;
  }
  // Closing position
  match = reason.match(/Intraday closing position \(([0-9.]+)\) is weak/);
  if (match) {
    return `موقع إغلاق الشمعة اللحظي (${match[1]}) ضعيف (المطلوب >= 0.70 قرب أعلى سعر لليوم).`;
  }
  // Volume surge
  match = reason.match(/Volume surge \(([0-9.]+x)\) is below the required institutional surge/);
  if (match) {
    return `طفرة حجم التداول (${match[1]}) أقل من الحد المؤسسي المطلوب (>= 1.20x).`;
  }

  return reason;
}

export function translateExpertProfile(profileStr, lang) {
  if (!profileStr) return '';
  if (lang === 'en') return profileStr;
  if (profileStr.includes('Risk-Averse')) {
    return 'متحفظ: يركز أولاً على حماية رأس المال (نسبة فوز 90.1%، يكتشف 68% من المصائد السعرية)';
  }
  if (profileStr.includes('Dual-Optimum')) {
    return 'متوازن: يحقق توازناً مثالياً بين نسبة الفوز (85%) واقتناص الفرص (84%) عبر LightGBM';
  }
  if (profileStr.includes('Growth-Seeker')) {
    return 'هجومي: يقتنص 97.6% من جميع موجات الاختراق، معتمداً على وقف خسارة متحرك ضيق';
  }
  return profileStr;
}
