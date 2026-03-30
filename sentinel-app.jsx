import { useState, useEffect, useRef } from "react";

const WEBHOOK_URL = "https://wissamaljaberi.app.n8n.cloud/webhook/epidemic-sentinel";

const districts = ["كربلاء", "الهندية", "عين التمر", "الحر"];
const animalTypes = ["أبقار", "أغنام", "ماعز", "دواجن", "خيول", "جمال / إبل", "أسماك", "كلاب / قطط", "أخرى"];
const diseases = [
  "حمى قلاعية (FMD)", "طاعون المجترات الصغيرة (PPR)", "الحمى النزفية",
  "الجدري (Pox)", "السل البقري (Bovine TB)", "البروسيلا (Brucellosis)",
  "انفلونزا الطيور", "داء الكلب (Rabies)", "الجمرة الخبيثة (Anthrax)",
  "نفوق جماعي مفاجئ", "أعراض عصبية غير مشخصة", "إسهال دموي حاد",
  "أعراض تنفسية حادة", "إجهاض وبائي", "حالة أخرى"
];
const severityLevels = [
  { label: "منخفض — حالة فردية", value: "🟢 منخفض - حالة فردية معزولة", color: "#16a34a", bg: "#dcfce7", icon: "🟢" },
  { label: "متوسط — عدة حالات", value: "🟡 متوسط - عدة حالات في نفس القطيع", color: "#d97706", bg: "#fef3c7", icon: "🟡" },
  { label: "مرتفع — انتشار واسع", value: "🔴 مرتفع - انتشار واسع أو نفوق جماعي", color: "#dc2626", bg: "#fee2e2", icon: "🔴" },
];
const vaccinationOpts = ["نعم - تم التلقيح", "لا - لم يتم التلقيح", "غير متأكد"];

const steps = [
  { id: 0, title: "معلومات المُبلِّغ", icon: "👤" },
  { id: 1, title: "تفاصيل الحالة", icon: "🦠" },
  { id: 2, title: "التقييم والملاحظات", icon: "📋" },
];

function cn(...classes) { return classes.filter(Boolean).join(" "); }

