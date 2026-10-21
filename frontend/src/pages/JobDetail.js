import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  LinearProgress,
  Divider,
  Grid,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';

const API = axios.create({ baseURL: 'http://localhost:8080/api' });

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJob();
    fetchApplications();
  }, [id]);

  const fetchJob = async () => {
    try {
      const res = await API.get(`/jobs/${id}`);
      setJob(res.data);
    } catch (err) {
      console.error('Failed to fetch job', err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await API.get(`/applications/job/${id}`);
      setApplications(res.data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LinearProgress />;
  if (!job) return <Typography>Job not found</Typography>;

  return (
    <Box>
      <Button component={Link} to="/jobs" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        Back to Jobs
      </Button>
      <Card>
        <CardContent>
          <Typography variant="h4" fontFamily='"Baloo 2", sans-serif'>
            {job.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', my: 1 }}>
            <Chip icon={<LocationOnIcon />} label={job.location} variant="outlined" />
            <Chip icon={<WorkIcon />} label={job.employmentType.replace('_', ' ')} variant="outlined" />
            <Chip label={job.experienceLevel} variant="outlined" />
            <Chip label={job.active ? 'Active' : 'Closed'} color={job.active ? 'success' : 'default'} />
          </Box>
          <Typography variant="body1" sx={{ my: 2, whiteSpace: 'pre-wrap' }}>
            {job.description}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" fontWeight={600}>Required Skills</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1 }}>
            {job.requiredSkills?.map((skill, i) => (
              <Chip key={i} label={skill} color="primary" variant="outlined" />
            ))}
          </Box>
          {job.minSalary && job.maxSalary && (
            <Typography variant="body2" color="textSecondary">
              Salary: {job.minSalary} - {job.maxSalary} SAR
            </Typography>
          )}
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Posted: {new Date(job.postedDate).toLocaleDateString()}
          </Typography>
        </CardContent>
      </Card>

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Applications ({applications.length})
      </Typography>
      <Grid container spacing={2}>
        {applications.map((app) => (
          <Grid item xs={12} md={6} key={app.id}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>{app.candidateName}</Typography>
              <Typography variant="body2" color="textSecondary">{app.candidateEmail}</Typography>
              <Chip
                label={app.statusArabic || app.status}
                size="small"
                sx={{ mt: 1, bgcolor: app.matchScore >= 80 ? '#4caf50' : '#ffa726', color: '#fff' }}
              />
              {app.matchScore && (
                <Typography variant="caption" sx={{ ml: 1 }}>
                  Match: {Math.round(app.matchScore)}%
                </Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default JobDetail;