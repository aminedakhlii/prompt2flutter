// Replace this top-level App component

import React, { useState } from 'react';
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
  Tooltip
} from '@mui/material';
import axios from 'axios';

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

function App() {
  const [prompt, setPrompt] = useState('');
  const [design, setDesign] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDesign('');

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/generate', {
        prompt
      });
      const generatedCode = response.data.design;
      setDesign(generatedCode);
    } catch (err) {
      setError('Failed to generate design. Please try again.');
      console.error(err);
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

  return (
    <ThemeProvider theme={darkTheme}>
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
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  placeholder="Describe the UI design you want to generate..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  sx={{ 
                    mb: 3,
                    '& .MuiInputBase-input': {
                      color: '#ffffff',
                    },
                  }}
                />
                <Button 
                  variant="contained" 
                  type="submit" 
                  disabled={loading || !prompt}
                  fullWidth
                  sx={{ 
                    background: 'linear-gradient(45deg, #c084fc, #e879f9)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #e879f9, #c084fc)',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Design'}
                </Button>
              </form>
            </Paper>

            {error && (
              <Typography color="error" align="center">
                {error}
              </Typography>
            )}

            {design && (
              <Paper elevation={0} sx={{ p: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Generated Code</Typography>
                  <Box>
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
            )}
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
