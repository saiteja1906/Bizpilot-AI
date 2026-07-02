import React, { useState, useEffect, useRef } from 'react';
import { databaseService } from '../utils/firebase';
import { Send, Mic, MicOff, Volume2, VolumeX, Plus, MessageSquare, Trash2, RefreshCw } from 'lucide-react';

export default function BusinessChat({ profile, apiKey, translate }) {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Speech Recognition (Speech-to-Text)
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  // Speech Synthesis (Text-to-Speech)
  const [speakingId, setSpeakingId] = useState(null);
  const synthRef = useRef(window.speechSynthesis);

  const messagesEndRef = useRef(null);

  // Load chat sessions from db
  useEffect(() => {
    const list = databaseService.getChatSessions();
    setSessions(list);
    if (list.length > 0) {
      setActiveSessionId(list[0].id);
      setMessages(list[0].messages || []);
    } else {
      handleCreateNewSession();
    }
  }, []);

  // Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Sync current active session messages with db
  const saveCurrentMessages = (updatedMessages) => {
    if (!activeSessionId) return;
    const currentSession = sessions.find(s => s.id === activeSessionId);
    if (!currentSession) return;
    
    const updatedSession = {
      ...currentSession,
      messages: updatedMessages
    };

    // Update session title based on the first message if needed
    if (currentSession.title === 'New Conversation' && updatedMessages.length > 0) {
      const firstUserMsg = updatedMessages.find(m => m.role === 'user');
      if (firstUserMsg) {
        updatedSession.title = firstUserMsg.text.substring(0, 24) + '...';
      }
    }

    databaseService.saveChatSession(updatedSession);
    
    // Refresh sessions lists
    setSessions(databaseService.getChatSessions());
  };

  const handleCreateNewSession = () => {
    const newSession = {
      id: `session-${Date.now()}`,
      title: 'New Conversation',
      messages: []
    };
    databaseService.saveChatSession(newSession);
    
    const list = databaseService.getChatSessions();
    setSessions(list);
    setActiveSessionId(newSession.id);
    setMessages([]);
  };

  const handleDeleteSession = (id, e) => {
    e.stopPropagation();
    databaseService.deleteChatSession(id);
    const list = databaseService.getChatSessions();
    setSessions(list);
    
    if (activeSessionId === id) {
      if (list.length > 0) {
        setActiveSessionId(list[0].id);
        setMessages(list[0].messages || []);
      } else {
        // Create blank session if all deleted
        const blankSession = {
          id: `session-${Date.now()}`,
          title: 'New Conversation',
          messages: []
        };
        databaseService.saveChatSession(blankSession);
        setSessions([blankSession]);
        setActiveSessionId(blankSession.id);
        setMessages([]);
      }
    }
  };

  const handleSelectSession = (id) => {
    setActiveSessionId(id);
    const session = sessions.find(s => s.id === id);
    setMessages(session ? session.messages : []);
    
    // Stop any speech readback
    if (synthRef.current) {
      synthRef.current.cancel();
      setSpeakingId(null);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userText = inputText;
    setInputText('');
    
    const updatedMessages = [...messages, { role: 'user', text: userText }];
    setMessages(updatedMessages);
    saveCurrentMessages(updatedMessages);
    
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || ''
        },
        body: JSON.stringify({
          message: userText,
          history: updatedMessages.slice(0, -1),
          profile: profile
        })
      });
      const data = await response.json();
      
      const newMessages = [...updatedMessages, { role: 'ai', text: data.reply }];
      setMessages(newMessages);
      saveCurrentMessages(newMessages);
    } catch (error) {
      console.error(error);
      const newMessages = [...updatedMessages, { role: 'ai', text: 'Connection error: Failed to reach the AI backend.' }];
      setMessages(newMessages);
      saveCurrentMessages(newMessages);
    } finally {
      setIsLoading(false);
    }
  };

  // Text to Speech
  const toggleSpeech = (text, msgIndex) => {
    if (synthRef.current) {
      if (speakingId === msgIndex) {
        synthRef.current.cancel();
        setSpeakingId(null);
      } else {
        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
          setSpeakingId(null);
        };
        synthRef.current.speak(utterance);
        setSpeakingId(msgIndex);
      }
    }
  };

  // Speech Recognition (Speech-to-Text)
  const toggleRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => prev + ' ' + transcript);
      };

      rec.onerror = (e) => {
        console.error("Speech Recognition Error", e);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
      rec.start();
      setIsRecording(true);
    }
  };

  return (
    <div className="glass-card fade-in chat-container">
      {/* Session List Sidebar */}
      <div className="chat-history">
        <button 
          onClick={handleCreateNewSession} 
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '20px', gap: '8px', fontSize: '0.85rem', padding: '10px' }}
        >
          <Plus size={16} /> New Chat
        </button>

        <div style={{ flex: '1', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => handleSelectSession(s.id)}
              className={`menu-item ${activeSessionId === s.id ? 'active' : ''}`}
              style={{
                width: '100%',
                textAlign: 'left',
                justifyContent: 'space-between',
                padding: '10px 12px',
                fontSize: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <MessageSquare size={14} style={{ flexShrink: 0 }} />
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{s.title}</span>
              </div>
              <Trash2 
                size={14} 
                onClick={(e) => handleDeleteSession(s.id, e)}
                style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
                onMouseEnter={e => e.target.style.color = 'var(--accent-danger)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Main chat window */}
      <div className="chat-messages">
        {/* Output list */}
        <div className="messages-list">
          {messages.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: 'var(--text-muted)',
              textAlign: 'center',
              padding: '32px'
            }}>
              <MessageSquare size={48} style={{ color: 'var(--accent-primary)', marginBottom: '16px', opacity: '0.6' }} />
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '8px' }}>Chat with BizPilot AI</h3>
              <p style={{ fontSize: '0.85rem', maxWidth: '380px' }}>
                Ask business strategy questions, analyze revenue growth suggestions, or request pitch reviews. 
                Your Business Profile context is automatically synced!
              </p>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`chat-bubble ${m.role === 'user' ? 'user' : 'ai'}`}
                style={{ position: 'relative' }}
              >
                <div style={{ whiteSpace: 'pre-wrap', paddingRight: m.role === 'ai' ? '24px' : '0' }}>{m.text}</div>
                {m.role === 'ai' && (
                  <button 
                    onClick={() => toggleSpeech(m.text, idx)}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '8px',
                      background: 'none',
                      border: 'none',
                      color: speakingId === idx ? 'var(--accent-primary)' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                    title={speakingId === idx ? "Mute Speech" : "Read Aloud"}
                  >
                    {speakingId === idx ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="chat-bubble ai" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw className="animate-spin" size={16} />
              <span>BizPilot AI is reviewing numbers...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="chat-input-area">
          <input 
            type="text" 
            className="form-input" 
            placeholder="Type your strategic question..." 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            disabled={isLoading}
            style={{ borderRadius: '24px', paddingLeft: '20px' }}
          />

          <button 
            type="button" 
            onClick={toggleRecording} 
            className={`voice-btn ${isRecording ? 'recording' : ''}`}
            title={isRecording ? "Stop Recording" : "Dictate Prompt"}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading || !inputText.trim()}
            style={{ width: '48px', height: '48px', padding: '0', borderRadius: '50%', flexShrink: 0 }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
