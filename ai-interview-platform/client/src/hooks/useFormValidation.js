import { useState, useCallback } from 'react';

const EMAIL_REGEX = /\S+@\S+\.\S+/;

const validators = {
  required: (val, field) => (!val || !String(val).trim() ? `${field} is required` : ''),
  email: (val) => (!EMAIL_REGEX.test(val) ? 'Enter a valid email address' : ''),
  minLength: (min) => (val) => (String(val).length < min ? `At least ${min} characters` : ''),
  password: (val) => {
    if (!val) return 'Password is required';
    if (val.length < 6) return 'At least 6 characters';
    return '';
  },
  otp: (val) => {
    if (!val) return 'OTP is required';
    if (!/^\d{6}$/.test(val)) return 'OTP must be exactly 6 numeric digits';
    return '';
  },
  name: (val) => {
    if (!val || !String(val).trim()) return 'Full name is required';
    return '';
  },
};

export function useFormValidation(fields) {
  const [errors, setErrors] = useState({});

  const validate = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    fields.forEach(({ name, rules, label }) => {
      const value = rules.value !== undefined ? rules.value : '';
      for (const rule of rules.checks || []) {
        const error = rule(value, label || name);
        if (error) {
          newErrors[name] = error;
          isValid = false;
          break;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [fields]);

  const clearError = useCallback((name) => {
    setErrors(prev => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => setErrors({}), []);

  return { errors, validate, clearError, clearAll };
}

export { validators };

export function createField(name, value, checks, label) {
  return { name, rules: { value, checks }, label };
}