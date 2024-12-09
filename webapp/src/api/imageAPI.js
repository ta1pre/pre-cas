// src/api/imageAPI.js
import axios from 'axios';

const BASE_URL = `${process.env.REACT_APP_IMAGE_SERVER_URL}/img`;

export const uploadImage = async (imageBlob, category, invitationId, width, height, subDirectory, fileName) => {
  const formData = new FormData();
  formData.append('file', imageBlob, fileName);
  formData.append('category', category);
  formData.append('width', width);
  formData.append('height', height);
  
  if (subDirectory) {
    formData.append('sub_directory', subDirectory);
  }
  formData.append('file_name', fileName);

  const response = await axios.post(
    `${BASE_URL}/upload/${invitationId}/${category}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  console.log('Upload successful:', response.data); // 成功時のデバッグログ
  return response.data;
};
//削除　開発時はstorage/users/がパスの頭。その後にcast_idが続く
export const deleteImage = async (filePath) => {
  const response = await axios.delete(
    `${BASE_URL}/delete_file`,
    {
      params: {
        file_path: filePath
      }
    }
  );
  return response.data;
};
