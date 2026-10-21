import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  LinearProgress,
  useTheme,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

const API = axios.create({ baseURL: 'http://localhost:8080/api' });

const STATUS_COLUMNS = [
  { id: 'APPLIED', title: 'Applied', icon: '📥' },
  { id: 'SCREENING', title: 'Screening', icon: '🔍' },
  { id: 'INTERVIEW_SCHEDULED', title: 'Interview Scheduled', icon: '📅' },
  { id: 'INTERVIEWED', title: 'Interviewed', icon: '🤝' },
  { id: 'OFFER_EXTENDED', title: 'Offer Extended', icon: '📄' },
  { id: 'OFFER_ACCEPTED', title: 'Hired', icon: '🎉' },
  { id: 'REJECTED', title: 'Rejected', icon: '❌' },
];

const KanbanBoard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    fetchApplications();
    fetchJobs();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await API.get('/applications');
      setApplications(res.data.content || []);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load applications');
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await API.get('/jobs');
      setJobs(res.data.content || []);
    } catch (err) {
      console.error('Failed to load jobs');
    }
  };

  const getApplicationsByStatus = (status) => {
    return applications.filter(app => app.status === status);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;

    const updatedApps = applications.map(app => {
      if (app.id === draggableId) {
        return { ...app, status: newStatus };
      }
      return app;
    });
    setApplications(updatedApps);

    try {
      await API.patch(`/applications/${draggableId}/status`, null, {
        params: { status: newStatus }
      });
      toast.success(`Moved to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
      fetchApplications();
    }
  };

  const getJobTitle = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    return job ? job.title : 'Unknown Position';
  };

  if (loading) return <LinearProgress />;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', py: 2 }}>
        {STATUS_COLUMNS.map((column) => (
          <Box
            key={column.id}
            sx={{
              minWidth: 280,
              maxWidth: 320,
              flex: 1,
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              p: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              {column.icon} {column.title}
              <Chip
                label={getApplicationsByStatus(column.id).length}
                size="small"
                sx={{ ml: 1 }}
              />
            </Typography>

            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    minHeight: 300,
                    backgroundColor: snapshot.isDraggingOver
                      ? 'rgba(138, 43, 226, 0.08)'
                      : 'transparent',
                    borderRadius: 1,
                    p: 1,
                  }}
                >
                  {getApplicationsByStatus(column.id).map((app, index) => (
                    <Draggable key={app.id} draggableId={app.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{ mb: 1.5, p: 1 }}
                        >
                          <CardContent>
                            <Typography variant="body2" fontWeight={600}>
                              {app.candidateName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {getJobTitle(app.jobId)}
                            </Typography>
                            {app.matchScore && (
                              <Box sx={{ mt: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={app.matchScore}
                                  sx={{ height: 6, borderRadius: 3 }}
                                />
                                <Typography variant="caption">
                                  {Math.round(app.matchScore)}% match
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </Box>
        ))}
      </Box>
    </DragDropContext>
  );
};

export default KanbanBoard;