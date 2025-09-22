import React from 'react';
import Modal from './Modal.jsx';

export default function ConfirmModal({ open, title='Confirm', body='Are you sure?', confirmText='Confirm', cancelText='Cancel', onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onCancel} maxWidth={520}>
      <div style={{ padding:16, display:'grid', gap:12 }}>
        <div className="kpi-title">{title}</div>
        <div className="note">{body}</div>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button className="btn" onClick={onCancel}>{cancelText}</button>
          <button className="btn-primary" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </Modal>
  );
}


