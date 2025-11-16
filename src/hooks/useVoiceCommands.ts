import { useEffect, useState, useCallback } from 'react';

interface VoiceCommandsConfig {
  enabled: boolean;
  onCommand: (command: string) => void;
}

export function useVoiceCommands({ enabled, onCommand }: VoiceCommandsConfig) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any | null>(null);
  const [lastCommand, setLastCommand] = useState<string>('');

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser');
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.lang = 'es-ES';
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = false;

    recognitionInstance.onresult = (event: any) => {
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult[0].transcript.toLowerCase().trim();

      setLastCommand(transcript);
      processCommand(transcript);
    };

    recognitionInstance.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        // Silently ignore these common errors
        return;
      }
      setIsListening(false);
    };

    recognitionInstance.onend = () => {
      if (enabled && isListening) {
        // Restart if still enabled
        try {
          recognitionInstance.start();
        } catch (error) {
          console.error('Error restarting recognition:', error);
        }
      }
    };

    setRecognition(recognitionInstance);

    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, []);

  const processCommand = useCallback((transcript: string) => {
    // Normalize and detect commands
    const normalized = transcript.toLowerCase();

    // Commands mapping
    const commands = {
      // Complete set
      'completar': 'COMPLETE_SET',
      'completar serie': 'COMPLETE_SET',
      'siguiente': 'NEXT_EXERCISE',
      'siguiente ejercicio': 'NEXT_EXERCISE',
      'anterior': 'PREVIOUS_EXERCISE',
      'ejercicio anterior': 'PREVIOUS_EXERCISE',
      // Timer
      'pausar': 'PAUSE_TIMER',
      'pausar timer': 'PAUSE_TIMER',
      'reanudar': 'RESUME_TIMER',
      'iniciar timer': 'START_TIMER',
      'saltar descanso': 'SKIP_REST',
      // Mode
      'modo bestia': 'TOGGLE_BEAST_MODE',
      'activar modo bestia': 'TOGGLE_BEAST_MODE',
      'guardar template': 'SAVE_TEMPLATE',
      'guardar rutina': 'SAVE_TEMPLATE'
    };

    // Find matching command
    for (const [phrase, commandName] of Object.entries(commands)) {
      if (normalized.includes(phrase)) {
        onCommand(commandName);
        return;
      }
    }

    // Number commands for reps/weight
    if (normalized.match(/\d+/)) {
      const numbers = normalized.match(/\d+/g);
      if (numbers) {
        onCommand(`NUMBER:${numbers.join(',')}`);
      }
    }
  }, [onCommand]);

  const startListening = useCallback(() => {
    if (!recognition) return;

    try {
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting recognition:', error);
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (!recognition) return;

    try {
      recognition.stop();
      setIsListening(false);
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  }, [recognition]);

  useEffect(() => {
    if (enabled && !isListening) {
      startListening();
    } else if (!enabled && isListening) {
      stopListening();
    }
  }, [enabled, isListening, startListening, stopListening]);

  return {
    isListening,
    lastCommand,
    startListening,
    stopListening,
    isSupported: !!recognition
  };
}
