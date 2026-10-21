import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box, Grid, Card, CardContent, Typography, LinearProgress, Chip,
  TextField, InputAdornment, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, useTheme, Paper, Button, FormControl,
  InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

const API = axios.create({ baseURL: 'http://localhost:8080/api' });

const StatCard = styled(Card)(({ theme, borderColor }) => ({
  background: theme.palette.mode === 'dark' ? 'rgba(37,34,68,0.7)' : 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(10px)', borderRadius: 14,
  borderLeft: `5px solid ${borderColor}`,
  boxShadow: theme.shadows[1],
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4] },
}));

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? 'rgba(37,34,68,0.5)' : 'rgba(255,255,255,0.5)',
  backdropFilter: 'blur(8px)', borderRadius: 14,
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(138,43,226,0.15)' : 'rgba(0,0,0,0.06)'}`,
  overflow: 'hidden',
}));

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, screening: 0, interviews: 0, offers: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [jobs, setJobs] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({
    jobId: '', name: '', email: '', phone: '', resume: null, coverLetter: '',
  });
  const theme = useTheme();

  const validateName = (n) => /^[A-Za-z\u0600-\u06FF\s]+$/.test(n.trim());
  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const validatePhone = (p) => p === '' || /^\d{10}$/.test(p);

  useEffect(() => { fetchData(); fetchJobs(); }, []);

  const fetchData = async () => {
    try {
      const appsRes = await API.get('/applications');
      const apps = appsRes.data.content || [];
      setStats({
        total: apps.length,
        screening: apps.filter(a => ['screening', 'interview-scheduled', 'interviewed'].includes(a.status?.toLowerCase())).length,
        interviews: apps.filter(a => ['interview-scheduled', 'interviewed'].includes(a.status?.toLowerCase())).length,
        offers: apps.filter(a => ['offer', 'hired'].includes(a.status?.toLowerCase())).length,
      });
      setRecent(apps.slice(0, 10));
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  const fetchJobs = async () => {
    try {
      const res = await API.get('/jobs');
      setJobs(res.data.content || []);
    } catch (err) { console.error(err); }
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!formData.jobId) return toast.error('Please select a job');
    if (!formData.name.trim() || !validateName(formData.name)) return toast.error('Name must contain only letters');
    if (!formData.email.trim() || !validateEmail(formData.email)) return toast.error('Please enter a valid email');
    if (formData.phone && !validatePhone(formData.phone)) return toast.error('Phone must be exactly 10 digits');
    if (!formData.resume) return toast.error('Please select a resume file');

    const payload = new FormData();
    payload.append('jobId', formData.jobId);
    payload.append('name', formData.name.trim());
    payload.append('email', formData.email.trim());
    payload.append('phone', formData.phone || '');
    payload.append('resume', formData.resume);
    payload.append('coverLetter', formData.coverLetter || '');

    try {
      await API.post('/applications', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('✅ Application submitted!');
      setOpenForm(false);
      setFormData({ jobId: '', name: '', email: '', phone: '', resume: null, coverLetter: '' });
      fetchData();
      // Notify Jobs page to refresh
      window.dispatchEvent(new Event('application-submitted'));
    } catch (err) {
      toast.error('❌ ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteApplication = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    try {
      await API.delete(`/applications/${id}`);
      toast.success('Application deleted');
      fetchData();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const filteredRecent = recent.filter(c =>
    c.candidateName?.toLowerCase().includes(search.toLowerCase()) ||
    c.jobTitle?.toLowerCase().includes(search.toLowerCase()) ||
    c.candidateEmail?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (s) => {
    const l = s?.toLowerCase() || '';
    if (l === 'applied') return '#b16dff';
    if (l === 'screening') return '#ff6b9d';
    if (l === 'interview-scheduled') return '#ffaa5c';
    if (l === 'interviewed') return '#f87171';
    if (l === 'offer') return '#5cf08a';
    if (l === 'hired') return '#4ade80';
    if (l === 'rejected') return '#ef4444';
    return '#999';
  };

  const getInitials = (n) => !n ? '??' : n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const avatarColors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#f97316', '#10b981', '#ef4444', '#ec4899', '#14b8a6', '#6366f1', '#f43f5e'];
  const getAvatarColor = (n) => { let h = 0; for (let i = 0; i < n.length; i++) h = n.charCodeAt(i) + ((h << 5) - h); return avatarColors[Math.abs(h) % avatarColors.length]; };

  if (loading) return <LinearProgress sx={{ mt: 4 }} />;

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Candidates', value: stats.total, color: '#b16dff', icon: 'fa-solid fa-users' },
          { label: 'In Screening', value: stats.screening, color: '#ff6b9d', icon: 'fa-solid fa-search' },
          { label: 'Interviews', value: stats.interviews, color: '#ffaa5c', icon: 'fa-solid fa-clock' },
          { label: 'Offers / Hired', value: stats.offers, color: '#5cf08a', icon: 'fa-solid fa-check-circle' },
        ].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <StatCard borderColor={item.color}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>{item.label}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>{item.value}</Typography>
                    <Chip icon={<i className={item.icon} style={{ fontSize: '12px' }}></i>} label="Active" size="small"
                      sx={{ mt: 1, bgcolor: `${item.color}20`, color: item.color, borderColor: item.color, border: '1px solid' }} />
                  </Box>
                  <i className={item.icon} style={{ fontSize: '36px', color: `${item.color}40` }}></i>
                </Box>
              </CardContent>
            </StatCard>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mb: 3 }}>
        <Button variant="contained" startIcon={<CloudUploadIcon />} onClick={() => setOpenForm(true)}
          sx={{ bgcolor: theme.palette.primary.main, '&:hover': { bgcolor: theme.palette.primary.dark } }}>
          Submit Application
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField placeholder="Search candidates…" value={search} onChange={(e) => setSearch(e.target.value)}
          size="small" sx={{ maxWidth: 300 }}
          InputProps={{ startAdornment: (<InputAdornment position="start"><i className="fa-solid fa-magnifying-glass" style={{ color: '#a0a0b8' }}></i></InputAdornment>) }} />
      </Box>

      <GlassPaper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Candidate</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Company</strong></TableCell>
                <TableCell><strong>Level</strong></TableCell>
                <TableCell><strong>Stage</strong></TableCell>
                <TableCell><strong>Match</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecent.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>No applications found.</TableCell></TableRow>
              ) : (
                filteredRecent.map((app) => (
                  <TableRow key={app.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: getAvatarColor(app.candidateName),
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                          fontWeight: 700, fontSize: '11px', flexShrink: 0 }}>
                          {getInitials(app.candidateName)}
                        </Box>
                        {app.candidateName}
                      </Box>
                    </TableCell>
                    <TableCell>{app.jobTitle || 'N/A'}</TableCell>
                    <TableCell>{app.currentCompany || '—'}</TableCell>
                    <TableCell>{app.yearsOfExperience ? `${app.yearsOfExperience} yrs` : '—'}</TableCell>
                    <TableCell>
                      <Chip label={app.statusArabic || app.status || 'Applied'} size="small"
                        sx={{ bgcolor: `${getStatusColor(app.status)}20`, color: getStatusColor(app.status),
                          borderColor: getStatusColor(app.status), border: '1px solid', fontWeight: 600, fontSize: '10px' }} />
                    </TableCell>
                    <TableCell>
                      {app.matchScore !== null && app.matchScore !== undefined
                        ? `${Math.round(app.matchScore)}%`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{new Date(app.appliedDate).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="error" onClick={() => handleDeleteApplication(app.id)}>
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

      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Application</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmitApplication} sx={{ mt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Job</InputLabel>
              <Select value={formData.jobId} onChange={(e) => setFormData({ ...formData, jobId: e.target.value })} label="Select Job" required>
                {jobs.map((job) => (<MenuItem key={job.id} value={job.id}>{job.title} ({job.department})</MenuItem>))}
              </Select>
            </FormControl>
            <TextField label="Candidate Name (letters & spaces only)" fullWidth margin="normal"
              value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={formData.name !== '' && !validateName(formData.name)}
              helperText={formData.name !== '' && !validateName(formData.name) ? 'Only letters and spaces allowed' : ''} required />
            <TextField label="Email" type="email" fullWidth margin="normal"
              value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={formData.email !== '' && !validateEmail(formData.email)}
              helperText={formData.email !== '' && !validateEmail(formData.email) ? 'Invalid email format' : ''} required />
            <TextField label="Phone (optional – 10 digits)" fullWidth margin="normal"
              value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={formData.phone !== '' && !validatePhone(formData.phone)}
              helperText={formData.phone !== '' && !validatePhone(formData.phone) ? 'Must be exactly 10 digits' : ''} />
            <Box sx={{ mt: 2, mb: 1 }}>
              <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} fullWidth sx={{ py: 1.5 }}>
                Upload Resume (PDF/DOCX)
                <input type="file" hidden accept=".pdf,.docx,.doc"
                  onChange={(e) => { if (e.target.files.length > 0) { setFormData({ ...formData, resume: e.target.files[0] }); toast.info('File: ' + e.target.files[0].name); } }} />
              </Button>
              {formData.resume && (<Typography variant="caption" color="textSecondary">Selected: {formData.resume.name}</Typography>)}
            </Box>
            <TextField label="Cover Letter (optional – max 500 chars)" fullWidth multiline rows={3} margin="normal"
              value={formData.coverLetter}
              onChange={(e) => { const val = e.target.value; if (val.length <= 500) setFormData({ ...formData, coverLetter: val }); else toast.warning('Max 500 characters'); }}
              helperText={`${formData.coverLetter.length}/500 characters`}
              FormHelperTextProps={{ style: { color: formData.coverLetter.length > 480 ? '#ef4444' : '#a0a0b8' } }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitApplication}>Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;