import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { addRequests } from '../services/firestore';
import { 
    Container, 
    Box, 
    Typography, 
    Button, 
    Paper,
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
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'linear-gradient(45deg, #1a1a2e 0%, #2c134e 100%)',
                    boxShadow: '0 0 20px rgba(192, 132, 252, 0.1)',
                    border: '1px solid rgba(192, 132, 252, 0.1)',
                },
            },
        },
    },
});

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const plans = [
    {
        name: 'Basic',
        price: 9.99,
        requests: 100,
        priceId: import.meta.env.VITE_STRIPE_PRICE_ID_100,
        features: ['100 Generations', 'Priority support']
    },
    {
        name: 'Pro',
        price: 39.99,
        requests: 500,
        priceId: import.meta.env.VITE_STRIPE_PRICE_ID_500,
        features: ['500 Generations', 'Priority support', 'API access (coming soon)']
    }
];

export default function PaymentPlans() {
    const { currentUser } = useAuth();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handlePayment = async (priceId) => {
        try {
            setError(null);
            setLoading(true);
            const stripe = await stripePromise;
            
            // Create checkout session
            const response = await fetch('http://127.0.0.1:5000/api/payment/create-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: currentUser.id,
                    priceId
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create checkout session');
            }
            
            const { sessionId } = await response.json();
            
            if (!sessionId) {
                throw new Error('No session ID received from server');
            }
            
            // Redirect to Stripe Checkout
            const { error: stripeError } = await stripe.redirectToCheckout({
                sessionId,
            });
            
            if (stripeError) {
                throw stripeError;
            }
        } catch (error) {
            console.error('Error creating checkout session:', error);
            setError(error.message || 'Failed to process payment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Listen for successful payment
    React.useEffect(() => {
        const handlePaymentSuccess = async (event) => {
            if (event.data.type === 'payment_success') {
                try {
                    const { requestsAdded, totalRequests } = event.data;
                    // Refresh user data
                    window.location.reload();
                } catch (error) {
                    console.error('Error handling payment success:', error);
                    setError('Failed to update requests. Please contact support.');
                }
            }
        };

        window.addEventListener('message', handlePaymentSuccess);
        return () => window.removeEventListener('message', handlePaymentSuccess);
    }, [currentUser.id]);

    return (
        <ThemeProvider theme={darkTheme}>
            <Box sx={{ 
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
                py: 12
            }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography 
                            variant="h4" 
                            sx={{
                                background: 'linear-gradient(45deg, #c084fc, #e879f9)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                textShadow: '0 0 20px rgba(192, 132, 252, 0.5)',
                                mb: 2
                            }}
                        >
                            Choose Your Plan
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                color: 'text.secondary',
                            }}
                        >
                            Select a plan that best fits your needs
                        </Typography>
                    </Box>

                    {error && (
                        <Box sx={{ 
                            mb: 4, 
                            p: 2, 
                            bgcolor: 'error.main', 
                            color: 'white',
                            borderRadius: 2,
                            textAlign: 'center'
                        }}>
                            {error}
                        </Box>
                    )}

                    <Box sx={{ 
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        gap: 4,
                        maxWidth: '1000px',
                        mx: 'auto'
                    }}>
                        {plans.map((plan) => (
                            <Paper 
                                key={plan.name}
                                elevation={0}
                                sx={{ 
                                    p: 4,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '4px',
                                        background: 'linear-gradient(90deg, #c084fc, #e879f9)',
                                    }
                                }}
                            >
                                <Typography 
                                    variant="h5" 
                                    sx={{ 
                                        color: 'primary.main',
                                        fontWeight: 700,
                                        mb: 2
                                    }}
                                >
                                    {plan.name}
                                </Typography>
                                
                                <Box sx={{ mb: 3 }}>
                                    <Typography 
                                        variant="h3" 
                                        sx={{ 
                                            color: 'white',
                                            fontWeight: 700,
                                            display: 'inline'
                                        }}
                                    >
                                        ${plan.price}
                                    </Typography>
                                    <Typography 
                                        variant="body1" 
                                        sx={{ 
                                            color: 'text.secondary',
                                            display: 'inline',
                                            ml: 1
                                        }}
                                    >
                                        /one-time
                                    </Typography>
                                </Box>

                                <Typography 
                                    variant="body1" 
                                    sx={{ 
                                        color: 'text.secondary',
                                        mb: 3
                                    }}
                                >
                                    {plan.requests} Generations
                                </Typography>

                                <Box sx={{ mb: 4, flex: 1 }}>
                                    {plan.features.map((feature) => (
                                        <Box 
                                            key={feature}
                                            sx={{ 
                                                display: 'flex',
                                                alignItems: 'center',
                                                mb: 2
                                            }}
                                        >
                                            <Box 
                                                sx={{ 
                                                    color: 'primary.main',
                                                    mr: 2,
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <svg
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </Box>
                                            <Typography 
                                                variant="body1"
                                                sx={{ color: 'white' }}
                                            >
                                                {feature}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>

                                <Button
                                    variant="contained"
                                    onClick={() => handlePayment(plan.priceId)}
                                    fullWidth
                                    disabled={loading}
                                    sx={{ 
                                        background: 'linear-gradient(45deg, #c084fc, #e879f9)',
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #e879f9, #c084fc)',
                                        },
                                        '&.Mui-disabled': {
                                            background: 'linear-gradient(45deg, #666, #888)',
                                            color: 'rgba(255, 255, 255, 0.5)',
                                        },
                                    }}
                                >
                                    {loading ? (
                                        <CircularProgress 
                                            size={24} 
                                            sx={{ 
                                                color: 'white',
                                                mr: 1
                                            }} 
                                        />
                                    ) : null}
                                    {loading ? 'Processing...' : 'Get started'}
                                </Button>
                            </Paper>
                        ))}
                    </Box>
                </Container>
            </Box>
        </ThemeProvider>
    );
} 