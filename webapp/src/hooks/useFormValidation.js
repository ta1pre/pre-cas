import { useState, useEffect } from 'react';
import { validateAllFields } from '../utils/validators';

export const useFormValidation = (initialState) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isSubmitting) {
      const noErrors = Object.values(errors).every(error => error === '');
      if (noErrors) {
        // フォームの送信処理をここで行うか、コールバック関数を呼び出す
        console.log('Form is valid, submitting...');
      }
      setIsSubmitting(false);
    }
  }, [isSubmitting, errors]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues(prevValues => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    const fieldError = validateAllFields({ [name]: value })[name];
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: fieldError,
    }));
  };

  const handleSubmit = async (onSubmit) => {
    const validationErrors = validateAllFields(values);
    setErrors(validationErrors);
    const hasErrors = Object.values(validationErrors).some(error => error !== '');
    if (!hasErrors) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log('Validation errors:', validationErrors);
    }
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    setErrors
  };
};