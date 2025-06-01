import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc,
  setDoc,
  getDoc,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export function useChat() {
  return useContext(ChatContext);
}

export function ChatProvider({ children }) {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for conversations changes
  useEffect(() => {
    if (!currentUser) {
      console.log('No current user, skipping chat setup');
      return;
    }

    console.log('Setting up chat listeners for user:', currentUser.id);
    setIsLoading(true);
    setError(null);

    try {
      const chatsRef = collection(db, 'users', currentUser.id, 'chats');
      const q = query(chatsRef, orderBy('updatedAt', 'desc'));
      console.log('Created query for chats collection');

      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        console.log('Received chat snapshot, processing conversations...');
        const loadedConversations = [];
        
        try {
          // Check each conversation for messages
          for (const doc of querySnapshot.docs) {
            console.log('Processing conversation:', doc.id);
            const conversationData = doc.data();
            const messagesRef = collection(db, 'users', currentUser.id, 'chats', doc.id, 'messages');
            const messagesSnapshot = await getDocs(messagesRef);
            console.log(`Conversation ${doc.id} has ${messagesSnapshot.size} messages`);
            
            // Only delete conversations that are older than 5 minutes and have no messages
            const isNewConversation = (new Date() - conversationData.createdAt.toDate()) < 5 * 60 * 1000;
            console.log(`Conversation ${doc.id} is ${isNewConversation ? 'new' : 'old'}`);
            
            if (!messagesSnapshot.empty || isNewConversation) {
              console.log(`Keeping conversation ${doc.id}`);
              loadedConversations.push({
                id: doc.id,
                ...conversationData
              });
            } else {
              console.log(`Deleting empty conversation ${doc.id}`);
              await deleteDoc(doc.ref);
            }
          }

          console.log('Setting conversations:', loadedConversations);
          setConversations(loadedConversations);

          // If there are conversations and no current conversation is selected,
          // select the most recent one
          if (loadedConversations.length > 0 && !currentConversation) {
            console.log('Setting current conversation to most recent:', loadedConversations[0].id);
            setCurrentConversation(loadedConversations[0]);
          } else if (loadedConversations.length === 0) {
            console.log('No conversations available, clearing current conversation');
            setCurrentConversation(null);
          }
        } catch (error) {
          console.error('Error processing conversations:', error);
          console.error('Error details:', {
            code: error.code,
            message: error.message,
            stack: error.stack
          });
          setError(error);
        }
      }, (error) => {
        console.error('Error in chat snapshot listener:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
        setError(error);
      });

      setIsLoading(false);
      console.log('Chat setup complete');
      return () => {
        console.log('Cleaning up chat listeners');
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up chat listeners:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      setError(error);
      setIsLoading(false);
    }
  }, [currentUser]);

  // Listen for messages changes in the current conversation
  useEffect(() => {
    if (!currentUser || !currentConversation) {
      console.log('No current user or conversation, skipping message listener setup');
      return;
    }

    console.log('Setting up message listener for conversation:', currentConversation.id);
    const messagesRef = collection(db, 'users', currentUser.id, 'chats', currentConversation.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log(`Received message snapshot for conversation ${currentConversation.id}`);
      const loadedMessages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(`Loaded ${loadedMessages.length} messages`);
      setMessages(loadedMessages);
    }, (error) => {
      console.error('Error in message snapshot listener:', error);
    });

    return () => {
      console.log('Cleaning up message listener');
      unsubscribe();
    };
  }, [currentUser, currentConversation]);

  const createNewConversation = async () => {
    if (!currentUser) {
      console.log('No current user, cannot create conversation');
      return;
    }

    try {
      console.log('Creating new conversation...');
      const newConversation = {
        title: 'New Chat',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const chatsRef = collection(db, 'users', currentUser.id, 'chats');
      const docRef = await addDoc(chatsRef, newConversation);
      console.log('New conversation created:', docRef.id);
      
      const conversation = { id: docRef.id, ...newConversation };
      setCurrentConversation(conversation);
      setMessages([]);
      return conversation;
    } catch (error) {
      console.error('Error creating new conversation:', error);
      throw error;
    }
  };

  const addMessage = async (content, isUser = true, conversationId = currentConversation.id) => {
    if (!conversationId || !currentUser) {
      return;
    }

    try {
      console.log('Adding new message to conversation:', conversationId);
      const message = {
        content,
        isUser,
        timestamp: new Date()
      };

      const messagesRef = collection(db, 'users', currentUser.id, 'chats', conversationId, 'messages');
      await addDoc(messagesRef, message);
      console.log('Message added successfully');

      // Update conversation's updatedAt timestamp
      const chatRef = doc(db, 'users', currentUser.id, 'chats', conversationId);
      await updateDoc(chatRef, {
        updatedAt: new Date(),
        title: isUser ? content.substring(0, 30) + '...' : currentConversation.title
      });
      console.log('Conversation updated');
    } catch (error) {
      console.error('Error adding message:', error);
    }
  };

  const selectConversation = (conversation) => {
    console.log('Selecting conversation:', conversation.id);
    setCurrentConversation(conversation);
  };

  const value = {
    conversations,
    currentConversation,
    messages,
    isLoading,
    error,
    createNewConversation,
    addMessage,
    selectConversation
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
} 