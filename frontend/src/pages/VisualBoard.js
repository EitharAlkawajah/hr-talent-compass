import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  Box, Typography, Card, Chip, LinearProgress, useTheme, IconButton,
} from '@mui/material';

const API = axios.create({ baseURL: 'http://localhost:8080/api' });

const COLUMN_CONFIG = [
  { id: 'applied', title: 'Applied', color: '#b16dff', icon: 'fa-solid fa-inbox' },
  { id: 'screening', title: 'Screening', color: '#ff6b9d', icon: 'fa-solid fa-search' },
  { id: 'interview-scheduled', title: 'Interview Scheduled', color: '#ffaa5c', icon: 'fa-solid fa-calendar-check' },
  { id: 'interviewed', title: 'Interviewed', color: '#f87171', icon: 'fa-solid fa-comments' },
  { id: 'offer', title: 'Offer Extended', color: '#5cf08a', icon: 'fa-solid fa-file-signature' },
  { id: 'hired', title: 'Hired', color: '#4ade80', icon: 'fa-solid fa-user-check' },
  { id: 'rejected', title: 'Rejected', color: '#ef4444', icon: 'fa-solid fa-user-xmark' },
];

const avatarColors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#f97316', '#10b981', '#ef4444', '#ec4899', '#14b8a6', '#6366f1', '#f43f5e'];

const getAvatarColor = (n) => { let h = 0; for (let i = 0; i < n.length; i++) h = n.charCodeAt(i) + ((h << 5) - h); return avatarColors[Math.abs(h) % avatarColors.length]; };
const getInitials = (n) => !n ? '??' : n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

