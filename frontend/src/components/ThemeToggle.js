import React, { useContext } from 'react';
import { ThemeContext } from '../App';
import { styled } from '@mui/material/styles';

const ToggleWrapper = styled('div')(({ theme, isNight }) => ({
  position: 'relative',
  width: '130px',
  height: '36px',
  borderRadius: '18px',
  backgroundColor: isNight ? '#f0f0f0' : '#111111',
  cursor: 'pointer',
  transition: 'background-color 0.4s ease',
  userSelect: 'none',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
}));

const Knob = styled('div')(({ theme, isNight }) => ({
  position: 'absolute',
  top: '3px',
  left: '3px',
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  backgroundColor: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  zIndex: 10,
  transform: isNight ? 'translateX(94px)' : 'translateX(0)',
  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
}));

const Icon = styled('svg')({
  width: '18px',
  height: '18px',
});

const Label = styled('span')(({ theme, isNight, side }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  fontSize: '10px',
  fontWeight: 800,
  letterSpacing: '1px',
  transition: 'opacity 0.3s ease',
  pointerEvents: 'none',
  color: isNight ? '#111111' : '#ffffff',
  opacity: side === 'left' ? (isNight ? 1 : 0) : (isNight ? 0 : 1),
  [side === 'left' ? 'left' : 'right']: '12px',
}));

const ThemeToggle = () => {
  const { mode, toggleTheme } = useContext(ThemeContext);
  const isNight = mode === 'dark';

  return (
    <ToggleWrapper onClick={toggleTheme} isNight={isNight}>
      <Knob isNight={isNight}>
        {!isNight ? (
          <Icon viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </Icon>
        ) : (
          <Icon viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            <path d="M15 5L16 8L19 9L16 10L15 13L14 10L11 9L14 8Z" fill="#000000" stroke="none" />
            <path d="M20 13L20.5 14.5L22 15L20.5 15.5L20 17L19.5 15.5L18 15L19.5 14.5Z" fill="#000000" stroke="none" />
          </Icon>
        )}
      </Knob>
      <Label side="left" isNight={isNight}>NIGHT</Label>
      <Label side="right" isNight={isNight}>DAY</Label>
    </ToggleWrapper>
  );
};

export default ThemeToggle;