import { useState, useEffect } from 'react';
import { profileService } from '../services/api/profileService';

export const useHomeViewModel = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isToggleOn, setIsToggleOn] = useState(false);

  // Carregar perfis
  const loadProfiles = async () => {
    setLoading(true);
    try {
      const profilesData = await profileService.getProfiles();
      setProfiles(profilesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle de seleção do perfil
  const toggleProfileSelection = (profileId) => {
    setProfiles(prevProfiles => 
      prevProfiles.map(profile => 
        profile.id === profileId 
          ? { ...profile, isSelected: !profile.isSelected }
          : profile
      )
    );
  };

  // Toggle de expansão da descrição
  const toggleProfileDescription = (profileId) => {
    setProfiles(prevProfiles => 
      prevProfiles.map(profile => 
        profile.id === profileId 
          ? { ...profile, isExpanded: !profile.isExpanded }
          : profile
      )
    );
  };

  // Toggle do switch
  const toggleSwitch = () => {
    setIsToggleOn(prev => !prev);
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  return {
    profiles,
    loading,
    error,
    isToggleOn,
    toggleProfileSelection,
    toggleProfileDescription,
    toggleSwitch,
    reloadProfiles: loadProfiles
  };
};