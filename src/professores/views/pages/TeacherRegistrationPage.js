import React from 'react';
import { useNavigate } from "react-router-dom";
import TeacherRegistrationComponent from '../../presentation/components/TeacherRegistrationComponent';
import { useTeacherViewModel } from '../../viewmodels/teacherViewModel';

const TeacherRegistrationPage = () => {
  const navigate = useNavigate();
  const { loading, error, handleTeacherRegistration } = useTeacherViewModel();

  const onRegister = async (teacherData) => {
    const success = await handleTeacherRegistration(teacherData);
    if (success) {
      navigate("/home");
    }
  };

  return (
    <TeacherRegistrationComponent 
      onRegister={onRegister}
      loading={loading}
      error={error}
    />
  );
};

export default TeacherRegistrationPage;