import { useState } from 'react';
import { uploadImage as uploadImageAPI } from '../api/imageAPI';

export const useImageUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = async (file, category, invitationId, subDirectory) => {
    setLoading(true);
    setError(null);
    try {
      console.log('useImageUpload: Uploading with category:', category, 'subDirectory:', subDirectory);
      const result = await uploadImageAPI(file, category, invitationId, subDirectory);
      setLoading(false);
      return result;
    } catch (err) {
      console.error('useImageUpload: Error in upload:', err);
      setError(err.message || 'An error occurred during upload');
      setLoading(false);
      throw err;
    }
  };

  return { uploadImage, loading, error };
};