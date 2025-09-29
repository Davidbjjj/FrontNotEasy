import React from 'react';
import HomeComponent from '../../presentation/components/HomeComponent';
import { useHomeViewModel } from '../../viewmodels/homeViewModel';

const HomePage = () => {
  const {
    profiles,
    loading,
    error,
    isToggleOn,
    toggleProfileSelection,
    toggleProfileDescription,
    toggleSwitch
  } = useHomeViewModel();

  return (
    <HomeComponent
      profiles={profiles}
      loading={loading}
      error={error}
      isToggleOn={isToggleOn}
      onToggleProfileSelection={toggleProfileSelection}
      onToggleProfileDescription={toggleProfileDescription}
      onToggleSwitch={toggleSwitch}
    />
  );
};

export default HomePage;