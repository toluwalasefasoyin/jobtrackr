import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SESSION_DURATION = 15 * 60; // 15 minutes

export const useSessionTimer = () => {
  const [, setTimeLeft] = useState(SESSION_DURATION);
  const [showModal, setShowModal] = useState(false);
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleActivity = useCallback(() => {
    if (!showModal) {
      setTimeLeft(SESSION_DURATION);
    }
  }, [showModal]);

  useEffect(() => {
    if (isAuthenticated && !showModal) {
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('keydown', handleActivity);
      window.addEventListener('scroll', handleActivity);
      window.addEventListener('click', handleActivity);

      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setShowModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(interval);
        window.removeEventListener('mousemove', handleActivity);
        window.removeEventListener('keydown', handleActivity);
        window.removeEventListener('scroll', handleActivity);
        window.removeEventListener('click', handleActivity);
      };
    }
  }, [isAuthenticated, handleActivity, showModal]);

  const extendSession = () => {
    setShowModal(false);
    setTimeLeft(SESSION_DURATION);
  };

  const logoutSession = () => {
    setShowModal(false);
    logout();
    navigate('/login');
  };

  return { showModal, extendSession, logoutSession };
};
