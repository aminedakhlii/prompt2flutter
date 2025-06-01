import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    Button, 
    ThemeProvider, 
    createTheme,
    CircularProgress
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

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Get the session ID from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');

        if (sessionId) {
            // Fetch the session details from your backend
            fetch(`http://127.0.0.1:5000/api/payment/success?session_id=${sessionId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        console.log('Payment successful:', data);
                        window.location.href = '/';
                        // Close the popup window
                        window.close();
                    } else {
                        setError(data.error || 'Failed to process payment');
                    }
                })
                .catch(error => {
                    console.error('Error fetching session:', error);
                    setError('Failed to process payment. Please contact support.');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setError('No session ID found');
            setLoading(false);
        }
    }, []);

    return (
        <ThemeProvider theme={darkTheme}>
            <Box sx={{ 
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
                p: 3
            }}>
                {loading ? (
                    <CircularProgress 
                        size={60} 
                        sx={{ 
                            color: 'primary.main',
                            mb: 4
                        }} 
                    />
                ) : error ? (
                    <>
                        <Typography 
                            variant="h4" 
                            sx={{
                                color: 'error.main',
                                mb: 4,
                                textAlign: 'center'
                            }}
                        >
                            Payment Error
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                color: 'text.secondary',
                                mb: 4,
                                textAlign: 'center'
                            }}
                        >
                            {error}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/')}
                            sx={{ 
                                background: 'linear-gradient(45deg, #c084fc, #e879f9)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #e879f9, #c084fc)',
                                },
                            }}
                        >
                            Return to App
                        </Button>
                    </>
                ) : (
                    <>
                        <Typography 
                            variant="h4" 
                            sx={{
                                background: 'linear-gradient(45deg, #c084fc, #e879f9)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                textShadow: '0 0 20px rgba(192, 132, 252, 0.5)',
                                mb: 4,
                                textAlign: 'center'
                            }}
                        >
                            Payment Successful!
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                color: 'text.secondary',
                                mb: 4,
                                textAlign: 'center'
                            }}
                        >
                            Your requests have been added to your account.
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/')}
                            sx={{ 
                                background: 'linear-gradient(45deg, #c084fc, #e879f9)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #e879f9, #c084fc)',
                                },
                            }}
                        >
                            Return to App
                        </Button>
                    </>
                )}
            </Box>
        </ThemeProvider>
    );
} 