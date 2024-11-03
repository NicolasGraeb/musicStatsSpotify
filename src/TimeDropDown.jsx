import React from 'react';
import 'dropdown.css';

const TimeDropdown = ({ timeRange, setTimeRange }) => {
    const handleChange = (event) => {
        setTimeRange(event.target.value);
    };

    return (
        <div className="time-range-dropdown">
            <select
                className="drop-down"
                id="timeRange"
                value={timeRange}
                onChange={handleChange}
            >
                <option value="short_term">Short Term</option>
                <option value="medium_term">Medium Term</option>
                <option value="long_term">Long Term</option>
            </select>
        </div>
    );
};

export default TimeDropdown;
