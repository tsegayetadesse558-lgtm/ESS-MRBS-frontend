import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Divider,
  Fade,
} from '@mui/material';
import {
  Login as LoginIcon,
  MeetingRoom,
  AccessTime as AccessTimeIcon,
  Security as SecurityIcon,
  BarChart as BarChartIcon,
  CheckCircleOutline,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import ImageSlideshow from '../components/ImageSlideshow';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';

// ============================================
// DATA DIRECTLY FROM PROJECT REPORT (Chapter 1.3.2 Goals)
// ============================================
const features = [
  {
    icon: <MeetingRoom sx={{ fontSize: 32, color: '#1565c0' }} />,
    title: 'Centralized Management',
    desc: 'Consolidate all booking activities through a single platform, simplifying administrative oversight and reducing manual coordination efforts.',
  },
  {
    icon: <AccessTimeIcon sx={{ fontSize: 32, color: '#1565c0' }} />,
    title: 'Eliminate Conflicts',
    desc: 'Ensure that no two bookings overlap for the same room through automated availability validation and comprehensive overlap detection logic.',
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 32, color: '#1565c0' }} />,
    title: 'Secure Authentication',
    desc: 'Role-based access control ensures that administrators and employees have the appropriate permissions, protecting sensitive data using JWT.',
  },
  {
    icon: <BarChartIcon sx={{ fontSize: 32, color: '#1565c0' }} />,
    title: 'Data-Driven Insights',
    desc: 'Generate utilization reports and analytics that help management make informed decisions about resource allocation and capacity planning.',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // Checking API connection as per your technical constraints
    const fetchData = async () => {
      try {
        await axiosInstance.get('/rooms');
      } catch (error) {
        console.error('Error connecting to API:', error);
      } finally {
        setLoading(false);
        setAnimated(true);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <Typography>Loading...</Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', overflow: 'hidden', position: 'relative' }}>
        
        {/* DECORATIVE BACKGROUND SHAPES */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: 200, height: 200, overflow: 'hidden', zIndex: 0 }}>
          <Box sx={{ position: 'absolute', top: -50, left: -50, width: 150, height: 150, bgcolor: '#e3f2fd', transform: 'rotate(45deg)' }} />
          <Box sx={{ position: 'absolute', top: 80, left: -50, width: 100, height: 100, bgcolor: '#0d47a1', transform: 'rotate(45deg)' }} />
        </Box>

        {/* IMAGE SLIDESHOW (Existing Component) */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <ImageSlideshow />
        </Box>

        {/* HERO SECTION */}
        <Box sx={{ bgcolor: '#0c2b69', color: 'white', py: { xs: 8, md: 10 }, position: 'relative', zIndex: 1 }}>
          <Container maxWidth="lg">
            <Fade in={animated} timeout={1000}>
              <Box textAlign="center">
                <Typography variant="h6" sx={{ color: '#85b8e2', fontWeight: 500, letterSpacing: '0.15em', mb: 1 }}>
                  የኢትዮጵያ ስታቲስቲክስ አገልግሎት
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 400, letterSpacing: '0.1em', mb: 4 }}>
                  ETHIOPIAN STATISTICAL SERVICE
                </Typography>
                {!isAuthenticated && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<LoginIcon />}
                    onClick={() => navigate('/login')}
                    sx={{
                      bgcolor: 'white', color: '#1a2a5e', px: 5, py: 1.5, borderRadius: '50px',
                      fontWeight: 600, '&:hover': { bgcolor: '#f5f5f5', transform: 'translateY(-2px)' },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Login to Access System
                  </Button>
                )}
              </Box>
            </Fade>
          </Container>
        </Box>

        {/* ==========================================
            PROFESSIONAL FEATURES SECTION
            ========================================== */}
        <Box sx={{ py: { xs: 6, md: 10 }, position: 'relative' }}>
          <Container maxWidth="lg">
            
            <Box textAlign="center" mb={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                <Divider sx={{ width: 60, bgcolor: '#1565c0', height: 2 }} />
                <Typography variant="overline" sx={{ color: '#1565c0', fontWeight: 700, letterSpacing: '0.1em' }}>
                  ESS-MRBS PLATFORM
                </Typography>
                <Divider sx={{ width: 60, bgcolor: '#1565c0', height: 2 }} />
              </Box>
              <Typography variant="h3" fontWeight="800" sx={{ color: '#0d47a1', mb: 2, fontSize: { xs: '2rem', md: '2.8rem' } }}>
                A Smarter Way to Manage Meeting Spaces
              </Typography>
              <Typography variant="h6" sx={{ color: '#546e7a', fontWeight: 400, fontSize: { xs: '1rem', md: '1.2rem' } }}>
                Automating room reservation management, eliminating scheduling conflicts, and providing real-time visibility.
              </Typography>
            </Box>

            <Grid container spacing={4} alignItems="stretch">
              
              {/* LEFT SIDE: Visual Graphic */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    height: '100%',
                    minHeight: '400px',
                    borderRadius: 4,
                    backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid #e0e0e0',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: 'linear-gradient(to top, rgba(13, 71, 161, 0.8), rgba(13, 71, 161, 0.1))'
                    }
                  }}
                >
                  {/* Floating Mockup Card representing real data */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 30,
                      right: 30,
                      bgcolor: 'white',
                      p: 3,
                      borderRadius: 3,
                      width: '280px',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: '#0d47a1' }}>
                      Real-Time Availability
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                      <Box sx={{ p: 1, bgcolor: '#e8f5e9', borderRadius: 1, borderLeft: '4px solid #2e7d32' }}>
                        <Typography variant="caption" fontWeight="bold" color="#2e7d32">Meeting Room 101</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Available Today</Typography>
                      </Box>
                      <Box sx={{ p: 1, bgcolor: '#ffebee', borderRadius: 1, borderLeft: '4px solid #c62828' }}>
                        <Typography variant="caption" fontWeight="bold" color="#c62828">Meeting Room 203</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Double Booking Prevented</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* RIGHT SIDE: 2x2 Feature Grid */}
              <Grid item xs={12} md={6}>
                <Grid container spacing={2.5}>
                  {features.map((feature, i) => (
                    <Grid item xs={12} sm={6} key={i}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          height: '100%',
                          borderRadius: 3,
                          border: '1px solid #e0e0e0',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#90caf9',
                            boxShadow: '0 8px 24px rgba(21, 101, 192, 0.08)',
                            transform: 'translateY(-3px)'
                          }
                        }}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            bgcolor: '#e3f2fd',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: '#1a237e', fontSize: '1.1rem' }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#546e7a', lineHeight: 1.6 }}>
                          {feature.desc}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* ==========================================
            BOTTOM BANNER (Badges)
            ========================================== */}
        <Box sx={{ bgcolor: '#f0f4f8', py: 4, borderTop: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' }}>
          <Container maxWidth="lg">
            <Grid container justifyContent="center" alignItems="center" spacing={4}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', borderRadius: '50%' }}>
                    <MeetingRoom sx={{ color: '#1565c0' }} />
                  </Box>
                  <Typography variant="subtitle1" fontWeight="600" color="#1a237e">Centralized Booking</Typography>
                </Box>
              </Grid>
              
              <Grid item md={0.5} sx={{ display: { xs: 'none', md: 'block' } }}>
                <Divider orientation="vertical" sx={{ height: 30 }} />
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', borderRadius: '50%' }}>
                    <CheckCircleOutline sx={{ color: '#1565c0' }} />
                  </Box>
                  <Typography variant="subtitle1" fontWeight="600" color="#1a237e">Zero Double Bookings</Typography>
                </Box>
              </Grid>

              <Grid item md={0.5} sx={{ display: { xs: 'none', md: 'block' } }}>
                <Divider orientation="vertical" sx={{ height: 30 }} />
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', borderRadius: '50%' }}>
                    <AccessTimeIcon sx={{ color: '#1565c0' }} />
                  </Box>
                  <Typography variant="subtitle1" fontWeight="600" color="#1a237e">Real-Time Visibility</Typography>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* FOOTER (Original ESS Information from Document) */}
        <Box sx={{ bgcolor: '#0a255c', color: 'rgba(255,255,255,0.7)', py: 5 }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                  የኢትዮጵያ ስታቲስቲክስ አገልግሎት
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', mb: 3 }}>
                  ETHIOPIAN STATISTICAL SERVICE
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', mb: 1, fontSize: '0.8rem' }}>HEADQUARTERS</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', mb: 0.5 }}>2QH3+9P8, Churchill Road, Addis Ababa</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', mb: 0.5 }}>Tele: +251-11553112, +251-11553011</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', mb: 0.5 }}>P.O.Box: 1143</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Email: info@ess.gov.et</Typography>
              </Grid>
              
              <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>Quick Links</Typography>
                  {['Home', 'About', 'Contact'].map((link) => (
                    <Typography
                      key={link}
                      variant="body2"
                      onClick={() => {
                        if (link === 'Home') window.scrollTo({ top: 0, behavior: 'smooth' });
                        else if (link === 'About') navigate('/about');
                        else if (link === 'Contact') navigate('/contact');
                      }}
                      sx={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer', py: 0.5, fontSize: '0.85rem', '&:hover': { color: '#85b8e2' } }}
                    >
                      {link}
                    </Typography>
                  ))}
                </Box>
              </Grid>
            </Grid>
            <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
            <Typography variant="body2" textAlign="center" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
              © 2026 All Rights Reserved. Ethiopian Statistical Service
            </Typography>
          </Container>
        </Box>

      </Box>
    </>
  );
};

export default Home;