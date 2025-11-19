/**
 * Servicio centralizado de logging
 * Reemplaza console.log/error con logging estructurado
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
  error?: Error;
}

class Logger {
  private isDev = import.meta.env.DEV;
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  private createEntry(
    level: LogLevel,
    message: string,
    context?: string,
    data?: unknown,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
      error,
    };
  }

  private log(entry: LogEntry) {
    // Almacenar en memoria (útil para debugging)
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Solo mostrar en consola en desarrollo
    if (this.isDev) {
      const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]${entry.context ? ` [${entry.context}]` : ''}`;

      switch (entry.level) {
        case 'debug':
          console.debug(prefix, entry.message, entry.data || '');
          break;
        case 'info':
          console.info(prefix, entry.message, entry.data || '');
          break;
        case 'warn':
          console.warn(prefix, entry.message, entry.data || '');
          break;
        case 'error':
          console.error(prefix, entry.message, entry.data || '', entry.error || '');
          break;
      }
    }

    // En producción, aquí podrías enviar a un servicio como Sentry
    if (!this.isDev && entry.level === 'error') {
      // TODO: Integrar con Sentry u otro servicio de monitoreo
      // Sentry.captureException(entry.error || new Error(entry.message));
    }
  }

  debug(message: string, context?: string, data?: unknown) {
    this.log(this.createEntry('debug', message, context, data));
  }

  info(message: string, context?: string, data?: unknown) {
    this.log(this.createEntry('info', message, context, data));
  }

  warn(message: string, context?: string, data?: unknown) {
    this.log(this.createEntry('warn', message, context, data));
  }

  error(message: string, context?: string, error?: Error, data?: unknown) {
    this.log(this.createEntry('error', message, context, data, error));
  }

  // Obtener logs recientes (útil para debugging)
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Limpiar logs
  clearLogs() {
    this.logs = [];
  }

  // Helper para capturar errores de async/await
  async captureAsync<T>(
    fn: () => Promise<T>,
    context: string
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      this.error(
        error instanceof Error ? error.message : 'Unknown error',
        context,
        error instanceof Error ? error : undefined
      );
      return null;
    }
  }
}

// Singleton
export const logger = new Logger();

// Helper para usar en componentes
export function useLogger(context: string) {
  return {
    debug: (message: string, data?: unknown) => logger.debug(message, context, data),
    info: (message: string, data?: unknown) => logger.info(message, context, data),
    warn: (message: string, data?: unknown) => logger.warn(message, context, data),
    error: (message: string, error?: Error, data?: unknown) =>
      logger.error(message, context, error, data),
  };
}
