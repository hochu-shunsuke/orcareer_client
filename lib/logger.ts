/**
 * 構造化ロギングシステム
 * 
 * 特徴：
 * - 環境別ログレベル制御
 * - 構造化ログフォーマット（JSON）
 * - パフォーマンス測定機能
 * - エラー詳細情報付与
 * - タイムスタンプとコンテキスト情報自動付与
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  performance?: {
    duration: number;
    operation: string;
  };
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = 'info';
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    
    // 環境別ログレベル設定
    if (this.isDevelopment) {
      this.logLevel = 'debug';
    } else if (process.env.NODE_ENV === 'test') {
      this.logLevel = 'warn';
    } else {
      this.logLevel = 'error';
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private formatLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    if (this.isDevelopment) {
      // 開発環境では読みやすい形式
      console.log(`[${entry.level.toUpperCase()}] ${entry.timestamp} - ${entry.message}`);
      if (entry.context) console.log(`Context: ${entry.context}`);
      if (entry.data) console.log('Data:', entry.data);
      if (entry.error) console.error('Error Details:', entry.error);
      if (entry.performance) console.log(`Performance: ${entry.performance.operation} took ${entry.performance.duration}ms`);
    } else {
      // 本番環境ではJSON形式（監視ツール用）
      console.log(JSON.stringify(entry));
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    data?: Record<string, any>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data
    };
  }

  debug(message: string, context?: string, data?: Record<string, any>): void {
    const entry = this.createLogEntry('debug', message, context, data);
    this.formatLog(entry);
  }

  info(message: string, context?: string, data?: Record<string, any>): void {
    const entry = this.createLogEntry('info', message, context, data);
    this.formatLog(entry);
  }

  warn(message: string, context?: string, data?: Record<string, any>): void {
    const entry = this.createLogEntry('warn', message, context, data);
    this.formatLog(entry);
  }

  error(message: string, error?: Error, context?: string, data?: Record<string, any>): void {
    const entry = this.createLogEntry('error', message, context, data);
    
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }
    
    this.formatLog(entry);
  }

  /**
   * データベース操作エラー用の専用ログ
   */
  dbError(operation: string, error: any, query?: string): void {
    this.error(
      `Database operation failed: ${operation}`,
      error,
      'database',
      { operation, query }
    );
  }

  /**
   * API呼び出しエラー用の専用ログ
   */
  apiError(endpoint: string, error: any, method: string = 'GET'): void {
    this.error(
      `API call failed: ${method} ${endpoint}`,
      error,
      'api',
      { endpoint, method }
    );
  }

  /**
   * パフォーマンス測定機能
   */
  performance(operation: string, startTime: number): void {
    const duration = Date.now() - startTime;
    const entry = this.createLogEntry('info', `Performance measurement: ${operation}`);
    entry.performance = { duration, operation };
    this.formatLog(entry);
  }

  /**
   * パフォーマンス測定付きの非同期関数実行
   */
  async withPerformance<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    this.debug(`Starting operation: ${operation}`);
    
    try {
      const result = await fn();
      this.performance(operation, startTime);
      return result;
    } catch (error) {
      this.error(`Operation failed: ${operation}`, error as Error);
      throw error;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const logger = Logger.getInstance();

// 便利な関数もエクスポート
export const logDbError = (operation: string, error: any, query?: string) => 
  logger.dbError(operation, error, query);

export const logApiError = (endpoint: string, error: any, method?: string) => 
  logger.apiError(endpoint, error, method);

export const measurePerformance = <T>(operation: string, fn: () => Promise<T>) => 
  logger.withPerformance(operation, fn);