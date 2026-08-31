import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// In-memory cache for resolved secrets to minimize latency and API calls
const secretCache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes TTL

let secretClient = null;

function getClient() {
  if (!secretClient) {
    try {
      secretClient = new SecretManagerServiceClient();
    } catch (err) {
      console.warn('[SecretManager] Client initialization skipped (local environment).');
    }
  }
  return secretClient;
}

/**
 * Dynamically resolves a secret at runtime from Google Cloud Secret Manager.
 * Falls back to environment variables during local development.
 * 
 * @param {string} secretName - The name of the secret in Secret Manager (e.g., 'GEMINI_API_KEY')
 * @param {string} [fallbackEnvVar] - Name of local environment variable fallback
 * @returns {Promise<string>} The secret payload value
 */
export async function getSecret(secretName, fallbackEnvVar = secretName) {
  // 1. Check in-memory cache
  const cached = secretCache.get(secretName);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.value;
  }

  // 2. Check local environment variable
  const envVal = process.env[fallbackEnvVar] || process.env[secretName];
  if (envVal && envVal.trim().length > 0) {
    secretCache.set(secretName, { value: envVal.trim(), timestamp: Date.now() });
    return envVal.trim();
  }

  // 3. Query Google Cloud Secret Manager if GCP_PROJECT_ID is present
  const projectId = process.env.GCP_PROJECT_ID;
  if (projectId) {
    try {
      const client = getClient();
      if (client) {
        const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
        const [version] = await client.accessSecretVersion({ name });
        const secretValue = version.payload.data.toString('utf8');
        if (secretValue) {
          console.log(`[SecretManager] Dynamically resolved secret: ${secretName} from Google Cloud`);
          secretCache.set(secretName, { value: secretValue, timestamp: Date.now() });
          return secretValue;
        }
      }
    } catch (err) {
      console.warn(`[SecretManager] Warning: Could not retrieve ${secretName} from GCP Secret Manager (${err.message}).`);
    }
  }

  return '';
}
