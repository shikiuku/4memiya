/**
 * Simple video compression (resizing) to 480p using Canvas and MediaRecorder.
 * Note: This records in real-time, so it takes as long as the video length.
 */
export async function compressVideoTo480p(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.muted = true;
        video.playsInline = true;

        video.onloadedmetadata = () => {
            const targetHeight = 480;
            const targetWidth = Math.round((video.videoWidth / video.videoHeight) * targetHeight);

            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            const stream = canvas.captureStream(30); // 30 FPS
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp8',
                videoBitsPerSecond: 1000000 // 1Mbps for 480p is usually decent
            });

            const chunks: Blob[] = [];
            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                resolve(blob);
                URL.revokeObjectURL(video.src);
            };

            video.play();
            mediaRecorder.start();

            const drawFrame = () => {
                if (video.paused || video.ended) {
                    mediaRecorder.stop();
                    return;
                }
                ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
                requestAnimationFrame(drawFrame);
            };

            drawFrame();
            video.onended = () => {
                if (mediaRecorder.state !== 'inactive') {
                    mediaRecorder.stop();
                }
            };
        };

        video.onerror = (err) => reject(err);
    });
}
