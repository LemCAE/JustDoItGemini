/**
 * AETHERIA - Polaroid Photo Studio & Sanctuary Memory Journal
 */

class PolaroidStudio {
    constructor(sourceCanvas, weatherEngine, codex) {
        this.sourceCanvas = sourceCanvas;
        this.weather = weatherEngine;
        this.codex = codex;
        this.activeFilter = 'normal'; // 'normal', 'golden', 'cyanotype', 'dream'
        this.currentPhotoDataUrl = null;
    }

    captureSnapshot() {
        if (window.AudioEngine) {
            window.AudioEngine.playCameraShutter();
        }

        // Create dedicated polaroid output canvas
        const pCanvas = document.createElement('canvas');
        const pWidth = 640;
        const pHeight = 780;
        pCanvas.width = pWidth;
        pCanvas.height = pHeight;
        const pCtx = pCanvas.getContext('2d');

        // 1. Polaroid White Paper Card Stock Background with texture
        pCtx.fillStyle = '#fbfbfa';
        pCtx.fillRect(0, 0, pWidth, pHeight);

        // Subtle paper grain / vignette border
        pCtx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        pCtx.lineWidth = 1;
        pCtx.strokeRect(0, 0, pWidth, pHeight);

        // 2. Main Photo Viewport
        const photoX = 40;
        const photoY = 40;
        const photoW = 560;
        const photoH = 560;

        // Draw source canvas scaled & centered
        pCtx.save();
        pCtx.beginPath();
        pCtx.rect(photoX, photoY, photoW, photoH);
        pCtx.clip();

        // Calculate aspect fill
        const sW = this.sourceCanvas.width;
        const sH = this.sourceCanvas.height;
        const sAspect = sW / sH;
        let dW, dH, dX, dY;

        if (sAspect > 1) {
            dH = photoH;
            dW = photoH * sAspect;
            dX = photoX - (dW - photoW) * 0.5;
            dY = photoY;
        } else {
            dW = photoW;
            dH = photoW / sAspect;
            dX = photoX;
            dY = photoY - (dH - photoH) * 0.5;
        }

        pCtx.drawImage(this.sourceCanvas, dX, dY, dW, dH);

        // 3. Apply Selected Photo Filter Tint
        if (this.activeFilter === 'golden') {
            pCtx.fillStyle = 'rgba(245, 158, 11, 0.22)';
            pCtx.fillRect(photoX, photoY, photoW, photoH);
        } else if (this.activeFilter === 'cyanotype') {
            pCtx.fillStyle = 'rgba(14, 116, 144, 0.28)';
            pCtx.fillRect(photoX, photoY, photoW, photoH);
        } else if (this.activeFilter === 'dream') {
            pCtx.fillStyle = 'rgba(236, 72, 153, 0.15)';
            pCtx.fillRect(photoX, photoY, photoW, photoH);
        }

        // Inner photo border shadow
        pCtx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
        pCtx.lineWidth = 2;
        pCtx.strokeRect(photoX, photoY, photoW, photoH);

        pCtx.restore();

        // 4. Polaroid Caption & Metadata Typography
        pCtx.save();
        const now = new Date();
        const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} · ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

        // Poetic caption
        const captions = [
            '「于尘世之外，守护一捧微缩的星光生态。」',
            '「悬岛晨曦如初，晨露折射着无限的静谧。」',
            '「聆听以太之风拂过琉璃穹顶的回响。」',
            '「这一刻的静好，赠予明日醒来的你。」',
            '「愿生活如同绽放的星辉，温柔且充满奇迹。」'
        ];
        const caption = captions[Math.floor(Math.random() * captions.length)];

        // Title
        pCtx.font = 'bold 20px "Segoe UI", system-ui, sans-serif';
        pCtx.fillStyle = '#1e293b';
        pCtx.fillText('AETHERIA · 浮光秘境', photoX + 6, photoY + photoH + 48);

        // Caption
        pCtx.font = 'italic 14px "Segoe UI", system-ui, sans-serif';
        pCtx.fillStyle = '#64748b';
        pCtx.fillText(caption, photoX + 6, photoY + photoH + 82);

        // Date & Seal Stamp
        pCtx.font = '12px monospace';
        pCtx.fillStyle = '#94a3b8';
        pCtx.fillText(dateStr, photoX + 6, photoY + photoH + 112);

        // Tiny Decorative Gold Seal Stamp
        pCtx.strokeStyle = '#d97706';
        pCtx.lineWidth = 1.5;
        pCtx.strokeRect(pWidth - photoX - 90, photoY + photoH + 45, 84, 52);
        pCtx.font = '10px sans-serif';
        pCtx.fillStyle = '#b45309';
        pCtx.textAlign = 'center';
        pCtx.fillText('★ CELESTIAL ★', pWidth - photoX - 48, photoY + photoH + 68);
        pCtx.fillText('ARCHIVE', pWidth - photoX - 48, photoY + photoH + 84);

        pCtx.restore();

        this.currentPhotoDataUrl = pCanvas.toDataURL('image/png');

        // Unlock achievement
        this.codex.unlockAchievement('polaroid_master');

        return this.currentPhotoDataUrl;
    }

    downloadSnapshot() {
        if (!this.currentPhotoDataUrl) return;
        const now = new Date();
        const filename = `aetheria_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${now.getHours()}${now.getMinutes()}.png`;
        const link = document.createElement('a');
        link.href = this.currentPhotoDataUrl;
        link.download = filename;
        link.click();
    }
}

window.PolaroidStudio = PolaroidStudio;
