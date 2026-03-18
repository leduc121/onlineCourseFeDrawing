import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  sources?: {title: string, category: string}[];
  isDone?: boolean;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      text: "Xin chào! 👋 Mình là trợ lý AI khóa học vẽ. Mình có thể giúp gì cho bé và ba mẹ hôm nay ạ?",
      sender: "bot",
      timestamp: new Date(),
      isDone: true
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Create a persistent session ID for the user's conversation to maintain context
  const sessionId = useRef<string>(Math.random().toString(36).substring(7));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

      try {
        // Gọi lên AI RAG Backend
        const response = await fetch("http://localhost:8000/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
            message: userMessage.text,
            session_id: sessionId.current
          })
        });

        if (!response.body) throw new Error("Không có phản hồi từ máy chủ");
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        const botMessageId = (Date.now() + 1).toString();
        
        // Khởi tạo tin nhắn bot rỗng
        setMessages(prev => [...prev, {
          id: botMessageId,
          text: "",
          sender: "bot",
          timestamp: new Date(),
          sources: [],
          isDone: false
        }]);
        setIsTyping(false); // Ẩn loading vì đã bắt đầu stream

        let accumulatedText = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split("\n").filter(line => line.trim() !== "");
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              
              if (data.type === "sources") {
                setMessages(prev => prev.map(msg => 
                  msg.id === botMessageId ? { ...msg, sources: data.data } : msg
                ));
              } else if (data.type === "chunk") {
                accumulatedText += data.data;
                setMessages(prev => prev.map(msg => 
                  msg.id === botMessageId ? { ...msg, text: accumulatedText } : msg
                ));
              } else if (data.type === "error") {
                accumulatedText += "\n[Lỗi kết nối AI: " + data.data + "]";
                setMessages(prev => prev.map(msg => 
                  msg.id === botMessageId ? { ...msg, text: accumulatedText, isDone: true } : msg
                ));
              } else if (data.type === "done") {
                setMessages(prev => prev.map(msg => 
                  msg.id === botMessageId ? { ...msg, isDone: true } : msg
                ));
              }
            } catch (e) {
              console.error("Parse JSON chunk error:", e, line);
            }
          }
        }

      } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Hệ thống tư vấn đang bận. Ba mẹ vui lòng thử lại sau nhé! 😢",
        sender: "bot",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 p-4 rounded-full bg-white text-gray-800 border border-gray-200 shadow-xl hover:shadow-2xl hover:border-gray-300 transition-all z-50 flex items-center justify-center"
          >
            <MessageCircle className="w-8 h-8" />
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="fixed bottom-6 right-6 w-full max-w-[380px] sm:w-[380px] sm:max-w-none h-[600px] max-h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col z-50 border border-gray-100/50 ring-1 ring-black/5"
          >
            {/* Header */}
            <div className="bg-white p-5 flex items-center justify-between border-b border-gray-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center space-x-3 z-10 relative">
                <div className="p-2.5 bg-gray-50 rounded-2xl border border-gray-100">
                  <Bot className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-gray-800 font-bold text-lg leading-tight flex items-center gap-1">
                    Course AI <Sparkles className="w-4 h-4 text-gray-400" />
                  </h3>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-gray-500 text-xs font-medium">Trực tuyến</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

             {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 bg-gray-50/50 flex flex-col space-y-4 scroll-smooth scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex items-end space-x-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm mt-1">
                      <Bot className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                  <div className="flex flex-col space-y-1 max-w-[75%]">
                    {msg.sender === 'bot' && !msg.isDone && msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap items-center text-[10px] text-gray-500 font-medium mb-1 animate-pulse gap-1">
                        <Sparkles className="w-3 h-3 text-gray-400" />
                        <span>Đang tham khảo:</span>
                        {msg.sources.slice(0, 2).map((src, idx) => (
                          <span key={idx} className="bg-white px-1.5 py-0.5 rounded-md truncate max-w-[80px] border border-gray-200 shadow-sm" title={src.title}>
                            {src.title}
                          </span>
                        ))}
                        {msg.sources.length > 2 && <span className="text-gray-400">+{msg.sources.length - 2}</span>}
                      </div>
                    )}

                    <div
                      className={`px-4 py-3 rounded-2xl relative shadow-sm ${msg.sender === 'user'
                          ? 'bg-gray-800 text-white rounded-br-sm self-end'
                          : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] leading-relaxed self-start'
                        }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.text || (msg.sender === 'bot' && !msg.isDone ? "..." : "")}</p>
                      <span className={`text-[10px] mt-1 block opacity-60 ${msg.sender === 'user' ? 'text-right text-gray-300' : 'text-left text-gray-400'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <AnimatePresence>
                      {msg.sender === 'bot' && msg.isDone && msg.sources && msg.sources.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-gray-50 border border-gray-100 rounded-xl p-3 mt-1 shadow-sm w-full"
                        >
                          <p className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center">
                            <Sparkles className="w-3 h-3 mr-1 text-gray-400" /> Nguồn tham khảo:
                          </p>
                          <ul className="space-y-1">
                            {msg.sources.map((src, idx) => (
                              <li key={idx} className="text-[11px] text-gray-500 flex items-start">
                                <span className="w-1 h-1 rounded-full bg-gray-300 mt-1.5 mr-1.5 flex-shrink-0"></span>
                                <span><span className="font-medium text-gray-700">{src.title}</span> <span className="text-gray-400 italic">({src.category})</span></span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end justify-start space-x-2"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-200 mt-1 shadow-sm">
                    <Bot className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex space-x-1.5 items-center">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-200 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-full pr-1.5 pl-4 py-1.5 focus-within:ring-2 focus-within:ring-gray-100 focus-within:border-gray-300 transition-all shadow-inner">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Hỏi về khóa học, giá trị, độ tuổi..."
                  className="flex-1 bg-transparent py-2 outline-none text-sm text-gray-700 placeholder-gray-400"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className={`p-2.5 rounded-full flex items-center justify-center transition-all ${inputValue.trim() && !isTyping
                      ? 'bg-gray-800 text-white shadow-md hover:shadow-lg hover:bg-gray-700 transform active:scale-95'
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    }`}
                >
                  {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                </button>
              </div>
              <p className="text-center text-[10px] text-gray-400 mt-3 font-medium tracking-wide">
                Được hỗ trợ bởi AI RAG <span className="text-gray-500 font-semibold">Langchain + Ollama</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
