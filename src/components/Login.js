export const clientId = '8dd0190c59e74083b9c4a1ec76943c6b';
export const redirectUri = 'spotify-best-artists-songs-1f5u.vercel.app';
const scope = 'user-read-private user-read-email user-top-read';

export const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

export const createCodeVerifier = () => {
    const codeVerifier = generateRandomString(64);
    window.localStorage.setItem('code_verifier', codeVerifier);
    return codeVerifier;
};

export const sha256 = async (plain) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
};

export const base64encode = (input) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
};

export const redirectToSpotifyAuth = async () => {
    const codeVerifier = createCodeVerifier();
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);
    const authUrl = new URL("https://accounts.spotify.com/authorize");
    const params = {
        response_type: 'code',
        client_id: clientId,
        scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: redirectUri,
    };

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
};

export const getToken = async (code) => {
    const codeVerifier = localStorage.getItem('code_verifier');
    const payload = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: clientId,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
        }),
    };

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', payload);
        const data = await response.json();

        if (!response.ok) {
            console.error(`Error fetching token: ${response.status} ${response.statusText}`, data);
            throw new Error('Failed to retrieve access token');
        }

        if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token); // Ensure refresh token is saved
            return data.access_token;
        }
    } catch (error) {
        console.error('Error fetching token:', error);
        throw error;
    }
};

export const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    const payload = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: clientId,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }),
    };

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', payload);
        const data = await response.json();

        if (!response.ok) {
            console.error(`Error refreshing token: ${response.status} ${response.statusText}`, data);
            throw new Error('Failed to refresh access token');
        }

        if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            return data.access_token;
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
    }
};
