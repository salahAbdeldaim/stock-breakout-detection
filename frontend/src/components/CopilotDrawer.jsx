import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, Mic, MicOff, Send, X, Trash2, ExternalLink, RefreshCw, Cpu, Maximize2, Minimize2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function CopilotDrawer({
  selectedTicker,
  selectedDate,
  onSelectStockAndDate,
  apiBase = import.meta.env.VITE_API_BASE_HOST || 'https://45.39.253.4.sslip.io'
}) {
  const { lang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversationSummary, setConversationSummary] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Initialize welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome-1',
        sender: 'assistant',
        text: t('copilotWelcome'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [lang]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, isOpen]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'ar' ? 'ar-EG' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          // Directly submit query for effortless voice workflow
          handleSend(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn('SpeechRecognition error:', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          // If native recognition fails, fallback to Groq Whisper via MediaRecorder
          startMediaRecorderFallback();
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [lang]);

  // Fallback MediaRecorder for Groq Whisper transcription
  const startMediaRecorderFallback = async () => {
    try {
      setVoiceError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioToWhisper(audioBlob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsListening(true);
    } catch (err) {
      console.error('MediaRecorder error:', err);
      setVoiceError(t('copilotVoiceError'));
      setIsListening(false);
    }
  };

  const stopMediaRecorderFallback = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  // Send audio blob to /api/copilot/transcribe (Groq Whisper)
  const sendAudioToWhisper = async (audioBlob) => {
    setTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');

      const res = await fetch(`${apiBase}/api/copilot/transcribe`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Transcription failed');
      const data = await res.json();
      if (data.text) {
        setInput(data.text);
        handleSend(data.text);
      }
    } catch (err) {
      console.error('Whisper transcription error:', err);
      setVoiceError(t('copilotVoiceError'));
    } finally {
      setTranscribing(false);
    }
  };

  // Toggle voice recording
  const handleToggleVoice = () => {
    setVoiceError(null);
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      stopMediaRecorderFallback();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang = lang === 'ar' ? 'ar-EG' : 'en-US';
          recognitionRef.current.start();
        } catch (e) {
          startMediaRecorderFallback();
        }
      } else {
        startMediaRecorderFallback();
      }
    }
  };

  // Send chat query to backend
  const handleSend = async (overrideText) => {
    const textToSend = (overrideText || input).trim();
    if (!textToSend || isThinking) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);
    setVoiceError(null);

    try {
      const res = await fetch(`${apiBase}/api/copilot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          current_ticker: selectedTicker,
          current_date: selectedDate,
          language: lang,
          conversation_summary: conversationSummary
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Analysis request failed');
      }

      const data = await res.json();

      if (data.conversation_summary) {
        setConversationSummary(data.conversation_summary);
      }

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.reply,
        action: data.action,
        auditSummary: data.audit_summary,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Automatically sync dashboard if an action is returned!
      if (data.action && data.action.ticker && data.action.date) {
        onSelectStockAndDate(data.action.ticker, data.action.date);
      }
    } catch (err) {
      console.error('Copilot chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          isError: true,
          text: lang === 'ar'
            ? `عذراً، حدث خطأ أثناء تحليل الاستفسار: ${err.message}`
            : `Error analyzing query: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleClearChat = () => {
    setConversationSummary('');
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: t('copilotWelcome'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleQuickPrompt = (promptText) => {
    setInput(promptText);
    handleSend(promptText);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className="copilot-floating-btn"
          onClick={() => setIsOpen(true)}
          title={t('copilotTitle')}
        >
          <div className="copilot-btn-glow"></div>
          <Bot size={22} className="copilot-btn-icon" />
          <span className="copilot-btn-label">{t('copilotButton')}</span>
          <span className="copilot-online-dot"></span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className={`copilot-window ${isExpanded ? 'expanded' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          {/* Header */}
          <div className="copilot-header">
            <div className="copilot-header-info">
              <div className="copilot-avatar">
                <Bot size={18} />
                <span className="copilot-avatar-online"></span>
              </div>
              <div>
                <div className="copilot-title">{t('copilotTitle')}</div>
                <div className="copilot-subtitle">{t('copilotSubtitle')}</div>
              </div>
            </div>

            <div className="copilot-header-actions">
              <button
                type="button"
                className="copilot-action-icon"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? t('copilotMinimize') : t('copilotMaximize')}
              >
                {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
              <button
                type="button"
                className="copilot-action-icon"
                onClick={handleClearChat}
                title={t('copilotClearChat')}
              >
                <Trash2 size={15} />
              </button>
              <button
                type="button"
                className="copilot-action-icon"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="copilot-chips-container">
            <button
              type="button"
              className="copilot-chip"
              onClick={() => handleQuickPrompt(t('copilotQuickChip1'))}
            >
              <Sparkles size={11} />
              <span>{t('copilotQuickChip1')}</span>
            </button>
            <button
              type="button"
              className="copilot-chip"
              onClick={() => handleQuickPrompt(t('copilotQuickChip2'))}
            >
              <Cpu size={11} />
              <span>{t('copilotQuickChip2')}</span>
            </button>
            <button
              type="button"
              className="copilot-chip"
              onClick={() => handleQuickPrompt(t('copilotQuickChip3'))}
            >
              <Sparkles size={11} />
              <span>{t('copilotQuickChip3')}</span>
            </button>
          </div>

          {/* Messages Container */}
          <div className="copilot-messages">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`copilot-bubble-row ${m.sender === 'user' ? 'user-row' : 'assistant-row'}`}
              >
                <div
                  className={`copilot-bubble ${
                    m.sender === 'user' ? 'user-bubble' : 'assistant-bubble'
                  } ${m.isError ? 'error-bubble' : ''}`}
                >
                  <div className="copilot-msg-text">{m.text}</div>

                  {/* Sync Action Badge if available */}
                  {m.action && m.action.ticker && (
                    <div className="copilot-sync-badge">
                      <button
                        type="button"
                        className="copilot-sync-btn"
                        onClick={() => onSelectStockAndDate(m.action.ticker, m.action.date)}
                      >
                        <ExternalLink size={12} />
                        <span>
                          {t('copilotViewOnChart')}: {m.action.ticker} ({m.action.date})
                        </span>
                      </button>
                    </div>
                  )}

                  <div className="copilot-timestamp">{m.timestamp}</div>
                </div>
              </div>
            ))}

            {/* Thinking / Transcribing Indicator */}
            {(isThinking || transcribing) && (
              <div className="copilot-bubble-row assistant-row">
                <div className="copilot-bubble assistant-bubble thinking-bubble">
                  <div className="copilot-thinking-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="copilot-thinking-text">
                    {transcribing ? t('copilotProcessingAudio') : t('copilotThinking')}
                  </span>
                </div>
              </div>
            )}

            {/* Error banner */}
            {voiceError && (
              <div className="copilot-voice-error-banner">
                {voiceError}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <div className="copilot-footer">
            {isListening && (
              <div className="copilot-listening-indicator">
                <span className="copilot-pulse-wave"></span>
                <span>{t('copilotListening')}</span>
              </div>
            )}

            <form
              className="copilot-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <input
                type="text"
                className="copilot-input-field"
                placeholder={isListening ? t('copilotListening') : t('copilotPlaceholder')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isThinking}
              />

              {/* Voice Record Button */}
              <button
                type="button"
                className={`copilot-mic-btn ${isListening ? 'active-listening' : ''}`}
                onClick={handleToggleVoice}
                title={isListening ? 'Stop' : 'Voice Input'}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                className="copilot-send-btn"
                disabled={!input.trim() || isThinking}
                title={t('copilotSend')}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
