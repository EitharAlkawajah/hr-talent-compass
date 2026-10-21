import React, { useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container } from '@mui/material';
import { styled } from '@mui/material/styles';

import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Applications from './pages/Applications';
import VisualBoard from './pages/VisualBoard';
import ThemeToggle from './components/ThemeToggle';
import ScrollToTop from './components/ScrollToTop';
import '@fortawesome/fontawesome-free/css/all.min.css';

export const ThemeContext = createContext();

const StyledHeader = styled('header')(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? 'rgba(10, 10, 26, 0.92)' : 'rgba(255, 255, 255, 0.92)',
  backdropFilter: 'blur(15px)',
  padding: '18px 40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '15px',
  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(138,43,226,0.3)' : 'rgba(0,0,0,0.08)'}`,
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  transition: 'all 0.3s ease',
  boxShadow: theme.palette.mode === 'dark' ? '0 4px 30px rgba(0,0,0,0.5)' : '0 4px 30px rgba(0,0,0,0.08)',
  [theme.breakpoints.down('sm')]: {
    padding: '12px 16px',
  },
}));

const Logo = styled(Link)({
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  textDecoration: 'none',
  fontFamily: '"Baloo 2", "Poppins", sans-serif',
  fontSize: '30px',
  fontWeight: 700,
  color: 'inherit',
  letterSpacing: '-0.5px',
  '&:hover': {
    transform: 'scale(1.03)',
    transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  '& span': {
    color: '#8A2BE2',
    fontSize: '36px',
    lineHeight: 1,
  },
});

const Nav = styled('nav')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '25px',
  [theme.breakpoints.down('sm')]: {
    display: 'none', // Hide on mobile, show hamburger
  },
}));

const NavLink = styled(Link)(({ theme, active }) => ({
  color: active ? theme.palette.text.primary : theme.palette.text.secondary,
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: 500,
  letterSpacing: '0.3px',
  padding: '5px 0',
  transition: 'all 0.3s ease',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2px',
  '& i': {
    fontSize: '18px',
    opacity: active ? 1 : 0,
    maxHeight: active ? '30px' : '0',
    transform: active ? 'translateY(0)' : 'translateY(10px)',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
  },
  '&:hover': {
    color: theme.palette.primary.light,
  },
  '&:hover i': {
    opacity: 1,
    maxHeight: '30px',
    transform: 'translateY(0)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: `translateX(-50%) scaleX(${active ? 1 : 0})`,
    width: '100%',
    height: '2px',
    background: theme.palette.primary.main,
    borderRadius: '2px',
    transition: 'transform 0.3s ease',
  },
  '&:hover::after': {
    transform: 'translateX(-50%) scaleX(1)',
  },
}));

// Hamburger Menu
const Hamburger = styled('button')(({ theme, isOpen }) => ({
  display: 'none',
  flexDirection: 'column',
  gap: '6px',
  cursor: 'pointer',
  padding: '5px',
  background: 'none',
  border: 'none',
  zIndex: 1001,
  [theme.breakpoints.down('sm')]: {
    display: 'flex',
  },
  '& span': {
    display: 'block',
    width: '28px',
    height: '3px',
    background: theme.palette.text.primary,
    borderRadius: '3px',
    transition: 'all 0.3s ease',
  },
  '& span:nth-child(1)': {
    transform: isOpen ? 'rotate(45deg) translate(7px, 7px)' : 'none',
    background: isOpen ? theme.palette.primary.main : theme.palette.text.primary,
  },
  '& span:nth-child(2)': {
    opacity: isOpen ? 0 : 1,
    transform: isOpen ? 'scaleX(0)' : 'none',
  },
  '& span:nth-child(3)': {
    transform: isOpen ? 'rotate(-45deg) translate(7px, -7px)' : 'none',
    background: isOpen ? theme.palette.primary.main : theme.palette.text.primary,
  },
}));

const MobileNav = styled('div')(({ theme, isOpen }) => ({
  display: 'none',
  [theme.breakpoints.down('sm')]: {
    display: isOpen ? 'flex' : 'none',
    flexDirection: 'column',
    position: 'fixed',
    top: '70px',
    right: 0,
    width: '280px',
    height: 'calc(100vh - 70px)',
    background: theme.palette.mode === 'dark' ? 'rgba(10, 10, 26, 0.98)' : 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    padding: '30px 20px',
    gap: '0',
    borderLeft: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(138,43,226,0.3)' : 'rgba(0,0,0,0.08)'}`,
    zIndex: 999,
    overflowY: 'auto',
  },
  '& .close-btn': {
    alignSelf: 'flex-end',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: theme.palette.text.secondary,
    cursor: 'pointer',
    padding: '4px 8px',
    marginBottom: '10px',
    '&:hover': {
      color: theme.palette.text.primary,
    },
  },
  '& a': {
    display: 'block',
    padding: '16px 0',
    fontSize: '16px',
    width: '100%',
    textDecoration: 'none',
    color: theme.palette.text.secondary,
    borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(138,43,226,0.15)' : 'rgba(0,0,0,0.06)'}`,
    transition: 'color 0.3s ease',
    '&:hover, &.active': {
      color: theme.palette.primary.light,
    },
    '&.active': {
      color: theme.palette.text.primary,
    },
  },
}));

