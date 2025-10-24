// Error logging utility
import fs from 'fs';
import path from 'path';

// Error logging utility
export const logError = async (error, context = '') => {
  const timestamp = new Date().toISOString();
  const errorMessage = error?.response?.data?.message || error.message || 'Unknown error';
  const errorDetails = {
    timestamp,
    context,
    message: errorMessage,
    stack: error.stack,
    response: error.response?.data,
  };

  // Log to console for development with full error object
  console.error('Full error object:', error);
  console.error('Error details:', errorDetails);

  // Send error to log server
  try {
    const response = await fetch('http://localhost:5173/log-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: {
          message: errorMessage,
          stack: error.stack,
          response: error.response?.data,
        },
        context,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send error to log server:', await response.text());
    }
  } catch (e) {
    console.error('Failed to connect to log server:', e);
  }

  return errorDetails;
};