import { useState } from 'react';
import { teacherService } from '../services/api/teacherService';

export const useTeacherViewModel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTeacherRegistration = async (teacherData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await teacherService.register(teacherData);
      return response;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    handleTeacherRegistration
  };
};