const Header = () => {
  const location = useLocation();
  const { mode } = useContext(ThemeContext);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const toggleMobile = () => setMobileOpen(!mobileOpen);
  const closeMobile = () => setMobileOpen(false);

  useEffect(() => {
    closeMobile();
  }, [location]);

  return (
    <StyledHeader>
      <Logo to="/">
        HR <span>Compass.</span>
      </Logo>
      <Nav>
        <NavLink to="/" active={isActive('/') ? 1 : 0}>
          <i className="fas fa-house"></i> Dashboard
        </NavLink>
        <NavLink to="/jobs" active={isActive('/jobs') ? 1 : 0}>
          <i className="fas fa-briefcase"></i> Jobs
        </NavLink>
        <NavLink to="/applications" active={isActive('/applications') ? 1 : 0}>
          <i className="fas fa-file-lines"></i> Applications
        </NavLink>
        <NavLink to="/visual-board" active={isActive('/visual-board') ? 1 : 0}>
          <i className="fas fa-table-columns"></i> Visual Board
        </NavLink>
        <ThemeToggle />
      </Nav>
      <Hamburger onClick={toggleMobile} isOpen={mobileOpen}>
        <span></span>
        <span></span>
        <span></span>
      </Hamburger>
      <MobileNav isOpen={mobileOpen}>
        <button className="close-btn" onClick={closeMobile}>×</button>
        <Link to="/" className={isActive('/') ? 'active' : ''} onClick={closeMobile}>Dashboard</Link>
        <Link to="/jobs" className={isActive('/jobs') ? 'active' : ''} onClick={closeMobile}>Jobs</Link>
        <Link to="/applications" className={isActive('/applications') ? 'active' : ''} onClick={closeMobile}>Applications</Link>
        <Link to="/visual-board" className={isActive('/visual-board') ? 'active' : ''} onClick={closeMobile}>Visual Board</Link>
        <Box sx={{ pt: 2, display: 'flex', justifyContent: 'center' }}>
          <ThemeToggle />
        </Box>
      </MobileNav>
    </StyledHeader>
  );
};

const App = () => {
  const [mode, setMode] = useState('dark');

  const theme = createTheme({
    palette: {
      mode: mode,
      primary: { main: '#8A2BE2', light: '#DDA0DD', dark: '#5A1F9E' },
      secondary: { main: '#DDA0DD', light: '#F3E5F5', dark: '#BA68C8' },
      background: {
        default: mode === 'dark' ? '#0a0a1a' : '#f4f4f9',
        paper: mode === 'dark' ? 'rgba(20,20,45,0.85)' : 'rgba(255,255,255,0.85)',
      },
    },
    typography: {
      fontFamily: '"Poppins", "Inter", sans-serif',
    },
    shape: { borderRadius: 16 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            background: mode === 'dark' ? 'rgba(20,20,45,0.85)' : 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${mode === 'dark' ? 'rgba(138,43,226,0.2)' : 'rgba(0,0,0,0.06)'}`,
            boxShadow: mode === 'dark' ? '0 10px 40px rgba(138,43,226,0.15)' : '0 10px 40px rgba(0,0,0,0.06)',
          },
        },
      },
    },
  });

  const toggleTheme = () => setMode(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{
          minHeight: '100vh',
          background: mode === 'dark'
            ? 'radial-gradient(circle at 20% 30%, #2d1b4e, #0a0a1a 80%)'
            : 'radial-gradient(circle at 20% 30%, #f5f0ff, #e8e0f0 80%)',
          transition: 'background 0.4s ease',
        }}>
          <Router>
            <Header />
            <Container maxWidth="xl" sx={{ py: 4, px: { xs: 3, sm: 4, md: 5 } }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/applications" element={<Applications />} />
                <Route path="/visual-board" element={<VisualBoard />} />
              </Routes>
            </Container>
            <ScrollToTop />
          </Router>
        </Box>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default App;