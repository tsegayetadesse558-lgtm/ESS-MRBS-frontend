import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  Analytics,
  Security,
  Public,
  People,
  History,
  EmojiObjects,
  MenuBook,
  Download,
  Lightbulb,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';

const About = () => {
  const navigate = useNavigate();

  const coreValues = [
    { icon: <Public sx={{ fontSize: 40 }} />, title: 'Data Integrity', desc: 'Ensuring accuracy and reliability in all statistical data.' },
    { icon: <Security sx={{ fontSize: 40 }} />, title: 'Confidentiality', desc: 'Protecting sensitive information with utmost care.' },
    { icon: <People sx={{ fontSize: 40 }} />, title: 'Public Service', desc: 'Serving the nation with dedication and transparency.' },
  ];

  const services = [
    { icon: <MenuBook sx={{ fontSize: 40 }} />, title: 'Data Collection', desc: 'Scientific methodologies for comprehensive data gathering.' },
    { icon: <Analytics sx={{ fontSize: 40 }} />, title: 'Data Analysis', desc: 'Advanced analysis for meaningful insights.' },
    { icon: <Download sx={{ fontSize: 40 }} />, title: 'Report Delivery', desc: 'Timely dissemination of statistical reports.' },
    { icon: <Lightbulb sx={{ fontSize: 40 }} />, title: 'Technical Support', desc: 'Capacity building and technical guidance.' },
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

        {/* MAIN CONTENT (No Hero Section, directly starts here) */}
        <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 8 }, pb: { xs: 6, md: 10 }, position: 'relative', zIndex: 1 }}>
          
          {/* Page Title */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h2" fontWeight="600" textAlign="center" color="#0a1628" sx={{ mb: 2, fontSize: { xs: '1.5rem', md: '2.5rem' } }}>
              About Ethiopian Statistics Service
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 400 }}>
              The primary government institution responsible for producing, compiling, and disseminating official statistical data in Ethiopia.
            </Typography>
          </Box>

          {/* Mission & Overview */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 4,
              background: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid #e0e0e0',
              mb: 8,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', borderRadius: 2, mr: 2, display: 'flex' }}>
                <History sx={{ fontSize: 36, color: '#0d47a1' }} />
              </Box>
              <Typography variant="h4" fontWeight="600" color="#0a1628">
                Our Mission
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ lineHeight: 1.8, color: '#334155', mb: 5, fontWeight: 400 }}>
              Statistical data collected and compiled using scientific methodologies are essential for accelerating 
              a country's economic, social, and democratic development, as well as for improving the quality of life. 
              These data enable the government and other institutions to formulate policies across various sectors, 
              monitor and evaluate policy implementations, and make informed decisions for the future.
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', borderRadius: 2, mr: 2, display: 'flex' }}>
                <EmojiObjects sx={{ fontSize: 36, color: '#0d47a1' }} />
              </Box>
              <Typography variant="h4" fontWeight="600" color="#0a1628">
                What We Do
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ lineHeight: 1.8, color: '#334155', mb: 5, fontWeight: 400 }}>
              The Ethiopian Statistics Service (ESS) plays a central role in collecting and compiling data from 
              sample surveys, censuses, and administrative records, as well as analyzing and delivering reports for 
              a wide range of sectors and users. In addition, the ESS provides technical guidance and support to 
              government agencies, institutions, and individuals in establishing robust administrative recording, 
              registration, and reporting systems.
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', borderRadius: 2, mr: 2, display: 'flex' }}>
                <TrendingUp sx={{ fontSize: 36, color: '#0d47a1' }} />
              </Box>
              <Typography variant="h4" fontWeight="600" color="#0a1628">
                Our Commitment
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ lineHeight: 1.8, color: '#334155', fontWeight: 400 }}>
              To meet the growing demand for statistical data and to maintain internationally accepted standards, 
              the ESS is continuously diversifying its statistical methodologies and enhancing the use of technology 
              in its data collection, compilation, classification, analysis, and dissemination processes.
            </Typography>
          </Paper>

          {/* Core Values */}
          <Box sx={{ mb: 8 }}>
            <Box textAlign="center" mb={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                <Divider sx={{ width: 60, bgcolor: '#1565c0', height: 2 }} />
                <Typography variant="subtitle1" sx={{ color: '#1565c0', fontWeight: 700, letterSpacing: '0.1em' }}>
                  WHAT DRIVES US
                </Typography>
                <Divider sx={{ width: 60, bgcolor: '#1565c0', height: 2 }} />
              </Box>
              <Typography variant="h3" fontWeight="600" color="#0a1628">
                Our Core Values
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {coreValues.map((value, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 5,
                      height: '100%',
                      textAlign: 'center',
                      borderRadius: 3,
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#90caf9',
                        boxShadow: '0 8px 24px rgba(21, 101, 192, 0.08)',
                        transform: 'translateY(-5px)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: '#e3f2fd',
                        color: '#1565c0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                      }}
                    >
                      {value.icon}
                    </Box>
                    <Typography variant="h5" fontWeight="600" color="#1a237e" sx={{ mb: 2 }}>
                      {value.title}
                    </Typography>
                    <Typography variant="h6" color="#546e7a" sx={{ lineHeight: 1.6, fontWeight: 400 }}>
                      {value.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Services */}
          <Box>
            <Box textAlign="center" mb={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                <Divider sx={{ width: 60, bgcolor: '#1565c0', height: 2 }} />
                <Typography variant="subtitle1" sx={{ color: '#1565c0', fontWeight: 700, letterSpacing: '0.1em' }}>
                  OUR EXPERTISE
                </Typography>
                <Divider sx={{ width: 60, bgcolor: '#1565c0', height: 2 }} />
              </Box>
              <Typography variant="h3" fontWeight="600" color="#0a1628">
                Our Services
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {services.map((service, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      height: '100%',
                      borderRadius: 3,
                      bgcolor: '#ffffff',
                      borderTop: '4px solid #1565c0',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                        transform: 'translateY(-3px)',
                      },
                    }}
                  >
                    <Box sx={{ color: '#1565c0', mb: 2 }}>
                      {service.icon}
                    </Box>
                    <Typography variant="h5" fontWeight="600" color="#1a237e" sx={{ mb: 2 }}>
                      {service.title}
                    </Typography>
                    <Typography variant="h6" color="#546e7a" sx={{ lineHeight: 1.6, fontWeight: 400 }}>
                      {service.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
          
        </Container>

        {/* FOOTER (Unified with Home Page) */}
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
                        else if (link === 'About') window.scrollTo({ top: 0, behavior: 'smooth' });
                        else if (link === 'Contact') navigate('/contact');
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

export default About;