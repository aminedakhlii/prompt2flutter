import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    Container, 
    Box, 
    Typography, 
    Button, 
    Paper,
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

export default function Login() {
    const { signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
            navigate('/');
        } catch (error) {
            console.error('Error signing in with Google:', error);
        }
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <Box>
            {/* --- Hero Section --- */}
            <Box sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
                py: { xs: 8, md: 4 }, // Adjust padding for mobile and desktop
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Container maxWidth="lg">
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: 'center',
                        gap: { xs: 6, md: 8 },
                    }}>
                        {/* LEFT SIDE: Headline, Subheadline, CTA */}
                        <Box sx={{
                            flex: 1,
                            textAlign: { xs: 'center', md: 'left' },
                            mb: { xs: 4, md: 0 },
                        }}>
                            <Typography
                                variant="h2"
                                component="h1"
                                sx={{
                                    background: 'linear-gradient(45deg, #c084fc, #e879f9)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    textShadow: '0 0 20px rgba(192, 132, 252, 0.5)',
                                    mb: 2,
                                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' } // Responsive font size
                                }}
                            >
                                Prompt2Flutter: <br /> Your UI, Lightning Fast.
                            </Typography>

                            <Typography
                                variant="h5"
                                sx={{
                                    color: 'text.secondary',
                                    mb: 4,
                                    fontSize: { xs: '1.2rem', md: '1.5rem' } // Responsive font size
                                }}
                            >
                                Describe any UI, get production-ready Flutter code.
                                <br />**No monthly fees. Just pure generation power.**
                            </Typography>

                            <Button
                                variant="contained"
                                onClick={() => handleGoogleSignIn()}
                                size="large"
                                sx={{
                                    background: 'linear-gradient(45deg, #c084fc, #e879f9)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #e879f9, #c084fc)',
                                    },
                                    fontSize: { xs: '1rem', md: '1.2rem' },
                                    px: { xs: 3, md: 5 }, py: { xs: 1, md: 1.5 },
                                }}
                            >
                                Get 10 Free Generations & Try Now!
                            </Button>
                            <Typography variant="caption" sx={{ color: 'text.disabled', mt: 2, display: 'block' }}>
                                Sign in with Google. No credit card required for free generations.
                            </Typography>
                        </Box>

                        {/* RIGHT SIDE: Dynamic Demo/Screenshot */}
                        <Box sx={{
                            flex: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: { xs: '250px', md: '400px' },
                        }}>
                            <Paper elevation={8} sx={{
                                width: '100%',
                                maxWidth: '800px',
                                height: '100%',
                                maxHeight: '800px',
                                borderRadius: 2,
                                overflow: 'hidden',
                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(192, 132, 252, 0.3)',
                                boxShadow: '0 0 40px rgba(192, 132, 252, 0.4)',
                            }}>
                                {/* REPLACE THIS WITH YOUR ACTUAL DEMO GIF/VIDEO */}
                                <video
                                    src="/public/demo.mp4"
                                    autoPlay
                                    muted
                                    loop
                                    controls
                                    alt="Prompt2Flutter Live Demo"
                                    style={{
                                        objectFit: 'fill',
                                        width: '100%',
                                        height: '100%',
                                        display: 'block'
                                    }}
                                />
                            </Paper>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* --- How It Works / Feature Showcase Section --- */}
            <Box sx={{ bgcolor: '#0e0e1a', py: { xs: 6, md: 8 } }}>
                <Container maxWidth="md">
                    <Typography
                        variant="h3"
                        align="center"
                        sx={{
                            mb: { xs: 4, md: 6 },
                            background: 'linear-gradient(45deg, #e879f9, #c084fc)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0 0 15px rgba(232, 121, 249, 0.3)',
                            fontSize: { xs: '2rem', md: '2.8rem' }
                        }}
                    >
                        How Prompt2Flutter Accelerates Your Workflow
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 4, md: 6 } }}>

                        {/* Step 1: Describe */}
                        <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#1a1a2e', color: 'white', borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: { xs: 3, md: 4 } }}>
                                <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                                    <Typography variant="h5" sx={{ mb: { xs: 1, md: 2 }, color: '#c084fc', fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                                        1. Describe Your UI (Your Idea, Our AI)
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: { xs: '0.9rem', md: '1rem' } }}>
                                        Simply type your UI requirements in natural language. Our AI chat understands your vision, from simple buttons to complex responsive layouts. **Each message in the chat that generates new code or edit previously generated code counts as one generation.**
                                    </Typography>
                                    <Box sx={{ mt: { xs: 2, md: 3 }, display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                                        {/* REPLACE THIS WITH YOUR ACTUAL CHAT SCREENSHOT */}
                                        <img src="/public/code generated.png" alt="Chat Interface" style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, border: '1px solid rgba(192, 132, 252, 0.2)' }} />
                                    </Box>
                                </Box>
                                <Box sx={{ flexShrink: 0, fontSize: { xs: '2.5rem', md: '3rem' }, color: '#e879f9' }}>
                                    <i className="fas fa-keyboard"></i>
                                </Box>
                            </Box>
                        </Paper>

                        {/* Step 2: Get Code & Preview */}
                        <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#1a1a2e', color: 'white', borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row-reverse' }, alignItems: 'center', gap: { xs: 3, md: 4 } }}>
                                <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                                    <Typography variant="h5" sx={{ mb: { xs: 1, md: 2 }, color: '#c084fc', fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                                        2. Instant Flutter Code & Live Preview
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: { xs: '0.9rem', md: '1rem' } }}>
                                        Receive clean, well-structured Flutter code instantly. See your design come to life with our integrated **DartPad preview**, ensuring pixel-perfect results before you copy.
                                    </Typography>
                                    <Box sx={{ mt: { xs: 2, md: 3 }, display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
                                        {/* REPLACE THIS WITH YOUR ACTUAL DARTPAD PREVIEW SCREENSHOT */}
                                        <img src="/public/code preview.png" alt="DartPad Preview" style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, border: '1px solid rgba(192, 132, 252, 0.2)' }} />
                                    </Box>
                                </Box>
                                <Box sx={{ flexShrink: 0, fontSize: { xs: '2.5rem', md: '3rem' }, color: '#e879f9' }}>
                                    <i className="fas fa-code"></i>
                                </Box>
                            </Box>
                        </Paper>

                        {/* Step 3: Refine & Fix (Free!) */}
                        <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#1a1a2e', color: 'white', borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: { xs: 3, md: 4 } }}>
                                <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                                    <Typography variant="h5" sx={{ mb: { xs: 1, md: 2 }, color: '#c084fc', fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                                        3. AI-Powered Fixes & Refinements (Absolutely Free!)
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: { xs: '0.9rem', md: '1rem' } }}>
                                        Spot an error or want a slight tweak? Ask our AI to fix or adjust the code directly in the chat. **Any follow-up to fix or refine existing generated code using AI is completely free and won't count against your generations.** This ensures perfect, ready-to-use code.
                                    </Typography>
                                    <Box sx={{ mt: { xs: 2, md: 3 }, display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                                        {/* REPLACE THIS WITH YOUR ACTUAL AI FIX SCREENSHOT */}
                                        <img src="/public/code fix.png" alt="AI Fix in Action" style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, border: '1px solid rgba(192, 132, 252, 0.2)' }} />
                                    </Box>
                                </Box>
                                <Box sx={{ flexShrink: 0, fontSize: { xs: '2.5rem', md: '3rem' }, color: '#e879f9' }}>
                                    <i className="fas fa-magic"></i>
                                </Box>
                            </Box>
                        </Paper>

                    </Box>
                </Container>
            </Box>

            {/* --- Value Proposition / Benefits Section --- */}
            <Box sx={{ bgcolor: '#0a0a0f', py: { xs: 6, md: 8 } }}>
                <Container maxWidth="md">
                    <Typography
                        variant="h4"
                        align="center"
                        sx={{
                            mb: { xs: 4, md: 6 },
                            background: 'linear-gradient(45deg, #c084fc, #e879f9)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0 0 15px rgba(192, 132, 252, 0.3)',
                            fontSize: { xs: '1.8rem', md: '2.5rem' }
                        }}
                    >
                        Why Choose Prompt2Flutter?
                    </Typography>

                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                        gap: { xs: 3, md: 4 }
                    }}>
                        <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, bgcolor: '#1a1a2e', color: 'white', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ color: '#c084fc', mb: 1, fontSize: { xs: '1rem', md: '1.25rem' } }}><i className="fas fa-stopwatch" style={{ marginRight: '8px' }}></i>Rapid Prototyping</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.85rem', md: '0.95rem' } }}>Turn ideas into functional Flutter UIs in minutes, not hours. Validate concepts faster than ever.</Typography>
                        </Paper>
                        <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, bgcolor: '#1a1a2e', color: 'white', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ color: '#c084fc', mb: 1, fontSize: { xs: '1rem', md: '1.25rem' } }}><i className="fas fa-brush" style={{ marginRight: '8px' }}></i>Pixel-Perfect Designs</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.85rem', md: '0.95rem' } }}>Our AI ensures your generated UI is clean, consistent, and ready for integration.</Typography>
                        </Paper>
                        <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, bgcolor: '#1a1a2e', color: 'white', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ color: '#c084fc', mb: 1, fontSize: { xs: '1rem', md: '1.25rem' } }}><i className="fas fa-coins" style={{ marginRight: '8px' }}></i>Cost-Effective & Flexible</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.85rem', md: '0.95rem' } }}>No recurring monthly fees. Only pay for the UI generations you need, when you need them.</Typography>
                        </Paper>
                        <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, bgcolor: '#1a1a2e', color: 'white', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ color: '#c084fc', mb: 1, fontSize: { xs: '1rem', md: '1.25rem' } }}><i className="fas fa-headset" style={{ marginRight: '8px' }}></i>Always-On AI Assistant</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.85rem', md: '0.95rem' } }}>Get immediate help with code fixes and refinements, ensuring your output is always top-notch.</Typography>
                        </Paper>
                    </Box>
                </Container>
            </Box>

            {/* --- Call to Action / Pricing Summary --- */}
            <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a0f 100%)', py: { xs: 6, md: 8 } }}>
                <Container maxWidth="sm">
                    <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#1a1a2e', color: 'white', borderRadius: 2, textAlign: 'center' }}>
                        <Typography
                            variant="h4"
                            sx={{
                                mb: { xs: 2, md: 3 },
                                background: 'linear-gradient(45deg, #e879f9, #c084fc)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                textShadow: '0 0 10px rgba(232, 121, 249, 0.2)',
                                fontSize: { xs: '1.5rem', md: '2rem' }
                            }}
                        >
                            Ready to Supercharge Your Flutter Workflow?
                        </Typography>
                        <Typography variant="h6" sx={{ mb: { xs: 2, md: 3 }, color: 'text.secondary', fontSize: { xs: '1rem', md: '1.25rem' } }}>
                            Start with 10 free generations, then pay only for what you use.
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => handleGoogleSignIn()}
                            size="large"
                            sx={{
                                background: 'linear-gradient(45deg, #c084fc, #e879f9)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #e879f9, #c084fc)',
                                },
                                fontSize: { xs: '1.1rem', md: '1.3rem' },
                                px: { xs: 4, md: 6 }, py: { xs: 1.5, md: 2 },
                                mb: { xs: 1, md: 2 },
                            }}
                        >
                            Start Generating Free
                        </Button>
                        <Typography variant="body2" sx={{ color: 'text.disabled', fontSize: { xs: '0.75rem', md: '0.85rem' } }}>
                            No credit card required for your first 10 generations.
                        </Typography>
                    </Paper>
                </Container>
                <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Cipher Solutions LLC - 2025
                    <br />
                    Contact us at <a href="mailto:hello@cipher-solutions.com">ciphersolutionsllc24@gmail.com</a>
                </Typography>
            </Box>
            </Box>
        </Box>
        </ThemeProvider>
    );
} 