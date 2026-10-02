import React, { useRef, useState } from 'react';
import { Bot, Camera, Image as ImageIcon, Loader2, Send, Sparkles, X } from 'lucide-react';
import { analyzeFoodImage, createAuraChat, sendAuraMessage } from '../../firebase/aiService';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  imageUrl?: string;
}

export const Chatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: 'assistant', text: 'Olá! Eu sou o Aura 🤖. Posso tirar dúvidas sobre alimentação e treino ou analisar uma foto do seu prato.' }
  ]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<ReturnType<typeof createAuraChat> | null>(null);

  const getChat = () => {
    if (!chatRef.current) chatRef.current = createAuraChat();
    return chatRef.current;
  };

  const addMessage = (role: ChatMessage['role'], text: string, imageUrl?: string) => {
    setMessages((current) => [...current, { id: Date.now() + Math.random(), role, text, imageUrl }]);
  };

  const handleSelectImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addMessage('assistant', 'Selecione uma imagem válida para eu analisar.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      addMessage('assistant', 'Essa imagem é muito grande. Escolha uma foto de até 10 MB.');
      return;
    }
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setSelectedImage(null);
  };

  const handleSend = async () => {
    if (loading || (!message.trim() && !selectedImage)) return;

    const text = message.trim();
    const image = selectedImage;
    const imageUrl = previewUrl;

    setMessage('');
    clearImage();
    addMessage('user', image ? (text || 'Analise este prato para mim.') : text, imageUrl || undefined);
    setLoading(true);

    try {
      const chat = getChat();
      const response = image
        ? await analyzeFoodImage(chat, image, text)
        : await sendAuraMessage(chat, text);
      addMessage('assistant', response);
    } catch (error) {
      console.error('Erro no chatbot Aura:', error);
      addMessage('assistant', 'Não consegui falar com a IA agora. Verifique se o Gemini está habilitado no Firebase e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} className="fixed right-5 bottom-5 md:right-7 md:bottom-7 z-50 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/30 flex items-center justify-center transition-all hover:scale-105" title="Abrir assistente Aura">
          <Bot className="w-7 h-7" />
        </button>
      )}

      {open && (
        <div className="fixed right-4 bottom-4 md:right-7 md:bottom-7 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[min(680px,calc(100vh-2rem))] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center"><Sparkles className="w-5 h-5" /></div>
              <div>
                <p className="font-bold text-sm">Aura IA</p>
                <p className="text-[11px] text-emerald-50">Seu assistente da Academia Aura</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-white/10" title="Fechar"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900/70">
            {messages.map((item) => (
              <div key={item.id} className={'flex ' + (item.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={'max-w-[88%] rounded-2xl px-3.5 py-3 text-sm whitespace-pre-wrap ' + (item.role === 'user'
                  ? 'bg-emerald-500 text-white rounded-br-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-md')}>
                  {item.imageUrl && <img src={item.imageUrl} alt="Prato enviado para análise" className="w-full max-h-48 object-cover rounded-xl mb-2" />}
                  {item.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3">
            {previewUrl && (
              <div className="mb-3 relative w-20 h-20">
                <img src={previewUrl} alt="Prévia do prato" className="w-20 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
                <button onClick={clearImage} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center" title="Remover imagem"><X className="w-3.5 h-3.5" /></button>
              </div>
            )}

            <div className="flex items-end gap-2">
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(event) => {
                handleSelectImage(event.target.files?.[0]);
                event.currentTarget.value = '';
              }} />

              <button onClick={() => inputRef.current?.click()} disabled={loading} className="shrink-0 w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-500 flex items-center justify-center disabled:opacity-50" title="Enviar foto do prato">
                <Camera className="w-5 h-5" />
              </button>

              <input value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={handleKeyDown} disabled={loading} placeholder={selectedImage ? 'Ex: estime as calorias deste prato...' : 'Digite sua dúvida...'} className="flex-1 min-w-0 h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-emerald-500 outline-none text-sm text-slate-900 dark:text-white" />

              <button onClick={handleSend} disabled={loading || (!message.trim() && !selectedImage)} className="shrink-0 w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center disabled:opacity-40" title="Enviar">
                <Send className="w-4 h-4" />
              </button>
            </div>

            <p className="mt-2 text-[10px] text-slate-400 flex items-center gap-1"><ImageIcon className="w-3 h-3" />As calorias da foto são estimativas e não substituem avaliação profissional.</p>
          </div>
        </div>
      )}
    </>
  );
};
