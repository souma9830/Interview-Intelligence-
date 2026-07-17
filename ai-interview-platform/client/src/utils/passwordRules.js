export const calculatePasswordStrength = (password) => {
  if (!password) return { score: 0, label: 'Very Weak', color: '#ef4444' };
  
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  switch (score) {
    case 0:
    case 1:
      return { score, label: 'Very Weak', color: '#ef4444' };
    case 2:
      return { score, label: 'Weak', color: '#f97316' };
    case 3:
      return { score, label: 'Medium', color: '#eab308' };
    case 4:
      return { score, label: 'Strong', color: '#22c55e' };
    case 5:
    default:
      return { score, label: 'Very Strong', color: '#10b981' };
  }
};
