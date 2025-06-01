import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Container, 
    Box, 
    Typography, 
    Button,
    ThemeProvider,
    createTheme
} from '@mui/material';

// Purple cyberpunk theme
const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#c084fc', // Neon purple
        },
        secondary: {
            main: '#e879f9', // Lighter pink-purple
        },
        background: {
            default: '#0a0a0f',
            paper: '#1a1a2e',
        },
        text: {
            primary: '#ffffff',
            secondary: '#c084fc',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 700,
            textShadow: '0 0 10px rgba(192, 132, 252, 0.5)',
        },
    },
    shape: {
        borderRadius: 16,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 25,
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '12px 24px',
                    boxShadow: '0 0 20px rgba(192, 132, 252, 0.3)',
                    '&:hover': {
                        boxShadow: '0 0 30px rgba(192, 132, 252, 0.5)',
                    },
                },
            },
        },
    },
});

export default function PaymentCancelled() {
    const navigate = useNavigate();

    return (
        <ThemeProvider theme={darkTheme}>
            <Box sx={{ 
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
            }}>
                <Container maxWidth="sm">
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography 
                            variant="h4" 
                            sx={{
                                background: 'linear-gradient(45deg, #c084fc, #e879f9)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                textShadow: '0 0 20px rgba(192, 132, 252, 0.5)',
                                mb: 4
                            }}
                        >
                            Payment Cancelled
                        </Typography>
                        
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                color: 'text.secondary',
                                mb: 4 
                            }}
                        >
                            Your payment was cancelled. You can try again when you're ready.
                        </Typography>

                        <Button
                            variant="contained"
                            onClick={() => navigate('/plans')}
                            sx={{ 
                                background: 'linear-gradient(45deg, #c084fc, #e879f9)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #e879f9, #c084fc)',
                                },
                            }}
                        >
                            Back to Plans
                        </Button>
                    </Box>
                </Container>
            </Box>
        </ThemeProvider>
    );
} 