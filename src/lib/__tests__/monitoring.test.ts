import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  logEvent,
  logError,
  trackApiCall,
  markPerformance,
  measurePerformance,
} from '../monitoring';

describe('logEvent', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('logs event name and data to console in development', () => {
    const data = { userId: '123', action: 'click' };
    logEvent('button_clicked', data);

    expect(console.log).toHaveBeenCalledWith(
      '[CommunityHub] button_clicked',
      data,
    );
  });

  it('logs event name with empty string when no data provided', () => {
    logEvent('page_loaded');

    expect(console.log).toHaveBeenCalledWith(
      '[CommunityHub] page_loaded',
      '',
    );
  });

  it('does not log to console in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    logEvent('should_not_log', { key: 'value' });

    expect(console.log).not.toHaveBeenCalled();
  });
});

describe('logError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs error message and stack trace', () => {
    const error = new Error('Something broke');
    logError(error);

    expect(console.error).toHaveBeenCalledWith(
      '[CommunityHub Error] Something broke',
      expect.objectContaining({ stack: expect.any(String) }),
    );
  });

  it('includes context metadata in the log', () => {
    const error = new Error('DB timeout');
    const context = { query: 'SELECT *', table: 'members' };
    logError(error, context);

    expect(console.error).toHaveBeenCalledWith(
      '[CommunityHub Error] DB timeout',
      expect.objectContaining({
        stack: expect.any(String),
        query: 'SELECT *',
        table: 'members',
      }),
    );
  });

  it('logs regardless of NODE_ENV', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const error = new Error('Prod error');
    logError(error);

    expect(console.error).toHaveBeenCalledTimes(1);
    vi.unstubAllEnvs();
  });
});

describe('trackApiCall', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('logs api_call event with route, method, status, and duration', () => {
    trackApiCall('/api/v1/events', 'GET', 200, 45);

    expect(console.log).toHaveBeenCalledWith(
      '[CommunityHub] api_call',
      {
        route: '/api/v1/events',
        method: 'GET',
        statusCode: 200,
        durationMs: 45,
      },
    );
  });

  it('tracks error status codes', () => {
    trackApiCall('/api/v1/members', 'POST', 500, 1200);

    expect(console.log).toHaveBeenCalledWith(
      '[CommunityHub] api_call',
      expect.objectContaining({
        statusCode: 500,
        durationMs: 1200,
      }),
    );
  });
});

describe('markPerformance', () => {
  it('calls performance.mark with prefixed label', () => {
    const markSpy = vi.spyOn(performance, 'mark').mockImplementation(() => ({}) as PerformanceEntry as PerformanceMark);
    markPerformance('page_load');

    expect(markSpy).toHaveBeenCalledWith('communityhub:page_load');
    markSpy.mockRestore();
  });
});

describe('measurePerformance', () => {
  it('returns duration when marks exist', () => {
    const measureSpy = vi.spyOn(performance, 'measure').mockReturnValue({
      duration: 250,
    } as PerformanceMeasure);

    const result = measurePerformance('start', 'end');

    expect(result).toBe(250);
    expect(measureSpy).toHaveBeenCalledWith(
      'communityhub:start-to-end',
      'communityhub:start',
      'communityhub:end',
    );
    measureSpy.mockRestore();
  });

  it('returns null when measurement fails', () => {
    vi.spyOn(performance, 'measure').mockImplementation(() => {
      throw new Error('Mark not found');
    });

    const result = measurePerformance('missing_start', 'missing_end');
    expect(result).toBeNull();

    vi.restoreAllMocks();
  });
});
