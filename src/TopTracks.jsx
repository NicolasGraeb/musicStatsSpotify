import { useEffect, useState } from 'react';
import './songContainer.css';
import TimeDropdown from './TimeDropdown.jsx';

const TopTracks = ({ accessToken }) => {
    const [topTracks, setTopTracks] = useState([]);
    const [timeRange, setTimeRange] = useState('medium_term');
    const [limit, setLimit] = useState(5);

    async function fetchWebApi(endpoint, method = 'GET', body = null) {
        try {
            const response = await fetch(`https://api.spotify.com/${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,  // Ensure token is valid
                    'Content-Type': 'application/json',
                },
                method,
                body: method === 'POST' ? JSON.stringify(body) : undefined,
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`API request failed with status ${response.status}:`, errorData);
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('Error in fetchWebApi:', error);
            return null;
        }
    }


    async function getTopTracks(timeRange, limit) {
        const data = await fetchWebApi(`v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`);
        if (!data || !data.items) {
            console.error('Failed to fetch top tracks or data is empty:', data);
            return [];
        }
        return data.items;
    }

    async function formatTopTracks(time, limit) {
        const topTracksData = await getTopTracks(time, limit);

        if (!topTracksData) {
            console.error('Top tracks are undefined or empty.');
            return [];
        }

        return topTracksData.map(({ name, artists, album }) => ({
            name,
            artists: artists.map(artist => artist.name),
            album: album.name,
            image: album.images[0]?.url,
        }));
    }

    const fetchTopTracks = async () => {
        const formattedTracks = await formatTopTracks(timeRange, limit);
        setTopTracks(formattedTracks);
    };

    useEffect(() => {
        if (accessToken) {
            fetchTopTracks();
        }
    }, [accessToken, timeRange, limit]);

    const handleLimitChange = (event) => {
        const value = parseInt(event.target.value, 10);
        if (value > 0) {
            setLimit(value);
        }
    };

    return (
        <div className="top-tracks">
            <div className="input-container">
                <input
                    className="input-number"
                    type="number"
                    id="limit"
                    value={limit}
                    min="1"
                    onChange={handleLimitChange}
                />
                <TimeDropdown timeRange={timeRange} setTimeRange={setTimeRange} />
            </div>
            <div className="tracks-scroll-container">
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {topTracks.map((track, index) => (
                        <li key={index} className="list-of-songs">
                            <div className="song-container">
                                <div className="song-image">
                                    {track.image && (
                                        <img
                                            src={track.image}
                                            alt={`${track.album} cover`}
                                            style={{
                                                width: '100px',
                                                height: '100px',
                                                marginLeft: '10px',
                                                borderRadius: '5px',
                                            }}
                                        />
                                    )}
                                </div>
                                <div className="song-info">
                                    <div>
                                        <span className="label">Title: </span>
                                        <span className="value">{track.name}</span>
                                    </div>
                                    <div>
                                        <span className="label">Artist: </span>
                                        <span className="value">{track.artists.join(', ')}</span>
                                    </div>
                                    <div>
                                        <span className="label">Album: </span>
                                        <span className="value">{track.album}</span>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TopTracks;
