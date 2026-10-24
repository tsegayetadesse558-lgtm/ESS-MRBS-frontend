import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Tooltip,
} from '@mui/material';
import {
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  DeleteSweep as ClearAllIcon,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';

// "14:30" -> "2:30 PM"
const formatTime12h = (time24) => {
  if (!time24) return 'N/A';
  const [h, m] = time24.split(':');
  const hour = Number(h);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${m} ${period}`;
};

const BookingHistory = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialog, setCancelDialog] = useState({ open: false, bookingId: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, bookingId: null });
  const [clearAllDialog, setClearAllDialog] = useState({ open: false });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get('/bookings');

      if (response.data && response.data.success) {
        setBookings(response.data.data || []);
      } else if (Array.isArray(response.data)) {
        setBookings(response.data);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.message || 'Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    const bookingId = cancelDialog.bookingId;
    if (!bookingId) return;

    try {
      const response = await axiosInstance.put(`/bookings/${bookingId}/cancel`);
      if (response.data && response.data.success) {
        setSnackbar({ open: true, message: '✅ Booking cancelled successfully', severity: 'success' });
        await fetchBookings();
      } else {
        throw new Error(response.data?.message || 'Failed to cancel booking');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || err.message || 'Failed to cancel booking',
        severity: 'error',
      });
    } finally {
      setCancelDialog({ open: false, bookingId: null });
    }
  };

  const handleDeleteBooking = async () => {
    const bookingId = deleteDialog.bookingId;
    if (!bookingId) return;

    try {
      const response = await axiosInstance.delete(`/bookings/${bookingId}`);
      if (response.data && response.data.success) {
        setSnackbar({ open: true, message: '🗑️ Booking deleted successfully', severity: 'success' });
        await fetchBookings();
      } else {
        throw new Error(response.data?.message || 'Failed to delete booking');
      }
    } catch (err) {
      console.error('Error deleting booking:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || err.message || 'Failed to delete booking',
        severity: 'error',
      });
    } finally {
      setDeleteDialog({ open: false, bookingId: null });
    }
  };

  const handleClearAll = async () => {
    try {
      const bookingsToClear = bookings.filter((b) => {
        const isPast = !isUpcoming(b);
        const isCancelled = b.status?.toLowerCase() === 'cancelled';
        return isPast || isCancelled;
      });

      if (bookingsToClear.length === 0) {
        setSnackbar({ open: true, message: 'No past or cancelled bookings to clear.', severity: 'info' });
        setClearAllDialog({ open: false });
        return;
      }

      await Promise.all(
        bookingsToClear.map((b) => axiosInstance.delete(`/bookings/${b._id}`))
      );

      setSnackbar({ open: true, message: '🗑️ History cleared successfully', severity: 'success' });
      await fetchBookings();
    } catch (err) {
      console.error('Error clearing history:', err);
      setSnackbar({
        open: true,
        message: 'Failed to clear some bookings. Please try again.',
        severity: 'error',
      });
    } finally {
      setClearAllDialog({ open: false });
    }
  };

  const openCancelDialog = (bookingId) => setCancelDialog({ open: true, bookingId });
  const openDeleteDialog = (bookingId) => setDeleteDialog({ open: true, bookingId });

  // ✅ FIXED: Accurate time checking for "is upcoming"
  const isUpcoming = (booking) => {
    if (!booking?.meetingDate) return false;
    
    // Combine date and time into a single Date object
    const datePart = new Date(booking.meetingDate).toISOString().split('T')[0];
    const meetingDateTime = new Date(`${datePart}T${booking.startTime}:00`);
    
    // Get current time
    const now = new Date();
    
    // Returns true if the meeting is happening right now or in the future
    return meetingDateTime >= now;
  };

  // ✅ FIXED: Cancel is allowed for confirmed meetings that haven't started yet
  const isCancelDisabled = (booking) => {
    if (!booking) return true;
    const status = booking.status?.toLowerCase();
    if (status !== 'confirmed') return true;
    if (!isUpcoming(booking)) return true; // Blocks cancel if meeting has already started
    return false;
  };

  // Delete is allowed for anything that isn't a future confirmed meeting
  const isDeleteDisabled = (booking) => {
    if (!booking) return true;
    const status = booking.status?.toLowerCase();
    if (status === 'confirmed' && isUpcoming(booking)) return true;
    return false;
  };

  const getCancelTooltip = (booking) => {
    if (!booking) return 'Booking not found';
    const status = booking.status?.toLowerCase();
    if (status === 'cancelled') return 'This booking has already been cancelled';
    if (status !== 'confirmed') return 'Only confirmed bookings can be cancelled';
    if (!isUpcoming(booking)) return 'Cannot cancel past meetings';
    return 'Cancel this booking';
  };

  const getDeleteTooltip = (booking) => {
    if (!booking) return 'Booking not found';
    if (isDeleteDisabled(booking)) {
      return 'Cancel the booking first before deleting it';
    }
    return 'Delete this booking';
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';
    switch (status.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return null;
    switch (status.toLowerCase()) {
      case 'confirmed': return <CheckCircleIcon fontSize="small" />;
      case 'rejected': return <ErrorIcon fontSize="small" />;
      case 'cancelled': return <CancelIcon fontSize="small" />;
      default: return null;
    }
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" fontWeight="bold">
            My Bookings
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchBookings}>
              Refresh
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<ClearAllIcon />} 
              onClick={() => setClearAllDialog({ open: true })}
              disabled={bookings.length === 0}
            >
              Clear History
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {bookings.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" color="text.secondary">
              No bookings found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              You haven't made any bookings yet. Go to the Rooms page to book a room.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead sx={{ bgcolor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Room</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Time</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tea Service</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => {
                  const cancelDisabled = isCancelDisabled(booking);
                  const deleteDisabled = isDeleteDisabled(booking);

                  return (
                    <TableRow key={booking._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {booking.room?.roomName || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {booking.room?.department || ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {booking.meetingDate
                          ? new Date(booking.meetingDate).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {booking.startTime && booking.endTime
                          ? `${formatTime12h(booking.startTime)} - ${formatTime12h(booking.endTime)}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={booking.teaService ? 'Yes' : 'No'}
                          size="small"
                          color={booking.teaService ? 'success' : 'default'}
                          variant={booking.teaService ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(booking.status)}
                          label={booking.status || 'confirmed'}
                          size="small"
                          color={getStatusColor(booking.status)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                          <Tooltip title={getCancelTooltip(booking)}>
                            <span>
                              <Button
                                size="small"
                                color="error"
                                variant={cancelDisabled ? 'outlined' : 'contained'}
                                startIcon={<CancelIcon />}
                                onClick={() => openCancelDialog(booking._id)}
                                disabled={cancelDisabled}
                                sx={{
                                  textTransform: 'none',
                                  fontWeight: 500,
                                  borderRadius: 2,
                                  minWidth: 70,
                                }}
                              >
                                Cancel
                              </Button>
                            </span>
                          </Tooltip>

                          <Tooltip title={getDeleteTooltip(booking)}>
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => openDeleteDialog(booking._id)}
                                disabled={deleteDisabled}
                                sx={{ opacity: deleteDisabled ? 0.3 : 1 }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Dialogs and Snackbar remain the same */}
        <Dialog open={cancelDialog.open} onClose={() => setCancelDialog({ open: false, bookingId: null })} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CancelIcon color="error" />
            Cancel Booking
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to cancel this booking?
              <br />
              <Typography component="span" color="error" variant="body2">
                This action cannot be undone.
              </Typography>
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelDialog({ open: false, bookingId: null })}>
              No, Keep
            </Button>
            <Button onClick={handleCancelBooking} color="error" variant="contained">
              Yes, Cancel
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, bookingId: null })} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon color="error" />
            Delete Booking
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this booking?
              <br />
              <Typography component="span" color="error" variant="body2">
                This will permanently remove it from your history.
              </Typography>
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, bookingId: null })}>
              Cancel
            </Button>
            <Button onClick={handleDeleteBooking} color="error" variant="contained">
              Yes, Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={clearAllDialog.open} onClose={() => setClearAllDialog({ open: false })} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ClearAllIcon color="error" />
            Clear Booking History
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to clear your history?
              <br />
              <Typography component="span" color="error" variant="body2">
                This will permanently delete all past and cancelled bookings. Upcoming confirmed bookings will not be affected.
              </Typography>
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClearAllDialog({ open: false })}>
              Cancel
            </Button>
            <Button onClick={handleClearAll} color="error" variant="contained">
              Yes, Clear History
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default BookingHistory;