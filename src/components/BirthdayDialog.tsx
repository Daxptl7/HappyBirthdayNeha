import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function BirthdayDialog({ title, onClose, children, className = '' }: { title: string; onClose: () => void; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const labelId = useId();
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = previous; };
  }, []);
  return <dialog className={`birthday-dialog ${className}`} ref={ref} aria-labelledby={labelId} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose(); } }}>
    <button className="dialog-close round-button" aria-label="Close surprise" autoFocus onClick={onClose}><X size={18} /></button>
    <h2 id={labelId}>{title}</h2>
    {children}
  </dialog>;
}
