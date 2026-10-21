import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box, Button, Chip, Grid, IconButton, LinearProgress, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  useTheme, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import RefreshIcon from '@mui/icons-material/Refresh';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api' });

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? 'rgba(37,34,68,0.5)' : 'rgba(255,255,255,0.5)',
  backdropFilter: 'blur(8px)',
  borderRadius: 14,
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(138,43,226,0.15)' : 'rgba(0,0,0,0.06)'}`,
  overflow: 'hidden',
}));

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', department: '', location: '',
    employmentType: 'FULL_TIME', requiredSkills: '', experienceLevel: 'MID',
    requiredDegree: '', requiredMajor: '',
    minSalary: '', maxSalary: '',
  });
  const theme = useTheme();

  useEffect(() => {
    const handleAppSubmit = () => refreshAll();
    window.addEventListener('application-submitted', handleAppSubmit);
    return () => window.removeEventListener('application-submitted', handleAppSubmit);
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await API.get('/jobs');
      setJobs(res.data.content || []);
    } catch (err) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await API.get('/applications');
      setApplications(res.data.content || []);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    }
  };

  const refreshAll = async () => {
    setRefreshing(true);
    await fetchJobs();
    await fetchApplications();
    setRefreshing(false);
  };

  useEffect(() => { refreshAll(); }, []);

  const getApplicationCount = (jobId) => applications.filter(a => a.jobId === jobId).length;

  const handleOpenDialog = (job = null) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        title: job.title || '',
        description: job.description || '',
        department: job.department || '',
        location: job.location || '',
        employmentType: job.employmentType || 'FULL_TIME',
        requiredSkills: job.requiredSkills?.join(', ') || '',
        experienceLevel: job.experienceLevel || 'MID',
        requiredDegree: job.requiredDegree || '',
        requiredMajor: job.requiredMajor || '',
        minSalary: job.minSalary || '',
        maxSalary: job.maxSalary || '',
      });
    } else {
      setEditingJob(null);
      setFormData({
        title: '', description: '', department: '', location: '',
        employmentType: 'FULL_TIME', requiredSkills: '', experienceLevel: 'MID',
        requiredDegree: '', requiredMajor: '',
        minSalary: '', maxSalary: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => { setOpenDialog(false); setEditingJob(null); };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        minSalary: formData.minSalary ? parseFloat(formData.minSalary) : null,
        maxSalary: formData.maxSalary ? parseFloat(formData.maxSalary) : null,
      };
      if (editingJob) {
        await API.put(`/jobs/${editingJob.id}`, payload);
        toast.success('Job updated');
      } else {
        await API.post('/jobs', payload);
        toast.success('Job created');
      }
      handleCloseDialog();
      refreshAll();
    } catch (err) {
      toast.error('Failed to save: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this job?')) {
      try {
        await API.delete(`/jobs/${id}`);
        toast.success('Job deleted');
        refreshAll();
      } catch (err) { toast.error('Failed to delete'); }
    }
  };

  const copyJobId = (id) => {
    navigator.clipboard.writeText(id);
    toast.success('Job ID copied!');
  };

  if (loading && !refreshing) return <LinearProgress sx={{ mt: 4 }} />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          <i className="fa-solid fa-briefcase" style={{ marginRight: 10, color: '#b16dff' }}></i>
          Job Postings
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={refreshAll} disabled={refreshing}>Refresh</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>New Job</Button>
        </Box>
      </Box>

      {jobs.length === 0 ? (
        <GlassPaper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="textSecondary">No jobs yet. Click "New Job".</Typography>
        </GlassPaper>
      ) : (
        <GlassPaper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Title</strong></TableCell>
                  <TableCell><strong>Department</strong></TableCell>
                  <TableCell><strong>Location</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Degree</strong></TableCell>
                  <TableCell><strong>Skills</strong></TableCell>
                  <TableCell><strong>Apps</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id} hover>
                    <TableCell><Typography fontWeight={600}>{job.title}</Typography></TableCell>
                    <TableCell>{job.department}</TableCell>
                    <TableCell>
                      <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      {job.location}
                    </TableCell>
                    <TableCell>
                      <Chip label={job.employmentType?.replace('_', ' ') || 'N/A'} size="small" sx={{ bgcolor: `${theme.palette.primary.main}20` }} />
                    </TableCell>
                    <TableCell>
                      {job.requiredDegree ? (
                        <Chip label={job.requiredDegree.replace('_', ' ')} size="small" color="primary" variant="outlined" />
                      ) : (
                        <Typography variant="caption" color="textSecondary">Any</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {job.requiredSkills?.slice(0, 3).map((s, i) => (
                          <Chip key={i} label={s} size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
                        ))}
                        {job.requiredSkills?.length > 3 && <Chip label={`+${job.requiredSkills.length - 3}`} size="small" />}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip icon={<PeopleIcon />} label={getApplicationCount(job.id)} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip label={job.active ? 'Active' : 'Closed'} size="small" color={job.active ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenDialog(job)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => copyJobId(job.id)}><ContentCopyIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(job.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </GlassPaper>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingJob ? 'Edit Job' : 'Create New Job'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField label="Job Title" fullWidth value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Description" fullWidth multiline rows={4} value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Department" fullWidth value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Location" fullWidth value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Employment Type</InputLabel>
                  <Select value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    label="Employment Type">
                    <MenuItem value="FULL_TIME">Full Time</MenuItem>
                    <MenuItem value="PART_TIME">Part Time</MenuItem>
                    <MenuItem value="CONTRACT">Contract</MenuItem>
                    <MenuItem value="INTERNSHIP">Internship</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Experience Level</InputLabel>
                  <Select value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    label="Experience Level">
                    <MenuItem value="ENTRY">Entry</MenuItem>
                    <MenuItem value="MID">Mid</MenuItem>
                    <MenuItem value="SENIOR">Senior</MenuItem>
                    <MenuItem value="LEAD">Lead</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Required Degree</InputLabel>
                  <Select value={formData.requiredDegree}
                    onChange={(e) => setFormData({ ...formData, requiredDegree: e.target.value })}
                    label="Required Degree">
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="HIGH_SCHOOL">High School</MenuItem>
                    <MenuItem value="DIPLOMA">Diploma</MenuItem>
                    <MenuItem value="BACHELOR">Bachelor</MenuItem>
                    <MenuItem value="MASTER">Master</MenuItem>
                    <MenuItem value="DOCTORATE">Doctorate</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField label="Required Major" fullWidth value={formData.requiredMajor}
                  onChange={(e) => setFormData({ ...formData, requiredMajor: e.target.value })}
                  placeholder="e.g. Computer Science / علوم الحاسب" />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Required Skills (comma-separated)" fullWidth value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                  placeholder="e.g. Java, Spring Boot, React" />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Min Salary" fullWidth type="number" value={formData.minSalary}
                  onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Max Salary" fullWidth type="number" value={formData.maxSalary}
                  onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>{editingJob ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Jobs;