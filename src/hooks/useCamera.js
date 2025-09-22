import { useEffect, useRef, useState } from 'react';

export default function useCamera() {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let stream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch (e) {
        setError('Camera not available. Please allow camera permissions.');
      }
    })();
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, []);

  const snap = () => {
    if (!videoRef.current) return null;
    const v = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth; canvas.height = v.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    return canvas;
  };

  return { videoRef, ready, error, snap };
}