const VisualBoard = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedId, setDraggedId] = useState(null);
  const dragRef = useRef({ mouseY: 0, rafId: null, isDragging: false });
  const theme = useTheme();

  useEffect(() => { fetchCandidates(); return () => { if (dragRef.current.rafId) cancelAnimationFrame(dragRef.current.rafId); }; }, []);

  const fetchCandidates = async () => {
    try {
      const res = await API.get('/applications');
      const apps = res.data.content || [];
      const mapped = apps.map(app => {
        let stage = app.status?.toLowerCase() || 'applied';
        const valid = COLUMN_CONFIG.map(c => c.id);
        if (!valid.includes(stage)) stage = 'applied';
        return {
          id: app.id,
          name: app.candidateName || 'Unknown',
          role: app.jobTitle || 'N/A',
          company: app.currentCompany || '—',
          level: app.yearsOfExperience ? `${app.yearsOfExperience} yrs` : '—',
          mode: 'Remote',
          stage,
          date: app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : '—',
          matchScore: app.matchScore,
        };
      });
      setCandidates(mapped);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  const getCandidatesByStage = (stageId) => {
    const filtered = candidates.filter(c => c.stage === stageId);
    if (!searchTerm.trim()) return filtered;
    return filtered.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const autoScrollLoop = () => {
    if (!dragRef.current.isDragging) return;
    const y = dragRef.current.mouseY;
    const h = window.innerHeight;
    const speed = 15;
    if (y < 100) window.scrollBy(0, -speed);
    else if (y > h - 100) window.scrollBy(0, speed);
    dragRef.current.rafId = requestAnimationFrame(autoScrollLoop);
  };

  const handleDragStart = (e, id) => {
    setDraggedId(id);
    dragRef.current.isDragging = true;
    dragRef.current.mouseY = e.clientY;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    e.target.classList.add('dragging');

    const onMouseMove = (ev) => { dragRef.current.mouseY = ev.clientY; };
    document.addEventListener('mousemove', onMouseMove);
    dragRef.current.rafId = requestAnimationFrame(autoScrollLoop);
    e.target._cleanup = () => {
      document.removeEventListener('mousemove', onMouseMove);
      dragRef.current.isDragging = false;
      if (dragRef.current.rafId) { cancelAnimationFrame(dragRef.current.rafId); dragRef.current.rafId = null; }
    };
  };

  const handleDragEnd = (e) => {
    setDraggedId(null);
    if (e.target._cleanup) { e.target._cleanup(); e.target._cleanup = null; }
    document.querySelectorAll('.card').forEach(c => c.classList.remove('dragging'));
    document.querySelectorAll('.column').forEach(c => c.classList.remove('drag-over'));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const col = e.currentTarget.closest('.column');
    if (col) col.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    const col = e.currentTarget.closest('.column');
    if (col && !col.contains(e.relatedTarget)) col.classList.remove('drag-over');
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();
    const col = e.currentTarget.closest('.column');
    if (col) col.classList.remove('drag-over');
    if (dragRef.current.rafId) { cancelAnimationFrame(dragRef.current.rafId); dragRef.current.rafId = null; }

    const cardId = e.dataTransfer.getData('text/plain') || draggedId;
    if (!cardId) return;
    const candidate = candidates.find(c => c.id === cardId);
    if (!candidate || candidate.stage === targetStage) return;

    const updated = candidates.map(c => c.id === cardId ? { ...c, stage: targetStage, date: new Date().toLocaleDateString() } : c);
    setCandidates(updated);

    try {
      const statusMap = {
        'applied': 'APPLIED', 'screening': 'SCREENING', 'interview-scheduled': 'INTERVIEW_SCHEDULED',
        'interviewed': 'INTERVIEWED', 'offer': 'OFFER_EXTENDED', 'hired': 'OFFER_ACCEPTED', 'rejected': 'REJECTED',
      };
      await API.patch(`/applications/${cardId}/status`, null, { params: { status: statusMap[targetStage] || 'APPLIED' } });
      toast.success(`Moved to ${COLUMN_CONFIG.find(c => c.id === targetStage)?.title || targetStage}`);
    } catch (err) { toast.error('Failed to update'); fetchCandidates(); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this candidate?')) {
      try {
        await API.delete(`/applications/${id}`);
        toast.success('Removed');
        fetchCandidates();
      } catch (err) { toast.error('Failed'); }
    }
  };

  if (loading) return <LinearProgress sx={{ mt: 4 }} />;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a0a0b8' }}></i>
          <input type="text" placeholder="Search candidates… (⌘+K)" value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '10px 16px 10px 40px', borderRadius: '50px',
              border: `1.5px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
              background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
              fontFamily: 'inherit', fontSize: '14px', color: theme.palette.text.primary, outline: 'none',
            }} />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
        {COLUMN_CONFIG.map((col) => (
          <Box key={col.id}
            onClick={() => { const el = document.getElementById('col-' + col.id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1, padding: '6px 14px', borderRadius: '50px',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(37,34,68,0.6)' : 'rgba(255,255,255,0.6)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
              cursor: 'pointer', transition: 'all 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
            }}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: col.color, flexShrink: 0 }}></Box>
            <i className={col.icon} style={{ color: col.color, fontSize: '13px' }}></i>
            <Typography variant="caption" fontWeight={600}>{col.title}</Typography>
            <Typography variant="caption" fontWeight={700} sx={{ color: col.color }}>{getCandidatesByStage(col.id).length}</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {COLUMN_CONFIG.map((col) => {
          const colCandidates = getCandidatesByStage(col.id);
          return (
            <Box key={col.id} id={'col-' + col.id} className="column" data-stage={col.id}
              sx={{
                width: '100%',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(30,27,58,0.6)' : 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(8px)', borderRadius: 2,
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(138,43,226,0.15)' : 'rgba(0,0,0,0.06)'}`,
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                '&.drag-over': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: '-2px', bgcolor: `${theme.palette.primary.main}10` },
              }}
              onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, col.id)}>
              <Box sx={{
                p: 2, borderBottom: `1px solid ${theme.palette.divider}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative',
                '&::after': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', bgcolor: col.color, borderTopLeftRadius: '8px', borderTopRightRadius: '8px' },
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className={col.icon} style={{ color: col.color, fontSize: '16px' }}></i>
                  <Typography variant="subtitle2" fontWeight={700}>{col.title}</Typography>
                  <Chip label={colCandidates.length} size="small"
                    sx={{ bgcolor: `${col.color}20`, color: col.color, border: `1px solid ${col.color}`, fontSize: '11px', fontWeight: 700, height: 20 }} />
                </Box>
              </Box>

              <Box sx={{ p: 1.5, minHeight: 80, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {colCandidates.length === 0 ? (
                  <Box sx={{
                    width: '100%', border: `2px dashed ${theme.palette.divider}`, borderRadius: 2, p: 3,
                    textAlign: 'center', color: 'text.secondary', fontSize: '12px', fontWeight: 500,
                  }}>Drop here</Box>
                ) : colCandidates.map((candidate) => (
                  <Card key={candidate.id} className="card" draggable
                    onDragStart={(e) => handleDragStart(e, candidate.id)}
                    onDragEnd={handleDragEnd}
                    sx={{
                      flex: '0 1 260px', p: 1.5, borderRadius: 2,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(37,34,68,0.8)' : 'rgba(255,255,255,0.8)',
                      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`,
                      boxShadow: 1, transition: 'all 0.15s ease', cursor: 'grab',
                      '&:active': { cursor: 'grabbing' },
                      '&.dragging': { opacity: 0.5, transform: 'rotate(2deg) scale(0.98)', boxShadow: 6 },
                    }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Box sx={{
                        width: 28, height: 28, borderRadius: '50%', bgcolor: getAvatarColor(candidate.name),
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                        fontWeight: 700, fontSize: '10px', flexShrink: 0,
                      }}>{getInitials(candidate.name)}</Box>
                      <Typography variant="subtitle2" fontWeight={600} noWrap>{candidate.name}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
                      <Chip label={candidate.role} size="small"
                        sx={{ height: 18, fontSize: '9px', bgcolor: `${col.color}20`, color: col.color, border: `1px solid ${col.color}` }} />
                      <Chip label={candidate.level} size="small"
                        sx={{ height: 18, fontSize: '9px', bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                      <Typography variant="caption" color="textSecondary">
                        <i className="fa-regular fa-building" style={{ marginRight: 4 }}></i>
                        {candidate.company}
                      </Typography>
                      <IconButton size="small" onClick={() => handleDelete(candidate.id)}
                        sx={{ opacity: 0.6, '&:hover': { opacity: 1, color: '#ef4444' } }}>
                        <i className="fa-solid fa-trash-can" style={{ fontSize: '12px' }}></i>
                      </IconButton>
                    </Box>
                    {candidate.matchScore !== null && candidate.matchScore !== undefined && (
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress variant="determinate" value={candidate.matchScore}
                          sx={{ height: 4, borderRadius: 4, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
                        <Typography variant="caption" color="textSecondary">
                          Match: {Math.round(candidate.matchScore)}%
                        </Typography>
                      </Box>
                    )}
                  </Card>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default VisualBoard;