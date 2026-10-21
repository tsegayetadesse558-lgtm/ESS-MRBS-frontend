import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  MeetingRoom,
  BookOnline,
  People,
  PersonAdd,
  Room,
  Assessment,
  EventAvailable,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRooms: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    rejectedBookings: 0,
    cancelledBookings: 0,
    todayBookings: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [usersRes, roomsRes, bookingsRes] = await Promise.all([
        axiosInstance.get('/users'),
        axiosInstance.get('/rooms'),
        axiosInstance.get('/bookings'),
      ]);

      const users = usersRes.data.data || [];
      const rooms = roomsRes.data.data || [];
      const bookings = bookingsRes.data.data || [];

      const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;
      const cancelledBookings = bookings.filter((b) => b.status === 'cancelled').length;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayBookings = bookings.filter((b) => {
        if (!b.meetingDate) return false;
        const d = new Date(b.meetingDate);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      }).length;

      setStats({
        totalUsers: users.length,
        totalRooms: rooms.length,
        totalBookings: bookings.length,
        confirmedBookings,
        cancelledBookings,
        todayBookings,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
        <Navbar />
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <People sx={{ fontSize: { xs: 32, md: 40 } }} />,
      color: '#0d59a6',
      action: '/admin/users',
    },
    {
      title: 'Total Rooms',
      value: stats.totalRooms,
      icon: <MeetingRoom sx={{ fontSize: { xs: 32, md: 40 } }} />,
      color: '#0a5b9e',
      action: '/admin/rooms',
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: <BookOnline sx={{ fontSize: { xs: 32, md: 40 } }} />,
      color: '#0a5ea3',
      action: '/admin/bookings',
    },
    {
      title: "Today's Bookings",
      value: stats.todayBookings,
      icon: <EventAvailable sx={{ fontSize: { xs: 32, md: 40 } }} />,
      color: '#064d9e',
      action: '/admin/bookings',
    },
  ];

  return (
    // ✅ The outer Box ensures the background fills the whole screen perfectly
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <Navbar />
      
      {/* ✅ flexGrow: 1 pushes the footer down and stretches the content area */}
      <Box sx={{ flexGrow: 1, py: { xs: 3, md: 4 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
          
          <Box sx={{ mb: { xs: 3, md: 4 } }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '2rem', md: '2.125rem' } }}>
              Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {user?.fullName || 'Admin'}! Here is an overview of the system.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}

          {/* Stat cards */}
          <Grid container spacing={2} sx={{ mb: { xs: 4, md: 5 } }}>
            {statCards.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={1}
                  sx={{
                    p: { xs: 2, md: 3 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: 2,
                    cursor: stat.action ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: stat.action ? 4 : 1, transform: 'translateY(-2px)' },
                  }}
                  onClick={() => stat.action && navigate(stat.action)}
                >
                  <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '2rem', md: '2.125rem' } }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Quick Actions */}
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2} sx={{ mb: { xs: 4, md: 5 } }}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<PersonAdd />}
                onClick={() => navigate('/admin/users')}
                sx={{ py: 1.5, bgcolor: '#08437a', '&:hover': { bgcolor: '#0f72d6' } }}
              >
                Manage Users
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<Room />}
                onClick={() => navigate('/admin/rooms')}
                sx={{ py: 1.5, bgcolor: '#08437a', '&:hover': { bgcolor: '#0f72d6' } }}
              >
                Manage Rooms
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<BookOnline />}
                onClick={() => navigate('/admin/bookings')}
                sx={{ py: 1.5, bgcolor: '#094381', '&:hover': { bgcolor: '#0e76e6' } }}
              >
                Manage Bookings
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<Assessment />}
                onClick={() => navigate('/admin/reports')}
                sx={{ py: 1.5, bgcolor: '#094883', '&:hover': { bgcolor: '#1284e2' } }}
              >
                View Reports
              </Button>
            </Grid>
          </Grid>

          {/* Booking Statistics */}
          <Paper elevation={1} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
              Booking Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f0fdf4', borderRadius: 1 }}>
                  <Typography variant="h5" color="success.main" fontWeight="bold">
                    {stats.confirmedBookings}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Confirmed
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f3f4f6', borderRadius: 1 }}>
                  <Typography variant="h5" color="text.secondary" fontWeight="bold">
                    {stats.cancelledBookings}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cancelled
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#eff6ff', borderRadius: 1 }}>
                  <Typography variant="h5" color="info.main" fontWeight="bold">
                    {stats.todayBookings}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard;