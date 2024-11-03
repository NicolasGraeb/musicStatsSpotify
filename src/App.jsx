import { useEffect, useState } from 'react';
import TopTracks from 'TopTracks';
import TopArtists from 'TopArtists';
import 'header.css';
import { redirectToSpotifyAuth, getToken, refreshToken } from 'Login';

const App = () => {
    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        const storedAccessToken = localStorage.getItem('access_token');

        if (storedAccessToken) {
            setAccessToken(storedAccessToken);
        } else {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');

            if (code) {
                getToken(code).then(token => {
                    setAccessToken(token);
                }).catch(err => {
                    console.error('Error getting token:', err);
                });
            } else {
                // Clear stored tokens to force re-authentication
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                redirectToSpotifyAuth();
            }
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            refreshToken().then(newToken => {
                setAccessToken(newToken);
            }).catch(err => {
                console.error('Error refreshing token:', err);
            });
        }, 3600 * 1000); // Refresh token every hour

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="App">
            <h1 className="header">Your Best Songs & Artists</h1>
            {accessToken ? (
                <div className="content-containers">
                    <TopTracks accessToken={accessToken} />
                    <TopArtists accessToken={accessToken} />
                </div>
            ) : (
                <p>Redirecting to Spotify for authorization...</p>
            )}
        </div>
    );
};

export default App;
