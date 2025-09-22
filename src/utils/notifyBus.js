// tiny pub/sub for app toasts
const listeners = new Set();
export function notify({ type = 'info', message = '' }) {
  listeners.forEach((fn) => fn({ id: `${Date.now()}-${Math.random()}`, type, message }));
}
export function onNotify(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}


