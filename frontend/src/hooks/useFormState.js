import { useState } from "react";

/**
 * State form generik: nilai, error, dan validasi per field.
 * `rules` berisi fungsi validasi per nama field yang mengembalikan pesan error ("" = valid).
 */
export function useFormState({ initialValues, rules }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const validate = (name, value) => {
    const message = rules[name]?.(value) ?? "";
    setErrors((prev) => ({ ...prev, [name]: message }));
    return message;
  };

  /** Props siap pakai untuk input: id, name, value, error, onChange, onBlur */
  const field = (name, { format } = {}) => ({
    id: name,
    name,
    value: values[name],
    error: errors[name],
    onChange: (e) => {
      const next = format ? format(e.target.value) : e.target.value;
      setValues((prev) => ({ ...prev, [name]: next }));
      if (errors[name]) validate(name, next);
    },
    onBlur: (e) => validate(name, e.target.value),
  });

  /** Validasi semua field. Return nama field pertama yang tidak valid (atau null). */
  const validateAll = () => {
    const next = {};
    let firstInvalid = null;
    for (const name of Object.keys(values)) {
      const message = rules[name]?.(values[name]) ?? "";
      next[name] = message;
      if (message && !firstInvalid) firstInvalid = name;
    }
    setErrors(next);
    return firstInvalid;
  };

  return { values, errors, field, validateAll };
}
