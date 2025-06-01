import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Button,
  Typography,
  Divider,
  Paper
} from '@mui/material';
import { useChat } from '../contexts/ChatContext';
import AddIcon from '@mui/icons-material/Add';

export default function ChatSidebar() {
  const { conversations, currentConversation, createNewConversation, selectConversation } = useChat();

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: 280,
        height: '100%',
        backgroundColor: 'background.paper',
        borderRight: '1px solid rgba(192, 132, 252, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0
      }}
    >
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={createNewConversation}
          sx={{
            mb: 2,
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
            }
          }}
        >
          New Chat
        </Button>
      </Box>

      <Divider />

      <List sx={{ flex: 1, overflow: 'auto' }}>
        {conversations.map((conversation) => (
          <ListItem key={conversation.id} disablePadding>
            <ListItemButton
              selected={currentConversation?.id === conversation.id}
              onClick={() => selectConversation(conversation)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(192, 132, 252, 0.1)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(192, 132, 252, 0.05)',
                }
              }}
            >
              <ListItemText
                primary={conversation.title}
                secondary={formatDate(conversation.updatedAt)}
                primaryTypographyProps={{
                  sx: {
                    color: 'text.primary',
                    fontWeight: currentConversation?.id === conversation.id ? 600 : 400,
                  }
                }}
                secondaryTypographyProps={{
                  sx: {
                    color: 'text.secondary',
                    fontSize: '0.75rem'
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Cipher Solutions LLC - 2025
          <br />
          Contact us at <a href="mailto:ciphersolutionsllc24@gmail.com">ciphersolutionsllc24@gmail.com</a>
        </Typography>
      </Box>
    </Paper>
  );
} 