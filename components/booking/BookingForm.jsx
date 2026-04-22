"use client";

import { useState } from "react";
import { Button } from "@/components/ui/primitives";

const FIELDS = [
  { id: "name",     label: "Full Name",     type: "text",     placeholder: "e.g. Kwame Asante",       required: true  },
  { id: "phone",    label: "Phone Number",  type: "tel",      placeholder: "e.g. 0244 123 456",       required: true  },
  { id: "email",    label: "Email (opt.)",  type: "email",    placeholder: "for booking confirmation", required: false },
  { id: "location", label: "Your Location", type: "text",     placeholder: "e.g. Kumasi, Adum",       required: true  },
  { id: "notes",    label: "Notes (opt.)",  type: "textarea", placeholder: "Any additional details…", required: false },
];

export default function BookingForm({ onSubmit, loading }) {
  const [values,  setValues]  = useState({ name: "", phone: "", email: "", location: "", notes: "" });
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});

  const validate = () => {
    const e = {};
    if (!values.name.trim())     e.name     = "Name is required";
    if (!values.phone.trim())    e.phone    = "Phone number is required";
    if (!values.location.trim()) e.location = "Location is required";
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      e.email = "Enter a valid email";
    return e;
  };

  const handleChange = (id, value) => {
    setValues(v => ({ ...v, [id]: value }));
    if (touched[id]) {
      const newErrors = validate();
      setErrors(e => ({ ...e, [id]: newErrors[id] }));
    }
  };

  const handleBlur = (id) => {
    setTouched(t => ({ ...t, [id]: true }));
    setErrors(e => ({ ...e, [id]: validate()[id] }));
  };

  const handleSubmit = () => {
    const allTouched = Object.fromEntries(FIELDS.map(f => [f.id, true]));
    setTouched(allTouched);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) onSubmit?.(values);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {FIELDS.map(field => {
        const hasError = touched[field.id] && errors[field.id];
        return (
          <div key={field.id}>
            <label style={{
              display: "block", fontSize: 12, fontWeight: 700,
              color: "#5A8FAA", marginBottom: 6, letterSpacing: 0.3,
            }}>
              {field.label}
              {field.required && <span style={{ color: "#FF3366" }}> *</span>}
            </label>
            {field.type === "textarea" ? (
              <textarea
                value={values[field.id]}
                onChange={e => handleChange(field.id, e.target.value)}
                onBlur={() => handleBlur(field.id)}
                placeholder={field.placeholder}
                rows={3}
                style={inputStyle(hasError)}
              />
            ) : (
              <input
                type={field.type}
                value={values[field.id]}
                onChange={e => handleChange(field.id, e.target.value)}
                onBlur={() => handleBlur(field.id)}
                placeholder={field.placeholder}
                style={inputStyle(hasError)}
              />
            )}
            {hasError && (
              <div style={{ fontSize: 11, color: "#FF3366", marginTop: 4 }}>⚠ {errors[field.id]}</div>
            )}
          </div>
        );
      })}
      <Button onClick={handleSubmit} variant="primary" size="lg" fullWidth style={{ marginTop: 8 }}>
        {loading ? "Processing…" : "Proceed to Payment →"}
      </Button>
      <p style={{ fontSize: 11, color: "#2D5570", textAlign: "center", lineHeight: 1.5 }}>
        Your details are encrypted. A deposit is required to confirm your slot.
      </p>
    </div>
  );
}

const inputStyle = (hasError) => ({
  width: "100%", background: "#081318",
  border: `1px solid ${hasError ? "#FF3366" : "#153042"}`,
  borderRadius: 10, padding: "12px 14px",
  color: "#E2F0F8", fontSize: 14,
  fontFamily: "inherit", outline: "none",
  transition: "border-color 0.2s", resize: "vertical",
});
