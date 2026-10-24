import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Divider,
  FormControlLabel,
  Switch,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  MeetingRoom,
  People,
  LocationOn,
  Close as CloseIcon,
  BookOnline,
  AccessTime as TimeIcon,
  Business as BuildingIcon,
  LocalCafe as TeaIcon,
  EventAvailable as EventIcon,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import TicketDialog from '../components/TicketDialog';

// ---------- Time helpers ----------
const HOURS = [
  { value: '00', label: '12 AM' }, { value: '01', label: '1 AM' }, { value: '02', label: '2 AM' },
  { value: '03', label: '3 AM' }, { value: '04', label: '4 AM' }, { value: '05', label: '5 AM' },
  { value: '06', label: '6 AM' }, { value: '07', label: '7 AM' }, { value: '08', label: '8 AM' },
  { value: '09', label: '9 AM' }, { value: '10', label: '10 AM' }, { value: '11', label: '11 AM' },
  { value: '12', label: '12 PM' }, { value: '13', label: '1 PM' }, { value: '14', label: '2 PM' },
  { value: '15', label: '3 PM' }, { value: '16', label: '4 PM' }, { value: '17', label: '5 PM' },
  { value: '18', label: '6 PM' }, { value: '19', label: '7 PM' }, { value: '20', label: '8 PM' },
  { value: '21', label: '9 PM' }, { value: '22', label: '10 PM' }, { value: '23', label: '11 PM' },
];

const pad2 = (n) => String(n).padStart(2, '0');

const isValidMinute = (m) => {
  if (m === '' || m === null || m === undefined) return false;
  if (!/^\d{1,2}$/.test(String(m))) return false;
  const n = Number(m);
  return n >= 0 && n <= 59;
};

