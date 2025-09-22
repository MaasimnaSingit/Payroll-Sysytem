import React from 'react';

export default function PhotoPreviewModal({ photos, onClose }) {
    const { photo_in, photo_out } = photos;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-panel rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Attendance Photos</h2>
                        <button
                            className="btn btn-ghost"
                            onClick={onClose}
                        >
                            ×
                        </button>
                    </div>

                    {/* Photos Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Clock In Photo */}
                        {photo_in && (
                            <div>
                                <h3 className="text-lg font-medium mb-2">Clock In Photo</h3>
                                <div className="relative aspect-video rounded-lg overflow-hidden bg-panel-2">
                                    <img
                                        src={photo_in}
                                        alt="Clock In"
                                        className="absolute inset-0 w-full h-full object-contain"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Clock Out Photo */}
                        {photo_out && (
                            <div>
                                <h3 className="text-lg font-medium mb-2">Clock Out Photo</h3>
                                <div className="relative aspect-video rounded-lg overflow-hidden bg-panel-2">
                                    <img
                                        src={photo_out}
                                        alt="Clock Out"
                                        className="absolute inset-0 w-full h-full object-contain"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* No Photos Message */}
                    {!photo_in && !photo_out && (
                        <div className="text-center text-muted py-8">
                            No photos available
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Optimization */}
            <style jsx>{`
                @media (max-width: 640px) {
                    .fixed {
                        padding: 0.5rem;
                    }

                    .p-6 {
                        padding: 1rem;
                    }

                    .gap-6 {
                        gap: 1rem;
                    }
                }
            `}</style>
        </div>
    );
}
