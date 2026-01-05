// Image compression and validation utilities
// Fixes BUG-018: Task image size limits
// Fixes BUG-022: Profile photo compression

export class ImageUtils {
    // Maximum file sizes
    static readonly MAX_PROFILE_PHOTO_SIZE = 500 * 1024; // 500KB
    static readonly MAX_TASK_IMAGE_SIZE = 1024 * 1024; // 1MB

    // Allowed formats
    static readonly ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    /**
     * Validate image file
     */
    static validateImage(file: File, maxSize: number): { valid: boolean; error?: string } {
        // Check file type
        if (!this.ALLOWED_FORMATS.includes(file.type)) {
            return {
                valid: false,
                error: 'Invalid file format. Please use JPG, PNG, or WebP.'
            };
        }

        // Check file size
        if (file.size > maxSize) {
            const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
            return {
                valid: false,
                error: `File size exceeds ${maxSizeMB}MB limit.`
            };
        }

        return { valid: true };
    }

    /**
     * Compress image to target size
     */
    static async compressImage(
        file: File,
        maxWidth: number = 800,
        maxHeight: number = 800,
        quality: number = 0.8
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();

                img.onload = () => {
                    // Calculate new dimensions
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width = width * ratio;
                        height = height * ratio;
                    }

                    // Create canvas and compress
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Failed to get canvas context'));
                        return;
                    }

                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to base64 with compression
                    const compressed = canvas.toDataURL('image/jpeg', quality);
                    resolve(compressed);
                };

                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target?.result as string;
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Compress profile photo
     */
    static async compressProfilePhoto(file: File): Promise<string> {
        const validation = this.validateImage(file, this.MAX_PROFILE_PHOTO_SIZE * 2); // Allow 2x for compression

        if (!validation.valid) {
            throw new Error(validation.error);
        }

        return this.compressImage(file, 400, 400, 0.85);
    }

    /**
     * Compress task image
     */
    static async compressTaskImage(file: File): Promise<string> {
        const validation = this.validateImage(file, this.MAX_TASK_IMAGE_SIZE * 2); // Allow 2x for compression

        if (!validation.valid) {
            throw new Error(validation.error);
        }

        return this.compressImage(file, 800, 800, 0.8);
    }

    /**
     * Get image size from base64 string
     */
    static getBase64Size(base64: string): number {
        const stringLength = base64.length - 'data:image/png;base64,'.length;
        const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383812;
        return sizeInBytes;
    }

    /**
     * Format bytes to human readable
     */
    static formatBytes(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
}
