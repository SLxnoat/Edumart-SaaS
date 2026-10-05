import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  // Generate a random session ID on mount
  useEffect(() => {
    const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setSessionId(randomId);
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setIsLoading(true);

    // Add user message to chat
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        text: userMessage,
        isUser: true,
        timestamp: new Date().toISOString()
      }
    ]);

    try {
      // Send message to backend
      const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId
        }),
        credentials: 'include' // Include cookies for auth
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Add bot response to chat
      setMessages(prev => [
        ...prev,
        {
          id: data.data.id,
          text: data.data.response,
          isUser: false,
          timestamp: data.data.createdAt,
          intent: data.data.intent,
          confidence: data.data.confidenceScore
        }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: 'Sorry, I encountered an error. Please try again.',
          isUser: false,
          timestamp: new Date().toISOString(),
          error: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage(e);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h3>EduMart Assistant</h3>
        <div className="chatbot-status">
          <span className="status-dot">●</span>
          <span>Online</span>
        </div>
      </div>
      <div className="chatbot-messages" ref={messagesEndRef}>
        {messages.map(message => (
          <div key={message.id} className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}>
            <div className="message-content">
              {message.text}
              {!message.isUser && message.intent && message.confidence !== undefined && (
                <div className="message-meta">
                  <small>
                    Intent: {message.intent} ({Math.round(message.confidence * 100)}% confidence)
                  </small>
                </div>
              )}
            </div>
            <div className="message-time">
              {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot-message">
            <div className="message-content">Typing...</div>
          </div>
        )}
      </div>
      <div className="chatbot-footer">
        <form onSubmit={sendMessage} className="chatbot-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about products, orders, or account help..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
