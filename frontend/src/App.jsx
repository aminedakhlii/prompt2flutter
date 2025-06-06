// Replace this top-level App component

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Paper,
  CircularProgress,
  ThemeProvider,
  createTheme,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import PaymentPlans from './components/PaymentPlans';
import { decrementRequests } from './services/firestore';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancelled from './pages/PaymentCancelled';
import { ChatProvider, useChat } from './contexts/ChatContext';
import ChatSidebar from './components/ChatSidebar';
import ChatMessage from './components/ChatMessage';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';

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
    h6: {
      color: '#c084fc',
      fontWeight: 600,
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
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
            '& fieldset': {
              borderColor: '#c084fc',
              borderWidth: 2,
            },
            '&:hover fieldset': {
              borderColor: '#c084fc',
              borderWidth: 2,
            },
            '&.Mui-focused fieldset': {
              borderColor: '#c084fc',
              borderWidth: 2,
            },
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

// Protected Route component
function ProtectedRoute({ children }) {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser, navigate]);
    
    if (!currentUser) {
        return null;
    }
    
    return children;
}

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error);
    console.error('Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {this.state.error?.message}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Reload Page
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Main App component
function AppContent() {
    const { currentUser, logout } = useAuth();
    const { currentConversation, messages, addMessage, isLoading, createNewConversation, conversations, selectConversation, error: chatError } = useChat();
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [design, setDesign] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isDarkTheme, setIsDarkTheme] = useState(true);
    const [hasRoundedCorners, setHasRoundedCorners] = useState(true);
    const [showPaymentPlans, setShowPaymentPlans] = useState(false);
    const [codeToEdit, setCodeToEdit] = useState("");
    const [showChat, setShowChat] = useState(false);

    console.log('AppContent render:', {
        currentUser: currentUser?.id,
        hasConversations: conversations?.length > 0,
        currentConversation: currentConversation?.id,
        isLoading,
        chatError
    });

    useEffect(() => {
        console.log('AppContent mounted/updated:', {
            currentUser: currentUser?.id,
            hasConversations: conversations?.length > 0,
            currentConversation: currentConversation?.id
        });
    }, [currentUser, conversations, currentConversation]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        try {
            if (currentUser.remaining_requests <= 0) {
                console.log('No remaining requests, showing payment plans');
                setShowPaymentPlans(true);
                return;
            }

            setLoading(true);
            setError(null);

            // Store the user's message temporarily
            const userMessage = prompt;
            // Clear the prompt field immediately
            setPrompt('');

            // Create a new conversation only if we don't have one
            let conversation = currentConversation;
            if (!conversation) {
                console.log('Creating new conversation for initial generation');
                conversation = await createNewConversation();
                if (!conversation) {
                    throw new Error('Failed to create new conversation');
                }
            }

            await addMessage(userMessage, true, conversation.id);

            // Send request to backend
            const response = await fetch('https://api.prompt2flutter.online/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: userMessage,
                    isDarkTheme,
                    hasRoundedCorners,
                    toEdit: codeToEdit,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate design');
            }

            const data = await response.json();
            console.log('Received response from backend:', data);

            // Decrement requests in Firestore
            console.log('Decrementing requests');
            await decrementRequests(currentUser.id);

            // Add AI response to the conversation
            await addMessage(data.design, false, conversation.id);
            
            // Switch to chat view after first generation
            if (!showChat) {
                console.log('Switching to chat view');
                setShowChat(true);
            }

        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(design);
    };

    const downloadCode = () => {
        const blob = new Blob([design], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'flutter_ui.dart';
        link.click();
    };

    const updateDartPad = (code) => {
        const iframe = document.getElementById('dartpad-iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'updateCode',
                code: code
            }, '*');
        }
    };

    if (showPaymentPlans) {
        return <PaymentPlans />;
    }

    if (!currentUser) {
        console.log('Rendering login screen');
        return (
            <Box sx={{ 
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
                py: 4,
            }}>
                <Container maxWidth="md">
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <Typography 
                            variant="h4" 
                            align="center"
                            sx={{
                                background: 'linear-gradient(45deg, #c084fc, #e879f9)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                textShadow: '0 0 20px rgba(192, 132, 252, 0.5)',
                            }}
                        >
                            Prompt2Flutter
                        </Typography>

                        <Paper elevation={0} sx={{ p: 4 }}>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Typography variant="h5" sx={{ mb: 2, color: 'primary.main' }}>
                                    Welcome to Prompt2Flutter
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                                    Sign in to start generating beautiful Flutter UI designs
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/login')}
                                    sx={{ 
                                        background: 'linear-gradient(45deg, #c084fc, #e879f9)',
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #e879f9, #c084fc)',
                                        },
                                    }}
                                >
                                    Sign In
                                </Button>
                            </Box>
                        </Paper>
                    </Box>
                </Container>
            </Box>
        );
    }

    console.log('Rendering main app content');
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
            {/* Navigation Bar */}
            <Box 
                sx={{ 
                    background: 'linear-gradient(45deg, #1a1a2e 0%, #2c134e 100%)',
                    borderBottom: '1px solid rgba(192, 132, 252, 0.1)',
                    boxShadow: '0 0 20px rgba(192, 132, 252, 0.1)',
                }}
            >
                <Container maxWidth="xl">
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        height: 64,
                    }}>
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                color: 'primary.main',
                                fontWeight: 700,
                                textShadow: '0 0 10px rgba(192, 132, 252, 0.5)',
                            }}
                        >
                            Prompt2Flutter
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography 
                                variant="body2" 
                                sx={{ color: 'white' }}
                            >
                                {currentUser.email}
                            </Typography>
                            <Typography 
                                variant="body2" 
                                sx={{ color: 'white' }}
                            >
                                Available Generations: {currentUser.remaining_requests}
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={logout}
                                sx={{ 
                                    color: 'primary.main',
                                    borderColor: 'primary.main',
                                    '&:hover': {
                                        borderColor: 'secondary.main',
                                        color: 'secondary.main',
                                    },
                                }}
                            >
                                Logout
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Main Content */}
            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {conversations.length > 0 && <ChatSidebar />}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress />
                        </Box>
                    ) : currentConversation ? (
                        <>
                            <Box 
                                sx={{ 
                                    flex: 1, 
                                    overflow: 'auto', 
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    '&::-webkit-scrollbar': {
                                        width: '8px',
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        background: 'rgba(192, 132, 252, 0.1)',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        background: 'rgba(192, 132, 252, 0.3)',
                                        borderRadius: '4px',
                                    },
                                    '&::-webkit-scrollbar-thumb:hover': {
                                        background: 'rgba(192, 132, 252, 0.5)',
                                    },
                                }}
                            >
                                {messages.map((message) => (
                                    <ChatMessage 
                                        key={message.id} 
                                        message={message} 
                                        onEditCode={setCodeToEdit}
                                    />
                                ))}
                            </Box>
                            <Box sx={{ p: 2, borderTop: '1px solid rgba(192, 132, 252, 0.1)' }}>
                                <form onSubmit={handleSubmit}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {codeToEdit && (
                                            <Box sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: 1,
                                                bgcolor: 'rgba(192, 132, 252, 0.1)',
                                                p: 1,
                                                borderRadius: 1
                                            }}>
                                                <AttachFileIcon sx={{ color: 'primary.main' }} />
                                                <Typography variant="body2" sx={{ color: 'primary.main' }}>
                                                    Editing previous code
                                                </Typography>
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => setCodeToEdit(null)}
                                                    sx={{ color: 'primary.main' }}
                                                >
                                                    <CloseIcon />
                                                </IconButton>
                                            </Box>
                                        )}
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                            <TextField
                                                fullWidth
                                                value={prompt}
                                                onChange={(e) => setPrompt(e.target.value)}
                                                placeholder="Describe your Flutter UI..."
                                                variant="outlined"
                                                disabled={loading}
                                            />
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                disabled={loading || !prompt.trim()}
                                            >
                                                {loading ? <CircularProgress size={24} /> : 'Generate'}
                                            </Button>
                                        </Box>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            gap: 2, 
                                            alignItems: 'center',
                                            mt: 1,
                                            px: 1
                                        }}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={isDarkTheme}
                                                        onChange={(e) => setIsDarkTheme(e.target.checked)}
                                                        color="secondary"
                                                    />
                                                }
                                                label="Dark Theme"
                                                sx={{ color: 'white' }}
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={hasRoundedCorners}
                                                        onChange={(e) => setHasRoundedCorners(e.target.checked)}
                                                        color="secondary"
                                                    />
                                                }
                                                label="Rounded Corners"
                                                sx={{ color: 'white' }}
                                            />
                                        </Box>
                                    </Box>
                                </form>
                            </Box>
                        </>
                    ) : (
                        <Container maxWidth="md" sx={{ 
                            py: 4,
                            height: '100%',
                            overflow: 'auto',
                            '&::-webkit-scrollbar': {
                                width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: 'rgba(192, 132, 252, 0.1)',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: 'rgba(192, 132, 252, 0.3)',
                                borderRadius: '4px',
                            },
                            '&::-webkit-scrollbar-thumb:hover': {
                                background: 'rgba(192, 132, 252, 0.5)',
                            },
                        }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <Paper elevation={0} sx={{ p: 4 }}>
                                    <form onSubmit={handleSubmit}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={9}
                                            variant="outlined"
                                            placeholder="Describe the UI design you want to generate..."
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            sx={{ mb: 3 }}
                                        />
                                        <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            mb: 3
                                        }}>
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={isDarkTheme}
                                                            onChange={(e) => setIsDarkTheme(e.target.checked)}
                                                            color="secondary"
                                                        />
                                                    }
                                                    label="Dark Theme"
                                                    sx={{ color: 'white' }}
                                                />
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={hasRoundedCorners}
                                                            onChange={(e) => setHasRoundedCorners(e.target.checked)}
                                                            color="secondary"
                                                        />
                                                    }
                                                    label="Rounded Corners"
                                                    sx={{ color: 'white' }}
                                                />
                                            </Box>
                                            <Button 
                                                variant="contained" 
                                                type="submit" 
                                                disabled={loading || !prompt}
                                                sx={{ 
                                                    maxWidth: '200px',
                                                    background: 'linear-gradient(45deg, #c084fc, #e879f9)',
                                                    '&:hover': {
                                                        background: 'linear-gradient(45deg, #e879f9, #c084fc)',
                                                    },
                                                }}
                                            >
                                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Design'}
                                            </Button>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Cipher Solutions LLC - 2025
                                        </Typography>
                                    </form>
                                    
                                </Paper>

                                {error && (
                                    <Typography color="error" align="center">
                                        {error}
                                    </Typography>
                                )}

                                {design && (
                                    <>
                                        <Paper elevation={0} sx={{ p: 4 }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                                <Typography variant="h6">Generated Code</Typography>
                                                <Box sx={{ display: 'flex', gap: 2 }}>
                                                    <Tooltip title="Copy to Clipboard">
                                                        <Button onClick={copyToClipboard} color="secondary" variant="outlined">
                                                            Copy Code
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip title="Download Code">
                                                        <Button onClick={downloadCode} color="secondary" variant="outlined">
                                                            Download Code
                                                        </Button>
                                                    </Tooltip>
                                                </Box>
                                            </Box>
                                            <Typography 
                                                component="pre" 
                                                sx={{ 
                                                    whiteSpace: 'pre-wrap',
                                                    fontFamily: 'monospace',
                                                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                                                    p: 3,
                                                    borderRadius: 2,
                                                    border: '1px solid rgba(192, 132, 252, 0.2)',
                                                    color: '#c084fc',
                                                }}
                                            >
                                                {design}
                                            </Typography>
                                        </Paper>

                                        <Paper elevation={0} sx={{ p: 4 }}>
                                            <Typography variant="h6" gutterBottom>
                                                Live Preview
                                            </Typography>
                                            <iframe
                                                id="dartpad-iframe"
                                                src={`https://dartpad.dev/embed-flutter.html?theme=dark&run=true&code=${design}`}
                                                style={{
                                                    width: '100%',
                                                    height: '1000px',
                                                    border: 'none',
                                                    borderRadius: '16px',
                                                    boxShadow: '0 0 20px rgba(192, 132, 252, 0.2)',
                                                }}
                                                title="DartPad Preview"
                                            />
                                        </Paper>
                                    </>
                                )}
                            </Box>
                        </Container>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

// Root App component with providers
export default function App() {
    console.log('App component rendering');
    return (
        <ErrorBoundary>
            <ThemeProvider theme={darkTheme}>
                <AuthProvider>
                    <ChatProvider>
                        <Router>
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route path="/payment-success" element={<PaymentSuccess />} />
                                <Route path="/payment-cancelled" element={<PaymentCancelled />} />
                                <Route
                                    path="/"
                                    element={
                                        <ProtectedRoute>
                                            <AppContent />
                                        </ProtectedRoute>
                                    }
                                />
                            </Routes>
                        </Router>
                    </ChatProvider>
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}
