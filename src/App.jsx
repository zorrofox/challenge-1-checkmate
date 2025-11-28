import { useState, useEffect, useRef } from 'react'
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown'

const genAI = (key) => new GoogleGenerativeAI(key);

function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('checkmate_api_key') || '')
  const [isSettingsOpen, setIsSettingsOpen] = useState(!localStorage.getItem('checkmate_api_key'))
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('checkmate_messages')
    return saved ? JSON.parse(saved) : [
      { id: 1, type: 'bot', text: 'Hi! I\'m Checkmate. I can help you with grocery lists, recipes, and meal planning. Please set your Gemini API key in settings to get started!' }
    ]
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [tempApiKey, setTempApiKey] = useState(apiKey)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('checkmate_messages', JSON.stringify(messages))
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    localStorage.setItem('checkmate_api_key', apiKey)
  }, [apiKey])

  const handleSaveKey = (e) => {
    e.preventDefault()
    setApiKey(tempApiKey)
    setIsSettingsOpen(false)
  }

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your chat history?')) {
      setMessages([
        { id: 1, type: 'bot', text: 'Hi! I\'m Checkmate. I can help you with grocery lists, recipes, and meal planning. What do you need today?' }
      ])
      localStorage.removeItem('checkmate_messages')
    }
  }

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onstart = () => setIsListening(true)
      recognitionRef.current.onend = () => setIsListening(false)
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        // Optionally auto-send here, but letting user review is safer
      }
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error)
        setIsListening(false)
      }
    }
  }, [])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      recognitionRef.current?.start()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    if (!apiKey) {
      setIsSettingsOpen(true)
      return
    }

    const userText = input.trim()
    const newUserMessage = { id: Date.now(), type: 'user', text: userText }
    setMessages(prev => [...prev, newUserMessage])
    setInput('')
    setIsLoading(true)

    try {
      const ai = genAI(apiKey);
      const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `You are Checkmate, an intelligent grocery assistant. 
      Your goal is to help users manage their grocery lists, find recipes, and plan meals.
      When a user asks to add items, automatically categorize them if possible (e.g., Produce 🥬, Dairy 🥛, Meat 🥩).
      If they provide a recipe or ask for meal plans, break down the ingredients into a categorized list.
      Keep responses friendly, concise, and use emojis to make it lively!
      Current conversation:
      ${messages.map(m => `${m.type}: ${m.text}`).join('\n')}
      user: ${userText}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const botResponse = { id: Date.now() + 1, type: 'bot', text: text }
      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      console.error("Error calling Gemini API:", error)
      const errorResponse = { id: Date.now() + 1, type: 'bot', text: `Error: ${error.message || "Unknown error"}. Please check your API key or connection.` }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>Checkmate ♟️</h1>
          <p>Your Intelligent Grocery Assistant</p>
        </div>
        <div className="header-actions">
          <button className="icon-btn" onClick={() => setIsSettingsOpen(true)} title="Settings">⚙️</button>
          <button className="icon-btn" onClick={clearHistory} title="Clear History">🗑️</button>
        </div>
      </header>

      {isSettingsOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Settings</h3>
            <form onSubmit={handleSaveKey}>
              <label>Gemini API Key:</label>
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="AIzaSy..."
                required
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setIsSettingsOpen(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="chat-container">
        <div className="messages-list">
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.type}`}>
              <div className="message-content">
                {msg.type === 'bot' ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message bot loading">
              <div className="message-content">Thinking...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form className="input-area" onSubmit={handleSend}>
        <button
          type="button"
          className={`voice-btn ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
          disabled={isLoading}
          title={isListening ? "Stop listening" : "Start voice input"}
        >
          {isListening ? '🛑' : '🎤'}
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or speak..."
          className="chat-input"
          disabled={isLoading}
        />
        <button type="submit" className="send-btn" disabled={isLoading || !input.trim()}>
          {isLoading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  )
}

export default App
