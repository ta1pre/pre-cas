// src/utils/validators.js

// utils/validators.js

// ニックネームのバリデーション
  export const validateDisplayName = (value) => {
    if (!value || value.trim() === '') {
      return 'ニックネームは必須です。';
    }
    if (value.length < 2 || value.length > 50) {
      return 'ニックネームは2文字以上50文字以下で入力してください。';
    }
    return '';
  };
  
  // メールアドレスのバリデーション
  export const validateEmail = (value) => {
    if (!value || value.trim() === '') {
      return '';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return '有効なメールアドレスを入力してください。';
    }
    return '';
  };
  
  // 生年月日のバリデーション
  export const validateBirthDate = (value) => {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return '有効な日付を入力してください。';
    }
    if (date > new Date()) {
      return '未来の日付は選択できません。';
    }
    return '';
  };
  
  // 電話番号のバリデーション
  export const validatePhoneNumber = (value) => {
    if (!value || value.trim() === '') {
      return '';
    }
    const phoneRegex = /^0\d{9,10}$/;
    if (!phoneRegex.test(value)) {
      return '有効な電話番号を入力してください（例：09012345678）。';
    }
    return '';
  };
  
  // 都道府県のバリデーション
  export const validatePrefecture = (value) => {
    if (!value || value.trim() === '') {
      return '都道府県を選択してください。';
    }
    return '';
  };
  
  // すべてのフィールドのバリデーションを実行
  export const validateAllFields = (fields) => {
    const errors = {};
    errors.displayName = validateDisplayName(fields.displayName);
    errors.userEmail = validateEmail(fields.userEmail);
    errors.userBirth = validateBirthDate(fields.userBirth);
    errors.userMobilePhone = validatePhoneNumber(fields.userMobilePhone);
    errors.userPrefectures = validatePrefecture(fields.userPrefectures);
    return errors;
  };

