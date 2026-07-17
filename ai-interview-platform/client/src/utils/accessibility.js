export function announceToScreenReader(message, priority = 'polite') {
  const el = document.getElementById('sr-announcements');
  if (el) {
    el.textContent = '';
    requestAnimationFrame(() => {
      el.textContent = message;
    });
  }
}

export function getAriaInvalid(errors) {
  return errors ? 'true' : 'false';
}

export function getErrorId(fieldName) {
  return `error-${fieldName}`;
}

export function setFocus(id) {
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    if (el) el.focus();
  });
}

export const ARIA_LIVE_REGION_STYLES = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0',
};
