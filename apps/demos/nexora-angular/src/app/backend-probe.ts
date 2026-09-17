import { createNexoraBackend } from '@slotted/demo-nexora-operations';

export function probeSession(report: (text: string) => void): void {
  setTimeout(() => {
    const started = performance.now();
    const api = createNexoraBackend({ scale: 'light', latency: 'normal' });
    const created = performance.now();
    void api.session.get().then((s) => report(`${s.user.displayName} · ${s.permissions.length} permissions · seed ${Math.round(created - started)} ms · session ${Math.round(performance.now() - created)} ms`));
  }, 0);
}
