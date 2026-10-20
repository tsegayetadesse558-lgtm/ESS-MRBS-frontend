import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Skeleton,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  MeetingRoom,
  BookOnline,
  EventAvailable,
  ArrowForward as ArrowForwardIcon,
  CheckCircle,
  Cancel,
  CalendarToday,
  AccessTime,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    myBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    upcomingBookings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError('');

      const roomsRes = await axiosInstance.get('/rooms');
      const rooms = roomsRes.data?.data || roomsRes.data || [];

      const bookingsRes = await axiosInstance.get('/bookings');
      const bookings = bookingsRes.data?.data || bookingsRes.data || [];

      const now = new Date();

      const myBookings = bookings.filter((b) => {
        const userId =
          b.user?._id || b.user?.id || b.user || null;
        return userId && String(userId) === String(user?.id || user?._id);
      });

      const confirmedBookings = myBookings.filter(
        (b) => b.status?.toLowerCase() === 'confirmed'
      ).length;
      const cancelledBookings = myBookings.filter(
        (b) => b.status?.toLowerCase() === 'cancelled'
      ).length;

      const upcomingBookings = myBookings.filter((b) => {
        if (b.status?.toLowerCase() !== 'confirmed') return false;
        const date = new Date(b.meetingDate);
        const [h, m] = (b.endTime || '00:00').split(':').map(Number);
        date.setHours(h, m, 0, 0);
        return date >= now;
      }).length;

      setStats({
        totalRooms: rooms.length,
        availableRooms: rooms.filter(
          (r) => r.status?.toLowerCase() === 'available'
        ).length,
        myBookings: myBookings.length,
        confirmedBookings,
        cancelledBookings,
        upcomingBookings,
      });

      const sorted = [...myBookings].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentBookings(sorted.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(
        err.response?.data?.message || 'Failed to load dashboard data'
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const s = status?.toLowerCase() || '';
    switch (s) {
      case 'confirmed':
        return (
          <Chip
            icon={<CheckCircle />}
            label="Confirmed"
            size="small"
            color="success"
            variant="outlined"
          />
        );
      case 'cancelled':
        return (
          <Chip
            icon={<Cancel />}
            label="Cancelled"
            size="small"
            color="default"
            variant="outlined"
          />
        );
      case 'rejected':
        return (
          <Chip
            icon={<Cancel />}
            label="Rejected"
            size="small"
            color="error"
            variant="outlined"
          />
        );
      default:
        return (
          <Chip label={status || 'Unknown'} size="small" variant="outlined" />
        );
    }
  };

  const statsCards = [
    {
      icon: <MeetingRoom sx={{ fontSize: 28 }} />,
      value: stats.totalRooms,
      label: 'Total Rooms',
      color: '#07437e',
      iconBg: '#d4dde4',
      onClick: () => navigate('/rooms'),
    },
    {
      icon: <BookOnline sx={{ fontSize: 28 }} />,
      value: stats.myBookings,
      label: 'My Bookings',
      color: '#0b457f',
      iconBg: '#d3dce3',
      onClick: () => navigate('/bookings'),
    },
    {
      icon: <EventAvailable sx={{ fontSize: 28 }} />,
      value: stats.upcomingBookings,
      label: 'Upcoming',
      color: '#083979',
      iconBg: '#d4dbe3',
      onClick: () => navigate('/bookings'),
    },
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh' }}>
          <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2, mb: 2 }} />
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              {[1, 2, 3].map((i) => (
                <Grid item xs={6} md={4} key={i}>
                  <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          </Container>
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh' }}>
        <Container
          maxWidth={false}
          sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 1, sm: 1.5, md: 4 } }}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Box sx={{ mb: { xs: 1.5, sm: 2, md: 4.5 } }}>
              <Typography
                variant="h5"
                fontWeight="600"
                sx={{
                  fontSize: { xs: '1.8rem', sm: '2.1rem', md: '2.4rem' },
                  color: '#082857',
                  mb: 1.5,
                }}
              >
                User Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Welcome back, {user?.fullName?.split(' ')[0] || 'User'}!
              </Typography>
            </Box>
          </motion.div>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Stat cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {statsCards.map((stat, i) => (
              <Grid item xs={6} md={4} key={i}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Paper
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 },
                    }}
                    onClick={stat.onClick}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: '50%',
                          bgcolor: stat.iconBg,
                          color: stat.color,
                          display: 'flex',
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Box>
                        <Typography
                          variant="h4"
                          fontWeight="bold"
                          color={stat.color}
                        >
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stat.label}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Booking status */}
          <Paper sx={{ p: 2.5, borderRadius: 3, mb: 2.5 }}>
            <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1.5 }}>
              My Booking Status
            </Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#d6dee4', borderRadius: 2 }}>
                  <Typography variant="h4" color="#0b4b94">
                    {stats.confirmedBookings}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Confirmed
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={
                      stats.myBookings > 0
                        ? (stats.confirmedBookings / stats.myBookings) * 100
                        : 0
                    }
                    sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                    color="success"
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#dee4ea', borderRadius: 2 }}>
                  <Typography variant="h4" color="#0e57b1">
                    {stats.cancelledBookings}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cancelled
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={
                      stats.myBookings > 0
                        ? (stats.cancelledBookings / stats.myBookings) * 100
                        : 0
                    }
                    sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                    color="error"
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Quick actions */}
          <Box sx={{ mb: 2.5, textAlign: 'center' }}>
            <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1.5 }}>
              Quick Actions
            </Typography>
            <Grid
              container
              spacing={1.5}
              sx={{ justifyContent: 'center', maxWidth: '60%', mx: 'auto' }}
            >
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<MeetingRoom />}
                  onClick={() => navigate('/rooms')}
                  sx={{ py: 1.2, borderRadius: 2, bgcolor: '#063b85', '&:hover': { bgcolor: '#1271f6' } }}
                >
                  Book a Room
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<BookOnline />}
                  onClick={() => navigate('/bookings')}
                  sx={{ py: 1.2, borderRadius: 2, bgcolor: '#073b84', '&:hover': { bgcolor: '#1271f6' } }}
                >
                  My Bookings
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Recent bookings */}
          <Paper sx={{ p: 2.5, borderRadius: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1.5,
              }}
            >
              <Typography variant="subtitle1" fontWeight="600">
                Recent Bookings
              </Typography>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/bookings')}
              >
                View All
              </Button>
            </Box>

            {recentBookings.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <EventAvailable sx={{ fontSize: 36, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No recent bookings.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1, borderRadius: 2 }}
                  onClick={() => navigate('/rooms')}
                >
                  Book a Room
                </Button>
              </Box>
            ) : (
              recentBookings.map((booking) => (
                <Card
                  key={booking._id}
                  sx={{
                    mb: 1,
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 2, transform: 'translateX(2px)' },
                    transition: 'all 0.15s',
                  }}
                  onClick={() => navigate(`/bookings/${booking._id}`)}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1.5,
                      '&:last-child': { pb: 1.5 },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: '#0b56a1', width: 32, height: 32 }}>
                        <MeetingRoom sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="600">
                          {booking.room?.roomName || 'Unknown Room'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}
                          >
                            <CalendarToday sx={{ fontSize: 12 }} />
                            {new Date(booking.meetingDate).toLocaleDateString()}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}
                          >
                            <AccessTime sx={{ fontSize: 12 }} />
                            {booking.startTime} - {booking.endTime}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box>{getStatusChip(booking.status)}</Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default Dashboard;