const formatTime12h = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':');
  const hour = Number(h);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${m} ${period}`;
};

const MENU_PROPS = {
  PaperProps: {
    sx: {
      maxHeight: 320,
      '& ul': { py: 0 },
    },
  },
};

const Rooms = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [allBookings, setAllBookings] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [departments, setDepartments] = useState([]);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const [form, setForm] = useState({
    meetingTitle: '',
    meetingDate: '',
    startHour: '09',
    startMinute: '00',
    endHour: '10',
    endMinute: '00',
    teaService: false,
  });

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleRoom, setScheduleRoom] = useState(null);
  const [roomBookings, setRoomBookings] = useState([]);

  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // ✅ The backend now returns ALL bookings (both personal + everyone else's confirmed)
      const [roomsRes, bookingsRes] = await Promise.all([
        axiosInstance.get('/rooms'),
        axiosInstance.get('/bookings') 
      ]);

      let roomsData = roomsRes.data?.data || roomsRes.data || [];
      let bookingsData = bookingsRes.data?.data || bookingsRes.data || [];

      if (!Array.isArray(roomsData)) roomsData = roomsData.rooms || roomsData.docs || [];
      if (!Array.isArray(bookingsData)) bookingsData = bookingsData.bookings || bookingsData.docs || [];

      roomsData = roomsData.filter(
        (r) => (r.status || 'available').toLowerCase() !== 'maintenance'
      );

      setRooms(roomsData);
      setAllBookings(bookingsData);

      const depts = [...new Set(roomsData.map((r) => r.department).filter(Boolean))];
      setDepartments(depts);

      if (roomsData.length === 0) {
        setError('No rooms are currently available. Please check back later.');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSchedule = (room) => {
    // ✅ Filters the global bookings to find any confirmed booking for this room
    const thisRoomBookings = allBookings.filter((b) => {
      const bRoomId = b.room?._id || b.room;
      return bRoomId === room._id && b.status === 'confirmed';
    });

    thisRoomBookings.sort((a, b) => {
      const dateCompare = new Date(a.meetingDate) - new Date(b.meetingDate);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });

    if (thisRoomBookings.length === 0) {
      // If there are truly no bookings, skip to form
      handleOpenBooking(room);
    } else {
      // If there are bookings (by anyone), show the schedule popup
      setScheduleRoom(room);
      setRoomBookings(thisRoomBookings);
      setScheduleOpen(true);
    }
  };

  const handleOpenBooking = (room) => {
    setSelectedRoom(room);
    setForm({
      meetingTitle: '',
      meetingDate: new Date().toISOString().split('T')[0],
      startHour: '09',
      startMinute: '00',
      endHour: '10',
      endMinute: '00',
      teaService: false,
    });
    setBookingError('');
    setBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setBookingOpen(false);
    setSelectedRoom(null);
    setBookingError('');
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const safeStartMin = isValidMinute(form.startMinute) ? pad2(form.startMinute) : '00';
  const safeEndMin = isValidMinute(form.endMinute) ? pad2(form.endMinute) : '00';
  const startTime = `${form.startHour}:${safeStartMin}`;
  const endTime = `${form.endHour}:${safeEndMin}`;

  const showPreview = startTime < endTime;

  const handleSubmitBooking = async () => {
    setBookingError('');

    if (!form.meetingTitle.trim()) {
      setBookingError('Please enter a meeting title.');
      return;
    }

    if (!form.meetingDate) {
      setBookingError('Please select a meeting date.');
      return;
    }

    if (!isValidMinute(form.startMinute)) {
      setBookingError('Start minute must be a number between 0 and 59.');
      return;
    }
    if (!isValidMinute(form.endMinute)) {
      setBookingError('End minute must be a number between 0 and 59.');
      return;
    }

    if (startTime >= endTime) {
      setBookingError('End time must be after start time.');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        roomId: selectedRoom._id,
        meetingTitle: form.meetingTitle.trim(),
        meetingDate: form.meetingDate,
        startTime,
        endTime,
        teaService: form.teaService,
      };

      const response = await axiosInstance.post('/bookings', payload);
      const booking = response.data?.data || response.data;

      setTicketData(booking);
      setTicketOpen(true);
      setSnackbar({
        open: true,
        message: '✅ Room booked successfully!',
        severity: 'success',
      });
      handleCloseBooking();
      fetchData(); 
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.status === 409
          ? 'The room is unavailable for the selected time.'
          : 'Failed to create booking. Please try again.');

      setBookingError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseTicket = () => {
    setTicketOpen(false);
    setTicketData(null);
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const filteredRooms = filterDepartment
    ? rooms.filter((r) => r.department === filterDepartment)
    : rooms;

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
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <MeetingRoom sx={{ color: '#063b70' }} />
              Meeting Rooms
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.fullName ? `Welcome, ${user.fullName}!` : 'Please log in to book a room'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              select
              size="small"
              label="Filter by Department"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              sx={{ minWidth: 200 }}
              SelectProps={{ MenuProps: MENU_PROPS }}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </TextField>
            <Chip label={`Rooms: ${filteredRooms.length}`} color="primary" variant="outlined" />
          </Box>
        </Box>

        {error && (
          <Alert severity="info" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Room grid */}
        {filteredRooms.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No rooms available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {rooms.length === 0
                ? 'No rooms are currently available. Please check back later.'
                : 'No rooms match the selected department.'}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredRooms.map((room) => (
              <Grid item xs={12} sm={6} md={4} key={room._id}>
                <Card
                  elevation={3}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      gutterBottom
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <MeetingRoom fontSize="small" color="primary" />
                      {room.roomName || 'Unnamed Room'}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}
                    >
                      <LocationOn fontSize="small" />
                      {room.department || 'N/A'}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}
                    >
                      <BuildingIcon fontSize="small" />
                      Building {room.buildingNumber || 'N/A'} • Floor {room.floorNumber || 'N/A'}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}
                    >
                      <People fontSize="small" />
                      Max Capacity: {room.maxCapacity || 0} people
                    </Typography>

                    {room.description && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {room.description}
                        </Typography>
                      </>
                    )}

                    {Array.isArray(room.amenities) && room.amenities.length > 0 && (
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {room.amenities.map((a, idx) => (
                          <Chip key={idx} label={a} size="small" variant="outlined" />
                        ))}
                      </Box>
                    )}
                  </CardContent>

                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<BookOnline />}
                      onClick={() => handleViewSchedule(room)}
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        bgcolor: '#063b70',
                        '&:hover': { bgcolor: '#0f6bd4' },
                      }}
                    >
                      Book Room
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* View Schedule Dialog */}
        <Dialog open={scheduleOpen} onClose={() => setScheduleOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: '#063b70', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Availability: {scheduleRoom?.roomName}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {scheduleRoom?.department}
              </Typography>
            </Box>
            <IconButton onClick={() => setScheduleOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box>
              <Alert severity="warning" sx={{ mb: 3 }}>
                This room has upcoming bookings. Please select different time.
              </Alert>
              <List disablePadding>
                {roomBookings.map((booking, index) => (
                  <ListItem 
                    key={booking._id} 
                    divider={index !== roomBookings.length - 1}
                    sx={{ px: 1, py: 2, borderLeft: '4px solid #c62828', bgcolor: '#fafafa', mb: 1, borderRadius: 1 }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="#0a1628">
                            {new Date(booking.meetingDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </Typography>
                          <Chip label="Booked" size="small" variant="outlined" sx={{ maxWidth: 150 }} />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <TimeIcon fontSize="small" />
                          Booked from <strong>{formatTime12h(booking.startTime)}</strong> to <strong>{formatTime12h(booking.endTime)}</strong>
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
            <Button onClick={() => setScheduleOpen(false)}>Close</Button>
            <Button 
              variant="contained" 
              onClick={() => {
                setScheduleOpen(false);
                handleOpenBooking(scheduleRoom);
              }}
              sx={{ bgcolor: '#063b70' }}
            >
              Proceed to Booking
            </Button>
          </DialogActions>
        </Dialog>

        {/* Booking dialog */}
        <Dialog open={bookingOpen} onClose={handleCloseBooking} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Book: {selectedRoom?.roomName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedRoom?.department} • Capacity: {selectedRoom?.maxCapacity || 0}
                </Typography>
              </Box>
              <IconButton onClick={handleCloseBooking}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent>
            {bookingError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {bookingError}
              </Alert>
            )}

            <TextField
              fullWidth
              required
              label="Meeting Title"
              name="meetingTitle"
              value={form.meetingTitle}
              onChange={handleFormChange}
              sx={{ mt: 1, mb: 2 }}
            />

            <TextField
              fullWidth
              type="date"
              label="Meeting Date"
              name="meetingDate"
              value={form.meetingDate}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
              sx={{ mb: 3 }}
            />

            {/* -------- Start Time -------- */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <TimeIcon fontSize="small" />
              <strong>Start Time</strong>
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={7}>
                <TextField
                  fullWidth
                  select
                  label="Hour"
                  name="startHour"
                  value={form.startHour}
                  onChange={handleFormChange}
                  SelectProps={{ MenuProps: MENU_PROPS }}
                >
                  {HOURS.map((h) => (
                    <MenuItem key={h.value} value={h.value}>
                      {h.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  type="number"
                  label="Minute"
                  name="startMinute"
                  value={form.startMinute}
                  onChange={handleFormChange}
                  inputProps={{ min: 0, max: 59, step: 1 }}
                  helperText="0 – 59"
                />
              </Grid>
            </Grid>

            {/* -------- End Time -------- */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <TimeIcon fontSize="small" />
              <strong>End Time</strong>
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={7}>
                <TextField
                  fullWidth
                  select
                  label="Hour"
                  name="endHour"
                  value={form.endHour}
                  onChange={handleFormChange}
                  SelectProps={{ MenuProps: MENU_PROPS }}
                >
                  {HOURS.map((h) => (
                    <MenuItem key={h.value} value={h.value}>
                      {h.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  type="number"
                  label="Minute"
                  name="endMinute"
                  value={form.endMinute}
                  onChange={handleFormChange}
                  inputProps={{ min: 0, max: 59, step: 1 }}
                  helperText="0 – 59"
                />
              </Grid>
            </Grid>

            {showPreview ? (
              <Alert severity="success" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  You are booking from <strong>{formatTime12h(startTime)}</strong> to{' '}
                  <strong>{formatTime12h(endTime)}</strong>.
                </Typography>
              </Alert>
            ) : (
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  The system will check if the room is free for the selected time. If another
                  booking overlaps, your request will be rejected.
                </Typography>
              </Alert>
            )}
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              py: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              borderTop: '1px solid #e0e0e0',
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  name="teaService"
                  checked={form.teaService}
                  onChange={handleFormChange}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TeaIcon fontSize="small" color="primary" />
                  <Typography variant="body2" fontWeight="600">
                    Tea Service
                  </Typography>
                </Box>
              }
              sx={{ m: 0 }}
            />

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button onClick={handleCloseBooking} disabled={submitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitBooking}
                variant="contained"
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={16} /> : <BookOnline />}
              >
                {submitting ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </Box>
          </DialogActions>
        </Dialog>

        <TicketDialog open={ticketOpen} onClose={handleCloseTicket} booking={ticketData} />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default Rooms;