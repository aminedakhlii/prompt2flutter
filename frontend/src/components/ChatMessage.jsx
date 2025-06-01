import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, Button, Tooltip, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import CodeIcon from '@mui/icons-material/Code';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useChat } from '../contexts/ChatContext';
import { createGist } from '../services/gist';

export default function ChatMessage({ message, onEditCode }) {
  const messageRef = useRef(null);
  const { addMessage } = useChat();
  const [showPreview, setShowPreview] = useState(false);
  const [gistId, setGistId] = useState(null);
  const [creatingGist, setCreatingGist] = useState(false);

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [message]);

  useEffect(() => {
    // Load DartPad script if not already loaded
    if (showPreview && !document.querySelector('script[src="https://dartpad.dev/inject_embed.dart.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://dartpad.dev/inject_embed.dart.js';
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [showPreview]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
  };

  const downloadCode = () => {
    const blob = new Blob([message.content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'flutter_ui.dart';
    link.click();
  };

  const editCode = () => {
    onEditCode(message.content);
  };

  const handlePreviewClick = async () => {
    if (!showPreview && !gistId) {
      setCreatingGist(true);
      const id = await createGist({ code: message.content});
      setGistId(id);
      setCreatingGist(false);
    }
    setShowPreview(!showPreview);
  };

  // Check if the message content is code (starts with 'import' or contains Flutter-specific keywords)
  const isCode = !message.isUser && (
    message.content.trim().startsWith('import') || 
    message.content.includes('MaterialApp') || 
    message.content.includes('StatelessWidget') ||
    message.content.includes('StatefulWidget') ||
    message.content.includes('class') ||
    message.content.includes('extends') ||
    message.content.includes('build(BuildContext')
  );

  const isUser = message.isUser;

  return (
    <Box
      ref={messageRef}
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
        width: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          maxWidth: isCode ? (showPreview ? '100%' : '60%') : 'auto',
          width: isCode ? '100%' : 'auto',
          gap: 1,
          flexDirection: isUser ? 'row-reverse' : 'row',
        }}
      >
        {!isUser && (
          <Box
            sx={{
              backgroundColor: 'primary.main',
              borderRadius: '50%',
              p: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <SmartToyIcon sx={{ color: 'white', fontSize: 20 }} />
          </Box>
        )}
        
        <Paper
          elevation={0}
          sx={{
            p: 2,
            width: isCode ? '100%' : 'fit-content',
            backgroundColor: isUser ? 'primary.main' : 'background.paper',
            color: isUser ? 'white' : 'text.primary',
            borderRadius: 2,
            border: '1px solid rgba(192, 132, 252, 0.1)',
            display: 'inline-block',
          }}
        >
          {isCode ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'primary.main' }}>
                  Generated Code
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title={showPreview ? "Show Code" : "Live Preview"}>
                    <Button
                      size="small"
                      onClick={handlePreviewClick}
                      startIcon={showPreview ? <CodeIcon /> : <VisibilityIcon />}
                      disabled={creatingGist}
                      sx={{ 
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'rgba(192, 132, 252, 0.1)'
                        }
                      }}
                    >
                      {creatingGist ? 'Loading...' : showPreview ? 'Code' : 'Preview'}
                    </Button>
                  </Tooltip>
                  <Tooltip title="Edit Code">
                    <Button
                      size="small"
                      onClick={editCode}
                      startIcon={<EditIcon />}
                      sx={{ 
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'rgba(192, 132, 252, 0.1)'
                        }
                      }}
                    >
                      Edit
                    </Button>
                  </Tooltip>
                  <Tooltip title="Copy Code">
                    <Button
                      size="small"
                      onClick={copyToClipboard}
                      startIcon={<ContentCopyIcon />}
                      sx={{ 
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'rgba(192, 132, 252, 0.1)'
                        }
                      }}
                    >
                      Copy
                    </Button>
                  </Tooltip>
                  <Tooltip title="Download Code">
                    <Button
                      size="small"
                      onClick={downloadCode}
                      startIcon={<DownloadIcon />}
                      sx={{ 
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'rgba(192, 132, 252, 0.1)'
                        }
                      }}
                    >
                      Download
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
              {showPreview ? (
                <Box sx={{ 
                  width: '100%', 
                  height: '800px', 
                  border: '1px solid rgba(192, 132, 252, 0.2)', 
                  borderRadius: 1, 
                  overflow: 'hidden',
                  transition: 'all 0.3s ease-in-out'
                }}>
                  <iframe
                    src={`https://dartpad.dev/embed-flutter.html?id=${gistId}&theme=dark&run=true`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="accelerometer; camera; microphone; geolocation; encrypted-media"
                    sandbox="allow-forms allow-popups allow-scripts allow-same-origin"
                  ></iframe>
                </Box>
              ) : (
                <Typography
                  component="pre"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid rgba(192, 132, 252, 0.2)',
                    color: '#c084fc',
                    fontSize: '0.9rem',
                    overflowX: 'auto',
                    maxHeight: '500px',
                    overflowY: 'auto',
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
                  {message.content}
                </Typography>
              )}
            </>
          ) : (
            <Typography 
              sx={{ 
                whiteSpace: 'pre-wrap',
                display: 'inline-block',
                maxWidth: '100%',
              }}
            >
              {message.content}
            </Typography>
          )}
        </Paper>

        {isUser && (
          <Box
            sx={{
              backgroundColor: 'primary.main',
              borderRadius: '50%',
              p: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <PersonIcon sx={{ color: 'white', fontSize: 20 }} />
          </Box>
        )}
      </Box>
    </Box>
  );
} 