function Select({ label, value, onChange, options, required, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative", marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: "12px 14px", borderRadius: 12, border: "1.5px solid", cursor: "pointer",
          borderColor: open ? "#3b82f6" : "#e2e8f0", background: "#fff",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          transition: "border-color 0.2s", fontSize: 14,
          boxShadow: open ? "0 0 0 3px rgba(59,130,246,0.1)" : "none",
        }}
      >
        <span style={{ color: value ? "#1e293b" : "#94a3b8" }}>{value || placeholder || "اختر..."}</span>
        <span style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", fontSize: 10, color: "#94a3b8" }}>▼</span>
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "100%", right: 0, left: 0, zIndex: 50, marginTop: 4,
          background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
          boxShadow: "0 12px 40px rgba(0,0,0,0.12)", maxHeight: 220, overflowY: "auto",
        }}>
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                padding: "11px 14px", fontSize: 14, cursor: "pointer",
                background: value === opt ? "#eff6ff" : "transparent",
                color: value === opt ? "#2563eb" : "#334155",
                fontWeight: value === opt ? 600 : 400,
                borderBottom: "1px solid #f1f5f9",
              }}
              onMouseEnter={e => e.target.style.background = value === opt ? "#eff6ff" : "#f8fafc"}
              onMouseLeave={e => e.target.style.background = value === opt ? "#eff6ff" : "transparent"}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required, placeholder, multiline }) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <Tag
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={multiline ? 3 : undefined}
        style={{
          width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e2e8f0",
          fontSize: 14, color: "#1e293b", background: "#fff", outline: "none",
          fontFamily: "inherit", resize: multiline ? "vertical" : "none", direction: "rtl",
          boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s",
        }}
        onFocus={e => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
        onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

function RadioGroup({ label, value, onChange, options, required, renderOption }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 10 }}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map((opt) => {
          const optVal = typeof opt === "string" ? opt : opt.value;
          const selected = value === optVal;
          return renderOption ? renderOption(opt, selected, () => onChange(optVal)) : (
            <div
              key={optVal}
              onClick={() => onChange(optVal)}
              style={{
                padding: "12px 14px", borderRadius: 12, cursor: "pointer",
                border: `1.5px solid ${selected ? "#3b82f6" : "#e2e8f0"}`,
                background: selected ? "#eff6ff" : "#fff",
                fontSize: 14, color: selected ? "#1d4ed8" : "#475569",
                fontWeight: selected ? 600 : 400, transition: "all 0.2s",
              }}
            >
              {optVal}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function EpidemicSentinelApp() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [slideDir, setSlideDir] = useState("next");

  const [form, setForm] = useState({
    reporter_name: "", reporter_phone: "", address: "", district: "",
    animal_type: "", disease_case: "", affected_count: "", death_count: "",
    symptom_date: "", severity: "", vaccination_status: "", reasons: "",
  });

  const set = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  const canNext = () => {
    if (step === 0) return form.reporter_name && form.reporter_phone && form.address && form.district;
    if (step === 1) return form.animal_type && form.disease_case && form.affected_count && form.symptom_date;
    if (step === 2) return form.severity && form.vaccination_status;
    return false;
  };

  const goNext = () => { if (step < 2) { setSlideDir("next"); setStep(step + 1); } };
  const goPrev = () => { if (step > 0) { setSlideDir("prev"); setStep(step - 1); } };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("فشل الإرسال");
      setSubmitted(true);
    } catch (e) {
      setError("حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.");
    }
    setSubmitting(false);
  };

  const reset = () => {
    setForm({
      reporter_name: "", reporter_phone: "", address: "", district: "",
      animal_type: "", disease_case: "", affected_count: "", death_count: "",
      symptom_date: "", severity: "", vaccination_status: "", reasons: "",
    });
    setStep(0);
    setSubmitted(false);
    setError(null);
  };

  if (submitted) {
    return (
      <div dir="rtl" style={{ fontFamily: "'Noto Kufi Arabic', 'Tajawal', sans-serif", minHeight: "100vh", background: "linear-gradient(160deg, #ecfdf5, #f0fdf4, #dcfce7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ textAlign: "center", maxWidth: 380 }}>
          <div style={{ width: 100, height: 100, borderRadius: "50%", background: "#22c55e", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, boxShadow: "0 8px 32px rgba(34,197,94,0.3)", animation: "pop 0.5s cubic-bezier(0.175,0.885,0.32,1.275)" }}>
            ✓
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#166534", margin: "0 0 12px" }}>تم إرسال البلاغ بنجاح!</h2>
          <p style={{ fontSize: 15, color: "#4ade80", lineHeight: 1.7, margin: "0 0 32px" }}>
            سيتم التواصل معك قريباً من قبل الفريق البيطري المختص. شكراً لمساهمتك في حماية الثروة الحيوانية.
          </p>
          <button onClick={reset} style={{
            padding: "14px 40px", borderRadius: 14, border: "none", fontSize: 16, fontWeight: 700,
            background: "#166534", color: "#fff", cursor: "pointer", fontFamily: "inherit",
          }}>
            بلاغ جديد
          </button>
        </div>
        <style>{`@keyframes pop { 0% { transform: scale(0); } 100% { transform: scale(1); } }`}</style>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ fontFamily: "'Noto Kufi Arabic', 'Tajawal', sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ─── Header ─── */}
      <div style={{
        background: "linear-gradient(135deg, #991b1b 0%, #dc2626 40%, #ef4444 100%)",
        padding: "28px 20px 60px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -30, left: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ textAlign: "center", position: "relative" }}>
          <div style={{ fontSize: 36, marginBottom: 8, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.2))" }}>🛡️</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 4px", letterSpacing: -0.5 }}>الحارس الوبائي</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: 0, fontWeight: 500 }}>نظام التبليغ الوبائي البيطري</p>
        </div>
      </div>

      {/* ─── Card Container ─── */}
      <div style={{ margin: "-36px 16px 0", position: "relative", zIndex: 10 }}>
        <div style={{
          background: "#fff", borderRadius: 20, padding: "24px 20px 20px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
        }}>
          {/* ─── Step Indicator ─── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, gap: 4 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 12,
                  background: i === step ? "#dc2626" : i < step ? "#22c55e" : "#f1f5f9",
                  color: i <= step ? "#fff" : "#94a3b8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 700, transition: "all 0.3s",
                  boxShadow: i === step ? "0 4px 12px rgba(220,38,38,0.3)" : "none",
                }}>
                  {i < step ? "✓" : s.icon}
                </div>
                {i < steps.length - 1 && (
                  <div style={{ width: 40, height: 3, borderRadius: 2, margin: "0 4px", background: i < step ? "#22c55e" : "#e2e8f0", transition: "background 0.3s" }} />
                )}
              </div>
            ))}
          </div>

          {/* ─── Step Title ─── */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1e293b", margin: "0 0 4px" }}>{steps[step].title}</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>الخطوة {step + 1} من {steps.length}</p>
          </div>

          {/* ─── Form Steps ─── */}
          <div style={{ minHeight: 320 }}>
            {step === 0 && (
              <div>
                <Input label="الاسم الكامل" value={form.reporter_name} onChange={set("reporter_name")} required placeholder="الاسم الثلاثي" />
                <Input label="رقم الهاتف" value={form.reporter_phone} onChange={set("reporter_phone")} required placeholder="07XXXXXXXXX" />
                <Input label="العنوان التفصيلي" value={form.address} onChange={set("address")} required placeholder="المحلة، الشارع، أقرب نقطة دالة" multiline />
                <Select label="القضاء" value={form.district} onChange={set("district")} options={districts} required placeholder="اختر القضاء" />
              </div>
            )}

            {step === 1 && (
              <div>
                <Select label="نوع الحيوان" value={form.animal_type} onChange={set("animal_type")} options={animalTypes} required placeholder="اختر نوع الحيوان" />
                <Select label="الحالة المرضية" value={form.disease_case} onChange={set("disease_case")} options={diseases} required placeholder="اختر الحالة المشتبه بها" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Input label="العدد المصاب" value={form.affected_count} onChange={set("affected_count")} type="number" required placeholder="0" />
                  <Input label="حالات النفوق" value={form.death_count} onChange={set("death_count")} type="number" placeholder="0" />
                </div>
                <Input label="تاريخ ظهور الأعراض" value={form.symptom_date} onChange={set("symptom_date")} type="date" required />
              </div>
            )}

            {step === 2 && (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 10 }}>
                    مستوى الخطورة <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {severityLevels.map((sev) => {
                      const sel = form.severity === sev.value;
                      return (
                        <div
                          key={sev.value}
                          onClick={() => set("severity")(sev.value)}
                          style={{
                            padding: "14px 16px", borderRadius: 14, cursor: "pointer",
                            border: `2px solid ${sel ? sev.color : "#e2e8f0"}`,
                            background: sel ? sev.bg : "#fff",
                            display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s",
                          }}
                        >
                          <span style={{ fontSize: 22 }}>{sev.icon}</span>
                          <span style={{ fontSize: 14, fontWeight: sel ? 700 : 500, color: sel ? sev.color : "#475569" }}>{sev.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <RadioGroup label="حالة التلقيح" value={form.vaccination_status} onChange={set("vaccination_status")} options={vaccinationOpts} required />
                <Input label="ملاحظات إضافية" value={form.reasons} onChange={set("reasons")} placeholder="معلومات تساعد الفريق البيطري..." multiline />
              </div>
            )}
          </div>

          {/* ─── Error ─── */}
          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12,
              padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#dc2626", textAlign: "center",
            }}>
              {error}
            </div>
          )}

          {/* ─── Navigation ─── */}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            {step > 0 && (
              <button onClick={goPrev} style={{
                flex: 1, padding: "14px 0", borderRadius: 14, border: "1.5px solid #e2e8f0",
                background: "#fff", fontSize: 15, fontWeight: 600, color: "#64748b",
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
              }}>
                السابق
              </button>
            )}
            {step < 2 ? (
              <button
                onClick={goNext}
                disabled={!canNext()}
                style={{
                  flex: 2, padding: "14px 0", borderRadius: 14, border: "none",
                  background: canNext() ? "linear-gradient(135deg, #dc2626, #b91c1c)" : "#e2e8f0",
                  fontSize: 15, fontWeight: 700,
                  color: canNext() ? "#fff" : "#94a3b8",
                  cursor: canNext() ? "pointer" : "not-allowed",
                  fontFamily: "inherit", transition: "all 0.3s",
                  boxShadow: canNext() ? "0 4px 16px rgba(220,38,38,0.3)" : "none",
                }}
              >
                التالي →
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={!canNext() || submitting}
                style={{
                  flex: 2, padding: "14px 0", borderRadius: 14, border: "none",
                  background: canNext() && !submitting ? "linear-gradient(135deg, #dc2626, #991b1b)" : "#e2e8f0",
                  fontSize: 15, fontWeight: 700,
                  color: canNext() && !submitting ? "#fff" : "#94a3b8",
                  cursor: canNext() && !submitting ? "pointer" : "not-allowed",
                  fontFamily: "inherit", transition: "all 0.3s",
                  boxShadow: canNext() && !submitting ? "0 4px 16px rgba(220,38,38,0.4)" : "none",
                }}
              >
                {submitting ? "جاري الإرسال..." : "🚨 إرسال البلاغ"}
              </button>
            )}
          </div>
        </div>

        {/* ─── Footer ─── */}
        <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", margin: "16px 0", fontWeight: 500 }}>
          🛡️ نظام الحارس الوبائي — المستشفى البيطري العام — كربلاء
        </p>
      </div>
    </div>
  );
}
