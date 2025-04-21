import { Agent } from 'undici';

// === Default Configuration (milliseconds & counts) ===
const DEFAULT_CONNECTION_TIMEOUT = 2 * 60 * 1000; // 2 minutes
const DEFAULT_REQUEST_TIMEOUT    = 5 * 60 * 1000; // 5 minutes
const DEFAULT_RETRY_DELAY        = 60 * 1000;    // 1 minute
const DEFAULT_MAX_RETRIES        = 3;            // max attempts

class HfInference {
  /**
   * @param {string} apiKey
   * @param {object} [options]
   * @param {number} [options.connectionTimeout] - connect timeout in ms
   * @param {number} [options.requestTimeout] - per-request timeout in ms
   * @param {number} [options.retryDelay] - delay between retries in ms
   * @param {number} [options.maxRetries] - number of retry attempts
   */
  constructor(apiKey, options = {}) {
    this.apiKey            = apiKey;
    this.connectionTimeout = options.connectionTimeout ?? DEFAULT_CONNECTION_TIMEOUT;
    this.requestTimeout    = options.requestTimeout    ?? DEFAULT_REQUEST_TIMEOUT;
    this.retryDelay        = options.retryDelay        ?? DEFAULT_RETRY_DELAY;
    this.maxRetries        = options.maxRetries        ?? DEFAULT_MAX_RETRIES;
  }

  /**
   * Create a new endpoint handler with inherited configuration
   * @param {string} endpointUrl
   */
  endpoint(endpointUrl) {
    return new HfInferenceEndpoint(
      endpointUrl,
      this.apiKey,
      this.connectionTimeout,
      this.requestTimeout,
      this.retryDelay,
      this.maxRetries
    );
  }
}

class HfInferenceEndpoint {
  /**
   * @param {string} endpointUrl
   * @param {string} apiKey
   * @param {number} connectionTimeout
   * @param {number} requestTimeout
   * @param {number} retryDelay
   * @param {number} maxRetries
   */
  constructor(
    endpointUrl,
    apiKey,
    connectionTimeout,
    requestTimeout,
    retryDelay,
    maxRetries
  ) {
    this.endpoint       = endpointUrl;
    this.apiKey         = apiKey;
    this.requestTimeout = requestTimeout;
    this.retryDelay     = retryDelay;
    this.maxRetries     = maxRetries;

    // Each endpoint gets its own Agent for connection timeouts
    this.agent = new Agent({ connectTimeout: connectionTimeout });
  }

  /**
   * Send a POST request with retry logic on HTTP 503
   * @param {object} data - payload to send
   */
  async query(data) {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId  = setTimeout(() => controller.abort(), this.requestTimeout);

      try {
        const response = await fetch(this.endpoint, {
          dispatcher: this.agent,
          signal: controller.signal,
          method: 'POST',
          headers: {
            'Accept':        'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type':  'application/json',
          },
          body: JSON.stringify({ inputs: '', ...data }),
        });

        clearTimeout(timeoutId);

        if (response.status === 503) {
          if (attempt < this.maxRetries) {
            await new Promise(resolve => setTimeout(resolve, this.retryDelay));
            continue;
          }
          throw new Error(
            `Service Unavailable (503) at ${this.endpoint} after ${this.maxRetries} attempts`
          );
        }

        return await response.json();

      } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          throw new Error(
            `Request to ${this.endpoint} timed out after ${this.requestTimeout}ms`
          );
        }
        if (attempt === this.maxRetries) throw err;
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }
  }
}

export const hfCustomApi = {
  HfInference,
};