import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Stack,
  Button,
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Email,
  AccessTime,
  LinkedIn,
  Twitter,
  Facebook,
  YouTube,
  Telegram,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';

const Contact = () => {
  const navigate = useNavigate();
  
  const contactInfo = [
    {
      icon: <LocationOn sx={{ fontSize: 36 }} />,
      title: 'Headquarters',
      details: ['2QH3+9P8, Churchill Road', 'Addis Ababa, Ethiopia'],
      color: '#1565c0',
    },
    {
      icon: <Phone sx={{ fontSize: 36 }} />,
      title: 'Phone',
      details: ['+251-11553112', '+251-11553011'],
      color: '#1565c0',
    },
    {
      icon: <Email sx={{ fontSize: 36 }} />,
      title: 'Email',
      details: ['info@ess.gov.et'],
      color: '#1565c0',
    },
    {
      icon: <AccessTime sx={{ fontSize: 36 }} />,
      title: 'Office Hours',
      details: ['Monday - Friday', '8:00 AM - 5:00 PM'],
      color: '#1565c0',
    },
  ];

  const socialLinks = [
    { icon: <Facebook />, url: 'https://www.facebook.com/essethiopia', color: '#1877F2' },
    { icon: <Telegram />, url: 'https://t.me/ess_statistics', color: '#0088cc' },
    { icon: <Twitter />, url: '#', color: '#1DA1F2' },
    { icon: <LinkedIn />, url: '#', color: '#0A66C2' },
    { icon: <YouTube />, url: '#', color: '#FF0000' },
  ];

  return (
    <>
      <Navbar />
      <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', overflow: 'hidden', position: 'relative' }}>
        
        {/* DECORATIVE BACKGROUND SHAPES (Top Left) */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: 200, height: 200, overflow: 'hidden', zIndex: 0 }}>
          <Box sx={{ position: 'absolute', top: -50, left: -50, width: 150, height: 150, bgcolor: '#e3f2fd', transform: 'rotate(45deg)' }} />
          <Box sx={{ position: 'absolute', top: 80, left: -50, width: 100, height: 100, bgcolor: '#0d47a1', transform: 'rotate(45deg)' }} />
        </Box>

        {/* MAIN CONTENT (No Hero Section) */}
        <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 8 }, pb: { xs: 6, md: 10 }, position: 'relative', zIndex: 1 }}>
          
          {/* Page Title */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h2" fontWeight="600" textAlign="center" color="#0a1628" sx={{ mb: 2, fontSize: { xs: '1.5rem', md: '2.5rem' } }}>
              Contact Us
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 400 }}>
              Get in touch with the Ethiopian Statistical Service. We are here to assist you.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Contact Information */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 4, md: 5 },
                  borderRadius: 4,
                  background: 'white',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  border: '1px solid #e0e0e0',
                  height: '100%',
                }}
              >
                <Typography variant="h4" fontWeight="700" sx={{ mb: 4, color: '#0a1628' }}>
                  Contact Information
                </Typography>

                <Grid container spacing={3}>
                  {contactInfo.map((info, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          bgcolor: '#f8f9fa',
                          height: '100%',
                          border: '1px solid #e0e0e0',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: '#e3f2fd',
                            borderColor: '#90caf9',
                            transform: 'translateY(-4px)',
                          },
                        }}
                      >
                        <Box sx={{ color: info.color, mb: 2 }}>
                          {info.icon}
                        </Box>
                        <Typography variant="h6" fontWeight="700" color="#1a237e" sx={{ mb: 1 }}>
                          {info.title}
                        </Typography>
                        {info.details.map((detail, i) => (
                          <Typography key={i} variant="body1" color="#546e7a" sx={{ mb: 0.5 }}>
                            {detail}
                          </Typography>
                        ))}
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Divider sx={{ my: 4 }} />

                <Box>
                  <Typography variant="h5" fontWeight="700" color="#0a1628" sx={{ mb: 3 }}>
                    Connect With Us
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                    {socialLinks.map((social, index) => (
                      <Button
                        key={index}
                        variant="outlined"
                        href={social.url}
                        target="_blank"
                        sx={{
                          minWidth: 0,
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          color: social.color,
                          borderColor: social.color,
                          '&:hover': {
                            bgcolor: social.color,
                            color: 'white',
                            borderColor: social.color,
                          },
                        }}
                      >
                        {social.icon}
                      </Button>
                    ))}
                  </Stack>
                </Box>
              </Paper>
            </Grid>

            {/* Map Section */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 4, md: 5 },
                  borderRadius: 4,
                  background: 'white',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  border: '1px solid #e0e0e0',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography variant="h4" fontWeight="700" sx={{ mb: 4, color: '#0a1628' }}>
                  Find Us Here
                </Typography>
                <Box
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    flexGrow: 1,
                    minHeight: { xs: 300, md: 400 },
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <Box
                    component="iframe"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.021616592602!2d38.7425!3d9.03!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b851eb7e12719%3A0x7df5df1e7b3f169e!2sEthiopian%20Statistical%20Service!5e0!3m2!1sen!2set!4v1700000000000"
                    sx={{
                      width: '100%',
                      height: '100%',
                      border: 0,
                    }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="ESS Location Map"
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>

        {/* FOOTER (Unified with Home & About pages) */}
        <Box sx={{ bgcolor: '#0a255c', color: 'rgba(255,255,255,0.7)', py: 5 }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                  የኢትዮጵያ ስታቲስቲክስ አገልግሎት
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', mb: 3 }}>
                  ETHIOPIAN STATISTICAL SERVICE
                </Typography>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.4)', mb: 1 }}>HEADQUARTERS</Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>2QH3+9P8, Churchill Road, Addis Ababa</Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>Tele: +251-11553112, +251-11553011</Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>P.O.Box: 1143</Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>Email: info@ess.gov.et</Typography>
              </Grid>
              
              <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Box>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>Quick Links</Typography>
                  {['Home', 'About', 'Contact'].map((link) => (
                    <Typography
                      key={link}
                      variant="body1"
                      onClick={() => {
                        if (link === 'Home') navigate('/');
                        else if (link === 'About') navigate('/about');
                        else if (link === 'Contact') window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      sx={{ color: 'rgba(255,255,255,0.7)', cursor: 'pointer', py: 1, fontSize: '1rem', '&:hover': { color: '#85b8e2' } }}
                    >
                      {link}
                    </Typography>
                  ))}
                </Box>
              </Grid>
            </Grid>
            <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
            <Typography variant="body1" textAlign="center" sx={{ color: 'rgba(255,255,255,0.4)' }}>
              © 2026 All Rights Reserved. Ethiopian Statistical Service
            </Typography>
          </Container>
        </Box>

      </Box>
    </>
  );
};

export default Contact;