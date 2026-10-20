import React, { useState, useEffect, useMemo } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Snackbar,
  Grid,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import axiosInstance from '../api/axios';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [dialogError, setDialogError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    roomId: null,
    roomName: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [formData, setFormData] = useState({
    buildingNumber: '',
    floorNumber: '',
    department: '',
    roomName: '',
    maxCapacity: '',
    description: '',
    amenities: '',
  });

  const departments = [
    'Director Office',
    'Deputy Director Office',
    'Business Statistics',
    'Household Statistics',
    'Other Departments',
  ];

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setPageError('');
      const response = await axiosInstance.get('/rooms');

      if (response.data && response.data.success) {
        setRooms(response.data.data || []);
      } else if (Array.isArray(response.data)) {
        setRooms(response.data);
      } else {
        setRooms([]);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setPageError(err.response?.data?.message || 'Failed to load rooms');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((room) =>
      (room.roomName || '').toLowerCase().includes(q)
    );
  }, [rooms, searchQuery]);

  const handleOpenDialog = (roomData = null) => {
    setDialogError('');
    if (roomData) {
      setEditingRoom(roomData);
      setFormData({
        buildingNumber: roomData.buildingNumber || '',
        floorNumber: roomData.floorNumber || '',
        department: roomData.department || '',
        roomName: roomData.roomName || '',
        maxCapacity: roomData.maxCapacity || '',
        description: roomData.description || '',
        amenities: Array.isArray(roomData.amenities)
          ? roomData.amenities.join(', ')
          : roomData.amenities || '',
      });
    } else {
      setEditingRoom(null);
      setFormData({
        buildingNumber: '',
        floorNumber: '',
        department: '',
        roomName: '',
        maxCapacity: '',
        description: '',
        amenities: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRoom(null);
    setDialogError('');
    setFormData({
      buildingNumber: '',
      floorNumber: '',
      department: '',
      roomName: '',
      maxCapacity: '',
      description: '',
      amenities: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDialogError('');

    try {
      if (
        !formData.roomName ||
        !formData.buildingNumber ||
        !formData.floorNumber ||
        !formData.department ||
        !formData.maxCapacity
      ) {
        setDialogError('Please fill in all required fields');
        return;
      }

      const data = {
        roomName: formData.roomName.trim(),
        buildingNumber: formData.buildingNumber.trim(),
        floorNumber: formData.floorNumber.trim(),
        department: formData.department,
        maxCapacity: Number(formData.maxCapacity),
        description: formData.description?.trim() || '',
        amenities:
          typeof formData.amenities === 'string'
            ? formData.amenities.split(',').map((i) => i.trim()).filter(Boolean)
            : formData.amenities || [],
      };

      if (editingRoom) {
        const response = await axiosInstance.put(`/rooms/${editingRoom._id}`, data);
        if (response.data && response.data.success) {
          setSnackbar({ open: true, message: '✅ Room updated successfully', severity: 'success' });
          await fetchRooms();
          handleCloseDialog();
        } else {
          throw new Error(response.data?.message || 'Failed to update room');
        }
      } else {
        const response = await axiosInstance.post('/rooms', data);
        if (response.data && response.data.success) {
          setSnackbar({
            open: true,
            message: '✅ Room created — now bookable by all users',
            severity: 'success',
          });
          await fetchRooms();
          handleCloseDialog();
        } else {
          throw new Error(response.data?.message || 'Failed to create room');
        }
      }
    } catch (err) {
      console.error('Error saving room:', err);
      setDialogError(err.response?.data?.message || err.message || 'Operation failed');
    }
  };

  // ---------- Delete room ----------
  const handleDeleteRoom = async () => {
    const { roomId } = deleteDialog;
    if (!roomId) return;

    setProcessingId(roomId);
    try {
      const response = await axiosInstance.delete(`/rooms/${roomId}`);
      if (response.data && response.data.success) {
        setSnackbar({
          open: true,
          message: '🗑️ Room deleted successfully',
          severity: 'success',
        });
        await fetchRooms();
      } else {
        throw new Error(response.data?.message || 'Failed to delete room');
      }
    } catch (err) {
      console.error('Error deleting room:', err);
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message ||
          err.message ||
          'Failed to delete room',
        severity: 'error',
      });
    } finally {
      setProcessingId(null);
      setDeleteDialog({ open: false, roomId: null, roomName: '' });
    }
  };

  const openDeleteDialog = (room) => {
    if (!room?._id) return;
    setDeleteDialog({
      open: true,
      roomId: room._id,
      roomName: room.roomName || 'this room',
    });
  };

  const closeDeleteDialog = () =>
    setDeleteDialog({ open: false, roomId: null, roomName: '' });

  const getStatusChip = (status) => {
    switch ((status || 'available').toLowerCase()) {
      case 'available':
        return <Chip label="Available" size="small" color="success" variant="outlined" />;
      case 'booked':
        return <Chip label="Booked" size="small" color="info" variant="outlined" />;
      case 'maintenance':
        return <Chip label="Maintenance" size="small" color="warning" variant="outlined" />;
      case 'unavailable':
        return <Chip label="Unavailable" size="small" color="default" variant="outlined" />;
      default:
        return <Chip label={status} size="small" variant="outlined" />;
    }
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
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Manage Rooms
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create rooms — they become instantly bookable by all registered users.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexWrap: 'wrap',
              width: { xs: '100%', md: 'auto' },
            }}
          >
            {/* Search bar */}
            <TextField
              size="small"
              placeholder="Search rooms by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ minWidth: { xs: '100%', sm: 260 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchRooms} disabled={loading}>
              Refresh
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
              Add Room
            </Button>
          </Box>
        </Box>

        {pageError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setPageError('')}>
            {pageError}
          </Alert>
        )}

        {searchQuery && (
          <Box sx={{ mb: 2 }}>
            <Chip
              label={`Found ${filteredRooms.length} of ${rooms.length} room${rooms.length === 1 ? '' : 's'}`}
              color="primary"
              variant="outlined"
              size="small"
            />
          </Box>
        )}

        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white' }}>Room Name</TableCell>
                <TableCell sx={{ color: 'white' }}>Building</TableCell>
                <TableCell sx={{ color: 'white' }}>Floor</TableCell>
                <TableCell sx={{ color: 'white' }}>Department</TableCell>
                <TableCell sx={{ color: 'white' }}>Capacity</TableCell>
                <TableCell sx={{ color: 'white' }}>Status</TableCell>
                <TableCell sx={{ color: 'white' }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
                      {rooms.length === 0
                        ? 'No rooms found. Click "Add Room" to create one.'
                        : `No rooms match "${searchQuery}".`}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRooms.map((room) => {
                  const isProcessing = processingId === room._id;
                  return (
                    <TableRow key={room._id || room.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {room.roomName || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>{room.buildingNumber || 'N/A'}</TableCell>
                      <TableCell>{room.floorNumber || 'N/A'}</TableCell>
                      <TableCell>{room.department || 'N/A'}</TableCell>
                      <TableCell>{room.maxCapacity || 0}</TableCell>
                      <TableCell>{getStatusChip(room.status)}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          {/* Edit */}
                          <Tooltip title="Edit room">
                            <span>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenDialog(room)}
                                disabled={isProcessing}
                              >
                                <EditIcon />
                              </IconButton>
                            </span>
                          </Tooltip>

                          {/* Delete */}
                          <Tooltip title="Delete room">
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => openDeleteDialog(room)}
                                disabled={isProcessing}
                              >
                                {isProcessing ? (
                                  <CircularProgress size={18} />
                                ) : (
                                  <DeleteIcon />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add / Edit dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {editingRoom ? '✏️ Edit Room' : '➕ Add New Room'}
              <IconButton onClick={handleCloseDialog}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              {dialogError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDialogError('')}>
                  {dialogError}
                </Alert>
              )}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Room Name"
                    name="roomName"
                    value={formData.roomName}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Building Number"
                    name="buildingNumber"
                    value={formData.buildingNumber}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Floor Number"
                    name="floorNumber"
                    value={formData.floorNumber}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Max Capacity"
                    name="maxCapacity"
                    value={formData.maxCapacity}
                    onChange={handleChange}
                    required
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description (optional)"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Amenities (optional, comma-separated)"
                    name="amenities"
                    value={formData.amenities}
                    onChange={handleChange}
                    placeholder="Projector, Whiteboard, Wi-Fi"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" disabled={loading}>
              {editingRoom ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete confirmation dialog */}
        <Dialog open={deleteDialog.open} onClose={closeDeleteDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon color="error" />
            Delete Room
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete <strong>{deleteDialog.roomName}</strong>?
              <br />
              <Typography component="span" color="error" variant="body2">
                This action cannot be undone.
              </Typography>
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDeleteDialog}>Cancel</Button>
            <Button onClick={handleDeleteRoom} color="error" variant="contained">
              Yes, Delete
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

export default ManageRooms;