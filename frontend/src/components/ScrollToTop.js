import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';

const ScrollButton = styled('button')(({ theme, visible }) => ({
  position: 'fixed',
  bottom: '30px',
  right: '30px',
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  background: theme.palette.primary.main,
  color: '#fff',
  border: 'none',
  fontSize: '20px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 5px 25px rgba(138,43,226,0.4)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  zIndex: 999,
  opacity: visible ? 1 : 0,
  visibility: visible ? 'visible' : 'hidden',
  transform: visible ? 'translateY(0)' : 'translateY(20px)',
  '&:hover': {
    background: theme.palette.primary.dark,
    boxShadow: '0 10px 35px rgba(138,43,226,0.6)',
    transform: 'translateY(-5px)',
  },
  [theme.breakpoints.down('sm')]: {
    bottom: '20px',
    right: '20px',
    width: '42px',
    height: '42px',
    fontSize: '16px',
  },
}));

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <ScrollButton onClick={scrollToTop} visible={visible}>
      <i className="fas fa-arrow-up"></i>
    </ScrollButton>
  );
};

export default ScrollToTop;