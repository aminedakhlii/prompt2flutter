import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Button, 
    Box,
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
        h6: {
            fontWeight: 700,
            textShadow: '0 0 10px rgba(192, 132, 252, 0.5)',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 25,
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '8px 16px',
                },
            },
        },
    },
});

export default function Navbar() {
    const { currentUser, signInWithGoogle, logout } = useAuth();
    const navigate = useNavigate();
    const [remainingRequests, setRemainingRequests] = useState(0);

    useEffect(() => {
        // Listen for payment success messages
        const handlePaymentSuccess = (event) => {
            if (event.data.type === 'payment_success') {
                setRemainingRequests(event.data.totalRequests);
                if (event.data.message) {
                    console.log(event.data.message);
                }
            }
        };

        window.addEventListener('message', handlePaymentSuccess);
        return () => window.removeEventListener('message', handlePaymentSuccess);
    }, []);

    useEffect(() => {
        if (currentUser) {
            // Get remaining requests from Firestore
            const fetchRequests = async () => {
                try {
                    const response = await fetch(`http://127.0.0.1:5000/api/user/requests?userId=${currentUser.id}`);
                    const data = await response.json();
                    if (data.success) {
                        setRemainingRequests(data.remainingRequests);
                    }
                } catch (error) {
                    console.error('Error fetching requests:', error);
                }
            };
            fetchRequests();
        }
    }, [currentUser]);

    return (
        <ThemeProvider theme={darkTheme}>
            <AppBar 
                position="static" 
                sx={{ 
                    background: 'linear-gradient(90deg, #1a1a2e 0%, #2c134e 100%)',
                    boxShadow: '0 0 20px rgba(192, 132, 252, 0.1)',
                }}
            >
                <Toolbar>
                    <Typography 
                        variant="h6" 
                        component="div" 
                        sx={{ 
                            flexGrow: 1,
                            cursor: 'pointer',
                            background: 'linear-gradient(45deg, #c084fc, #e879f9)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            '&:hover': {
                                textShadow: '0 0 20px rgba(192, 132, 252, 0.8)',
                            },
                        }}
                        onClick={() => navigate('/')}
                    >
                        Prompt2Flutter
                    </Typography>
                    
                    {currentUser ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography 
                                variant="body1" 
                                sx={{ 
                                    color: 'text.secondary',
                                    fontWeight: 600,
                                }}
                            >
                                {remainingRequests} requests left
                            </Typography>
                            <Button 
                                variant="outlined" 
                                onClick={logout}
                                sx={{ 
                                    borderColor: 'primary.main',
                                    color: 'primary.main',
                                    '&:hover': {
                                        borderColor: 'secondary.main',
                                        color: 'secondary.main',
                                    },
                                }}
                            >
                                Logout
                            </Button>
                        </Box>
                    ) : (
                        <Button 
                            variant="contained" 
                            onClick={signInWithGoogle}
                            sx={{ 
                                background: 'linear-gradient(45deg, #c084fc, #e879f9)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #e879f9, #c084fc)',
                                },
                            }}
                        >
                            Sign in with Google
                        </Button>
                    )}
                </Toolbar>
            </AppBar>
        </ThemeProvider>
    );
} 