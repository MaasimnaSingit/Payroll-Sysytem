import React, { useRef, useState, useEffect } from 'react';

export default function PhotoCapture({ onCapture, onError }) {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const [isMobile] = useState(/iPhone|iPad|Android/i.test(navigator.userAgent));
    const [orientation, setOrientation] = useState(window.screen.orientation?.type || 'portrait');

    // Handle orientation changes
    useEffect(() => {
        function handleOrientation() {
            setOrientation(window.screen.orientation?.type || 'portrait');
        }
        window.addEventListener('orientationchange', handleOrientation);
        return () => window.removeEventListener('orientationchange', handleOrientation);
    }, []);

    // Stop camera on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    async function startCamera() {
        try {
            setError(null);
            const constraints = {
                video: {
                    facingMode: isMobile ? 'environment' : 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                }
            };

            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            videoRef.current.srcObject = mediaStream;
            setStream(mediaStream);

            // Wait for video to be ready
            await new Promise(resolve => {
                videoRef.current.onloadedmetadata = resolve;
            });

            // Start playing
            await videoRef.current.play();

        } catch (err) {
            console.error('Camera error:', err);
            setError('Could not access camera. Please check permissions.');
            if (onError) onError(err);
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }

    function capture() {
        if (!videoRef.current) return;

        const video = videoRef.current;
        const canvas = document.createElement('canvas');

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        // Compress and convert to JPEG
        const photo = canvas.toDataURL('image/jpeg', 0.7);
        onCapture(photo);
        stopCamera();
    }

    return (
        <div className="photo-capture">
            {/* Camera Preview */}
            <div className={`relative ${orientation.includes('landscape') ? 'landscape' : 'portrait'}`}>
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={`rounded-lg w-full max-w-md mx-auto ${stream ? 'block' : 'hidden'}`}
                    style={{ 
                        backgroundColor: '#000',
                        aspectRatio: '16/9',
                        transform: isMobile ? 'scaleX(-1)' : 'none'
                    }}
                />
                
                {stream && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                        <button
                            className="btn btn-primary px-6 py-2 rounded-full shadow-lg"
                            onClick={capture}
                        >
                            Capture
                        </button>
                        <button
                            className="btn btn-ghost px-6 py-2 rounded-full shadow-lg"
                            onClick={stopCamera}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                    <p className="mb-2">{error}</p>
                    <button 
                        className="btn btn-ghost text-sm"
                        onClick={() => {
                            setError(null);
                            startCamera();
                        }}
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Start Camera Button */}
            {!stream && !error && (
                <button
                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                    onClick={startCamera}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    {isMobile ? 'Open Camera' : 'Start Webcam'}
                </button>
            )}

            {/* Mobile Instructions */}
            {isMobile && !stream && !error && (
                <p className="text-sm text-tertiary mt-2 text-center">
                    Please allow camera access when prompted
                </p>
            )}

            {/* Camera Styles */}
            <style jsx>{`
                .photo-capture {
                    width: 100%;
                    max-width: 100vw;
                    overflow: hidden;
                }

                .portrait video {
                    max-height: 80vh;
                }

                .landscape video {
                    max-width: 100vw;
                    max-height: 80vh;
                }

                @media (max-width: 640px) {
                    .btn {
                        font-size: 14px;
                        padding: 8px 16px;
                    }
                }
            `}</style>
        </div>
    );
}
