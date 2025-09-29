import { useState, useEffect } from 'react';

export const useTeacher = () => {
  const [currentTeacher, setCurrentTeacher] = useState(null);

  const saveTeacher = (teacherData) => {
    localStorage.setItem('teacher', JSON.stringify(teacherData));
    setCurrentTeacher(teacherData);
  };

  const getTeacher = () => {
    const teacher = localStorage.getItem('teacher');
    return teacher ? JSON.parse(teacher) : null;
  };

  useEffect(() => {
    const teacher = getTeacher();
    if (teacher) {
      setCurrentTeacher(teacher);
    }
  }, []);

  return {
    currentTeacher,
    saveTeacher,
    getTeacher
  };
};