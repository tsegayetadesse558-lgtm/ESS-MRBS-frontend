import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';

const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterDateRange, setFilterDateRange] = useState({ start: '', end: '' });
  const [departments, setDepartments] = useState([]);

  // Report data
  const [departmentUtilization, setDepartmentUtilization] = useState([]);
  const [roomFrequency, setRoomFrequency] = useState([]);
  const [bookingTrends, setBookingTrends] = useState([]);
  const [teaServiceData, setTeaServiceData] = useState({ total: 0, withTea: 0, withoutTea: 0 });

  const COLORS = ['#1976d2', '#05346e', '#074cac', '#0b5ac7', '#0f60d1'];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (bookings.length > 0 && rooms.length > 0) {
      generateReports();
    }
  }, [bookings, rooms, filterDepartment, filterDateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [bookingsRes, roomsRes] = await Promise.all([
        axiosInstance.get('/bookings'),
        axiosInstance.get('/rooms'),
      ]);

      // ✅ Fix: Handle different response structures
      const bookingsData = bookingsRes.data?.data || bookingsRes.data || [];
      const roomsData = roomsRes.data?.data || roomsRes.data || [];

      console.log('📋 Bookings data:', bookingsData);
      console.log('📋 Rooms data:', roomsData);

      setBookings(bookingsData);
      setRooms(roomsData);

      // Extract departments from rooms
      const depts = [...new Set(roomsData.map(r => r.department).filter(Boolean))];
      setDepartments(depts);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const generateReports = () => {
    // ✅ Get room lookup map for quick access
    const roomMap = {};
    rooms.forEach(room => {
      roomMap[room._id] = room;
    });

    // Filter bookings
    let filteredBookings = [...bookings];

    // ✅ Filter by department (check if room belongs to department)
    if (filterDepartment) {
      const roomIdsInDepartment = rooms
        .filter(r => r.department === filterDepartment)
        .map(r => r._id);
      filteredBookings = filteredBookings.filter(b => {
        const bookingRoomId = b.room?._id || b.room;
        return roomIdsInDepartment.includes(bookingRoomId);
      });
    }

    // Filter by date range
    if (filterDateRange.start) {
      filteredBookings = filteredBookings.filter(
        b => new Date(b.meetingDate) >= new Date(filterDateRange.start)
      );
    }
    if (filterDateRange.end) {
      filteredBookings = filteredBookings.filter(
        b => new Date(b.meetingDate) <= new Date(filterDateRange.end)
      );
    }

    console.log('📊 Filtered bookings count:', filteredBookings.length);

    // 1. Department Utilization
    const deptStats = {};
    rooms.forEach(room => {
      const dept = room.department || 'Unassigned';
      if (!deptStats[dept]) {
        deptStats[dept] = { total: 0, booked: 0, available: 0 };
      }
      deptStats[dept].total += 1;
      if (room.status === 'booked') deptStats[dept].booked += 1;
      if (room.status === 'available') deptStats[dept].available += 1;
    });

    const deptData = Object.keys(deptStats).map(dept => ({
      department: dept,
      total: deptStats[dept].total,
      booked: deptStats[dept].booked,
      available: deptStats[dept].available,
      utilizationRate: deptStats[dept].total > 0
        ? Math.round((deptStats[dept].booked / deptStats[dept].total) * 100)
        : 0,
    }));
    setDepartmentUtilization(deptData);

    // 2. Most Frequently Used Rooms
    const roomCount = {};
    filteredBookings.forEach(b => {
      const roomId = b.room?._id || b.room;
      if (roomId) {
        if (!roomCount[roomId]) roomCount[roomId] = 0;
        roomCount[roomId] += 1;
      }
    });

    const roomFrequencyData = Object.keys(roomCount)
      .map(roomId => {
        const room = roomMap[roomId];
        return {
          roomName: room?.roomName || 'Unknown Room',
          count: roomCount[roomId],
          department: room?.department || 'Unknown',
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    setRoomFrequency(roomFrequencyData);

    // 3. Booking Trends (by month)
    const monthStats = {};
    filteredBookings.forEach(b => {
      const date = new Date(b.meetingDate);
      if (!isNaN(date.getTime())) {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthStats[key]) monthStats[key] = 0;
        monthStats[key] += 1;
      }
    });

    const trendData = Object.keys(monthStats)
      .sort()
      .map(key => ({
        month: key,
        bookings: monthStats[key],
      }));
    setBookingTrends(trendData);

    // 4. Tea Service Statistics
    const withTea = filteredBookings.filter(b => b.teaService === true).length;
    const withoutTea = filteredBookings.length - withTea;
    setTeaServiceData({
      total: filteredBookings.length,
      withTea,
      withoutTea,
    });

    console.log('📊 Reports generated:', {
      deptData: deptData.length,
      roomFrequencyData: roomFrequencyData.length,
      trendData: trendData.length,
      teaService: { withTea, withoutTea }
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
          Reports & Analytics
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {rooms.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Total Rooms</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {bookings.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Total Bookings</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {teaServiceData.withTea}
                </Typography>
                <Typography variant="body2" color="text.secondary">Tea Service Requests</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="secondary.main">
                  {teaServiceData.total > 0
                    ? Math.round((teaServiceData.withTea / teaServiceData.total) * 100)
                    : 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">Tea Service Rate</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={4}>
          {/* Department Utilization */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Room Utilization by Department
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentUtilization}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#084e94" name="Total Rooms" />
                  <Bar dataKey="booked" fill="#0a3869" name="Booked Rooms" />
                  <Bar dataKey="available" fill="#0f7ff0" name="Available Rooms" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Most Used Rooms */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Most Frequently Used Rooms
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roomFrequency} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="roomName" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#094ea3" name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Booking Trends */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Booking Trends Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bookingTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="bookings" stroke="#1976d2" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Tea Service */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Tea Service Requests
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'With Tea', value: teaServiceData.withTea },
                      { name: 'Without Tea', value: teaServiceData.withoutTea },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#0a4e97" />
                    <Cell fill="#1083ee" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Reports;