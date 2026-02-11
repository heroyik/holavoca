
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Word } from '../types';

interface VoicePracticeProps {
  words: Word[];
  onBack: () => void;
}

const VoicePractice: React.FC<VoicePracticeProps> = ({ words, onBack }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');
  const [transcriptions, setTranscriptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Handlers for Audio Encoding/Decoding manually implemented as per guidelines
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };

  const startSession = async () => {
    try {
      setStatus('connecting');
      setError(null);
      
      // Use direct environment variable as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('listening');
            setIsActive(true);
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000'
              };
              // CRITICAL: Solely rely on sessionPromise resolves to send data
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscriptions(prev => [...prev.slice(-10), `Tutor: ${message.serverContent!.outputTranscription!.text}`]);
            }
            if (message.serverContent?.inputTranscription) {
               setTranscriptions(prev => [...prev.slice(-10), `You: ${message.serverContent!.inputTranscription!.text}`]);
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              setStatus('speaking');
              const ctx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setStatus('listening');
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            setError("Connectivity error. Please check your internet.");
            stopSession();
          },
          onclose: () => stopSession()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction: `You are a friendly Spanish tutor named Alejandro. Help the user practice these vocabulary words: ${words.map(w => w.spanish).join(', ')}. Talk naturally, encourage them to speak, and correct their pronunciation if needed. Always reply in Spanish primarily, with brief Korean translations for difficult concepts if needed.`
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      setError("Permission denied or microphone missing.");
      setStatus('idle');
      console.error(err);
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setStatus('idle');
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch(e) {}
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[70vh] space-y-8 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Speak with Alejandro</h1>
        <p className="text-slate-500">Practice your pronunciation and conversational skills in real-time.</p>
      </div>

      <div className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ${
        isActive ? 'bg-amber-100 shadow-2xl shadow-amber-200' : 'bg-slate-100'
      }`}>
        <div className={`absolute inset-0 rounded-full border-4 border-amber-500 transition-all duration-1000 ${
          status === 'speaking' ? 'animate-ping scale-110 opacity-20' : 'scale-100'
        }`}></div>
        
        {isActive ? (
          <div className="flex flex-col items-center text-amber-600 animate-in zoom-in">
             <span className="text-sm font-bold uppercase mb-2">{status}</span>
             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          </div>
        ) : (
          <div className="text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m19 8-4 4-4-4"/><path d="M15 12V2"/><circle cx="12" cy="12" r="10"/></svg>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-4 w-full">
        {error && <p className="text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm">{error}</p>}
        
        {isActive ? (
          <button 
            onClick={stopSession}
            className="bg-red-500 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-red-100 hover:bg-red-600 transition-all flex items-center gap-2"
          >
            End Session
          </button>
        ) : (
          <button 
            onClick={startSession}
            disabled={status === 'connecting'}
            className="bg-amber-500 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all flex items-center gap-2"
          >
            {status === 'connecting' ? 'Initializing...' : 'Start Talking'}
          </button>
        )}
        
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 font-medium">
          Maybe later
        </button>
      </div>

      {transcriptions.length > 0 && (
        <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 h-48 overflow-y-auto">
          {transcriptions.map((t, i) => (
            <p key={i} className={`text-sm ${t.startsWith('You:') ? 'text-slate-500 italic' : 'text-amber-700 font-medium'}`}>
              {t}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default VoicePractice;
