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
  Button,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';

// "14:30" -> "2:30 PM"
const formatTime12h = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':');
  const hour = Number(h);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${m} ${period}`;
};

const ManageBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    bookingId: null,
    bookingDetails: null,
  });
  const [processingId, setProcessingId] = useState(null);

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

  const handleDelete = async (bookingId) => {
    if (!bookingId) {
      setSnackbar({ open: true, message: 'Invalid booking ID', severity: 'error' });
      return;
    }

    setProcessingId(bookingId);
    try {
      const response = await axiosInstance.delete(`/bookings/${bookingId}`);
      if (response.data && response.data.success) {
        setSnackbar({ open: true, message: '🗑️ Booking deleted successfully!', severity: 'success' });
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
      setProcessingId(null);
    }
  };

  const openDeleteDialog = (bookingId) => {
    const booking = bookings.find((b) => b._id === bookingId);
    if (!booking) {
      setSnackbar({ open: true, message: 'Booking not found', severity: 'error' });
      return;
    }
    setDeleteDialog({ open: true, bookingId, bookingDetails: booking });
  };

  const handleDeleteConfirm = () => {
    const { bookingId } = deleteDialog;
    setDeleteDialog({ open: false, bookingId: null, bookingDetails: null });
    handleDelete(bookingId);
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, bookingId: null, bookingDetails: null });
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';
    switch (status.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'cancelled':
      case 'canceled': return 'default';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const isProcessing = (bookingId) => processingId === bookingId;

  const getBookedByName = (booking) => {
    if (!booking) return 'N/A';
    const u =
      booking.user ||
      booking.scheduledBy ||
      booking.bookedBy ||
      null;
    if (!u) return 'N/A';
    if (typeof u === 'string') return u;
    return u.fullName || u.username || u.email || 'N/A';
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Manage Bookings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All confirmed room bookings across the system.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchBookings}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white' }}>Room</TableCell>
                <TableCell sx={{ color: 'white' }}>Department</TableCell>
                <TableCell sx={{ color: 'white' }}>Booked By</TableCell>
                <TableCell sx={{ color: 'white' }}>Date</TableCell>
                <TableCell sx={{ color: 'white' }}>Time</TableCell>
                <TableCell sx={{ color: 'white' }}>Tea</TableCell>
                <TableCell sx={{ color: 'white' }}>Status</TableCell>
                <TableCell sx={{ color: 'white' }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!bookings || bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
                      No bookings found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => {
                  const processing = isProcessing(booking._id);
                  return (
                    <TableRow key={booking._id || booking.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {booking.room?.roomName || booking.room?.name || 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell>{booking.room?.department || 'N/A'}</TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {getBookedByName(booking)}
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
                          label={booking.status || 'confirmed'}
                          size="small"
                          color={getStatusColor(booking.status)}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Tooltip title="Delete this booking">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => openDeleteDialog(booking._id)}
                              disabled={processing}
                            >
                              {processing ? (
                                <CircularProgress size={16} />
                              ) : (
                                <DeleteIcon fontSize="small" />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
          <DialogTitle>🗑️ Delete Booking</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Are you sure you want to delete this booking? This action cannot be undone.
            </Typography>
            {deleteDialog.bookingDetails && (
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Room:</strong>{' '}
                  {deleteDialog.bookingDetails.room?.roomName ||
                    deleteDialog.bookingDetails.room?.name ||
                    'N/A'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Department:</strong>{' '}
                  {deleteDialog.bookingDetails.room?.department || 'N/A'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Booked By:</strong> {getBookedByName(deleteDialog.bookingDetails)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Date:</strong>{' '}
                  {deleteDialog.bookingDetails.meetingDate
                    ? new Date(deleteDialog.bookingDetails.meetingDate).toLocaleDateString()
                    : 'N/A'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Time:</strong>{' '}
                  {deleteDialog.bookingDetails.startTime && deleteDialog.bookingDetails.endTime
                    ? `${formatTime12h(deleteDialog.bookingDetails.startTime)} - ${formatTime12h(
                        deleteDialog.bookingDetails.endTime
                      )}`
                    : 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Tea Service:</strong>{' '}
                  {deleteDialog.bookingDetails.teaService ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Current Status:</strong>{' '}
                  <Chip
                    label={deleteDialog.bookingDetails.status || 'confirmed'}
                    size="small"
                    color={getStatusColor(deleteDialog.bookingDetails.status)}
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default ManageBookings;