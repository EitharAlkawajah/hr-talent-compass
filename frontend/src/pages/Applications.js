import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Typography,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Button } from '@mui/material';

const API = axios.create({ baseURL: 'http://localhost:8080/api' });

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? 'rgba(37,34,68,0.5)' : 'rgba(255,255,255,0.5)',
  backdropFilter: 'blur(8px)',
  borderRadius: 14,
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(138,43,226,0.15)' : 'rgba(0,0,0,0.06)'}`,
  overflow: 'hidden',
}));

const avatarColors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#f97316', '#10b981', '#ef4444', '#ec4899', '#14b8a6', '#6366f1', '#f43f5e'];

const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const theme = useTheme();

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await API.get('/applications');
      setApplications(res.data.content || []);
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchApplications();
    setRefreshing(false);
    toast.info('Refreshed');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    try {
      await API.delete(`/applications/${id}`);
      toast.success('Application deleted');
      fetchApplications();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('applied')) return '#b16dff';
    if (s.includes('screening')) return '#ff6b9d';
    if (s.includes('interview-scheduled')) return '#ffaa5c';
    if (s.includes('interviewed')) return '#f87171';
    if (s.includes('offer_extends') || s.includes('offer_extend')) return '#5cf08a';
    if (s.includes('offer_accept') || s.includes('hired')) return '#4ade80';
    if (s.includes('reject')) return '#ef4444';
    if (s.includes('withdraw')) return '#999';
    return '#999';
  };

  const filteredApps = filterStatus === 'ALL'
    ? applications
    : applications.filter(a => a.status === filterStatus);

  if (loading && !refreshing) return <LinearProgress sx={{ mt: 4 }} />;

  return (
    <Box>
      {/* Page Title */}
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        <i className="fa-solid fa-file-lines" style={{ marginRight: 10, color: '#b16dff' }}></i>
        Applications
      </Typography>

      {/* Filter + Refresh */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Status"
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(37,34,68,0.5)' : 'rgba(255,255,255,0.5)',
              borderRadius: 2,
            }}
          >
            <MenuItem value="ALL">All Applications</MenuItem>
            <MenuItem value="APPLIED">Applied</MenuItem>
            <MenuItem value="SCREENING">Screening</MenuItem>
            <MenuItem value="INTERVIEW_SCHEDULED">Interview Scheduled</MenuItem>
            <MenuItem value="INTERVIEWED">Interviewed</MenuItem>
            <MenuItem value="OFFER_EXTENDED">Offer Extended</MenuItem>
            <MenuItem value="OFFER_ACCEPTED">Hired</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          Refresh
        </Button>
      </Box>

      {/* Table */}
      <GlassPaper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Candidate</strong></TableCell>
                <TableCell><strong>Job</strong></TableCell>
                <TableCell><strong>Applied</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Match</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredApps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No applications found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredApps.map((app) => (
                  <TableRow key={app.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            bgcolor: getAvatarColor(app.candidateName || 'X'),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '12px',
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(app.candidateName)}
                        </Box>
                        <Box>
                          <Typography fontWeight={600} variant="body2">
                            {app.candidateName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {app.candidateEmail}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{app.jobTitle || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(app.appliedDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={app.statusArabic || app.status || 'Applied'}
                        size="small"
                        sx={{
                          bgcolor: `${getStatusColor(app.status)}20`,
                          color: getStatusColor(app.status),
                          border: `1px solid ${getStatusColor(app.status)}`,
                          fontWeight: 600,
                          fontSize: '11px',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{
                          color: app.matchScore >= 80 ? '#4caf50' :
                                 app.matchScore >= 60 ? '#ffaa5c' :
                                 app.matchScore >= 40 ? '#ff6b9d' :
                                 app.matchScore > 0 ? '#ef5350' : '#a0a0b8',
                        }}
                      >
                        {app.matchScore !== null && app.matchScore !== undefined
                          ? `${Math.round(app.matchScore)}%`
                          : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="error" onClick={() => handleDelete(app.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </GlassPaper>
    </Box>
  );
};

export default Applications;