import React from 'react';
import Modal from './Modal';

export default function Lightbox({ open, onClose, src, meta }) {
  return (
    <Modal open={open} onClose={onClose} maxWidth={1040}>
      <div style={{ padding: 12, display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="kpi-title">Attendance Proof</div>
            {meta && <div className="note">{meta}</div>}
          </div>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        <div style={{ display: 'grid', placeItems: 'center', background: '#0b1220', borderRadius: 14, padding: 12 }}>
          {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
          <img src={src} alt="Proof photo" style={{ maxWidth: '100%', height: 'auto', borderRadius: 12 }} />
        </div>
      </div>
    </Modal>
  );
}


