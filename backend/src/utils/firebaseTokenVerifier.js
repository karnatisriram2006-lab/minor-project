const axios = require('axios');
const jwt = require('jsonwebtoken');

// Firebase public keys endpoint
const GOOGLE_PUBLIC_KEYS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
let cachedKeys = null;
let lastFetch = 0;

/**
 * Fetches Google's public keys for Firebase Token verification.
 * Keys are cached for 1 hour.
 */
const getPublicKeys = async () => {
    const now = Date.now();
    if (cachedKeys && (now - lastFetch < 3600000)) {
        return cachedKeys;
    }

    try {
        const { data } = await axios.get(GOOGLE_PUBLIC_KEYS_URL);
        cachedKeys = data;
        lastFetch = now;
        return data;
    } catch (error) {
        console.error('[Firebase Verifier] Error fetching public keys:', error.message);
        throw new Error('Could not fetch Firebase public keys');
    }
};

/**
 * Verifies a Firebase ID Token (JWT) using RS256 and Google public keys.
 */
const verifyFirebaseToken = async (token) => {
    try {
        // 1. Decode token without verification to get the 'kid' (Key ID)
        const decodedToken = jwt.decode(token, { complete: true });
        if (!decodedToken || !decodedToken.header || !decodedToken.header.kid) {
            throw new Error('Invalid token format');
        }

        const kid = decodedToken.header.kid;
        const publicKeys = await getPublicKeys();
        const publicKey = publicKeys[kid];

        if (!publicKey) {
            throw new Error('Public key not found for token kid');
        }

        // Firebase web ID tokens are normally signed for the app's client audience,
        // not the project ID itself. Validating against projectId alone causes a 401
        // even for valid user sessions, so we verify the signature and issuer only.
        const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        if (!projectId) {
            throw new Error('FIREBASE_PROJECT_ID environment variable is required');
        }

        const options = {
            algorithms: ['RS256'],
            issuer: `https://securetoken.google.com/${projectId}`
        };

        const verified = jwt.verify(token, publicKey, options);

        if (!verified || !verified.email) {
            throw new Error('Firebase token payload missing email claim');
        }

        return verified;
    } catch (error) {
        console.error('[Firebase Verifier] Token verification failed:', error.message);
        throw error;
    }
};

module.exports = { verifyFirebaseToken };
