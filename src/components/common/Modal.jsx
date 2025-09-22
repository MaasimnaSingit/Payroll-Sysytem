import React from 'react';

export default function Modal({ open = false, title, onClose, children }) {
  if (!open) return null;

  const stop = (e) => e.stopPropagation();

  return (
    <div
      className="cmpdal-veil"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Dialog'}
      onClick={onClose}
    >
      <div className="panel" style={{ width: 'min(560px, 92vw)' }} onClick={stop}>
        {(title || onClose) && (
          <div className="panel-hdr">
            {title && <h3 className="panel-title">{title}</h3>}
            {onClose && (
              <button className="icon-btn" aria-label="Close dialog" onClick={onClose}>
                ×
              </button>
            )}
          </div>
        )}
        <div className="panel-body">{children}</div>
      </div>
    </div>
  );
}

