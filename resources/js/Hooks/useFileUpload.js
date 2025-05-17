import { useState } from 'react';

/**
 * Custom hook for handling file uploads
 */
export function useFileUpload() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);

    /**
     * Upload a file to the server
     *
     * @param {File} file - The file to upload
     * @param {string} endpoint - The API endpoint
     * @returns {Promise<string>} - The file path from the server
     */
    const uploadFile = async (file, endpoint = '/upload-image') => {
        if (!file) {
            return null;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setError(null);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const xhr = new XMLHttpRequest();

            // Create a promise to handle the XHR request
            const uploadPromise = new Promise((resolve, reject) => {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const progress = Math.round((event.loaded / event.total) * 100);
                        setUploadProgress(progress);
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response.path);
                    } else {
                        reject(new Error(`Upload failed with status ${xhr.status}`));
                    }
                });

                xhr.addEventListener('error', () => {
                    reject(new Error('Upload failed'));
                });

                xhr.addEventListener('abort', () => {
                    reject(new Error('Upload aborted'));
                });
            });

            xhr.open('POST', endpoint, true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.send(formData);

            const path = await uploadPromise;
            setIsUploading(false);
            setUploadProgress(100);
            return path;
        } catch (err) {
            setIsUploading(false);
            setError(err.message);
            throw err;
        }
    };

    /**
     * Cancel the current upload
     */
    const cancelUpload = () => {
        // This would need access to the XHR object
        // For now, we'll just reset the state
        setIsUploading(false);
        setUploadProgress(0);
        setError(null);
    };

    return {
        uploadFile,
        cancelUpload,
        isUploading,
        uploadProgress,
        error
    };
}
