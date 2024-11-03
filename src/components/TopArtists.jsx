import { useEffect, useState } from "react";
import './artistContainer.css';
import TimeDropdown from "./TimeDropDown.jsx";

const TopArtists = ({ accessToken }) => {
    const [topArtists, setTopArtists] = useState([]);
    const [timeRange, setTimeRange] = useState('medium_term');
    const [limit, setLimit] = useState(5);

    async function fetchWebApi(endpoint, method = 'GET', body) {
        try {
            const response = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,  // Ensure token is valid
                    'Content-Type': 'application/json',
                },
                method,
                body: JSON.stringify(body)
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

    async function getTopArtists(timeRange, limit) {
        const data = await fetchWebApi(`me/top/artists?time_range=${timeRange}&limit=${limit}`);
        if (!data || !data.items) {
            console.error('Failed to fetch top artists or data is empty:', data);
            return [];
        }
        return data.items;
    }

    async function formatTopArtists(time, limit) {
        const topArtistsData = await getTopArtists(time, limit);

        if (!topArtistsData) {
            console.error('Top artists are undefined or empty.');
            return [];
        }

        return topArtistsData.map(({ name, genres, images }) => ({
            name,
            genres,
            images: images[0]?.url,
        }));
    }

    const fetchTopArtists = async () => {
        const formattedArtists = await formatTopArtists(timeRange, limit);
        setTopArtists(formattedArtists);
    };

    useEffect(() => {
        if (accessToken) {
            fetchTopArtists();
        }
    }, [accessToken, timeRange, limit]);

    const handleLimitChange = (event) => {
        const value = parseInt(event.target.value, 10);
        if (value > 0) {
            setLimit(value);
        }
    };

    return (
        <div className="top-artists">
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
            <div className="artists-scroll-container">
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {topArtists.map((artist, index) => (
                        <li key={index} className="list-of-artists">
                            <div className="artist-container">
                                <div className="artist-image">
                                    {artist.images && (
                                        <img
                                            src={artist.images}
                                            alt={`${artist.name} cover`}
                                            style={{
                                                width: '100px',
                                                height: '100px',
                                                marginLeft: '10px',
                                                borderRadius: '5px',
                                            }}
                                        />
                                    )}
                                </div>
                                <div className="artist-info">
                                    <h2 className="artist-name">{artist.name}</h2>
                                    <p className="artist-genres">
                                        {artist.genres.length > 0 ? artist.genres.join(', ') : 'No genres available'}
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TopArtists;
