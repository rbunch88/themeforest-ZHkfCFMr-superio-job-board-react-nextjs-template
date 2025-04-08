
'use client'

import { useEffect, useState } from "react";
import { Range, getTrackBackground } from "react-range"; // Import react-range
import { useDispatch, useSelector } from "react-redux";
import { addDestination } from "../../../features/filter/employerFilterSlice";

const DestinationRangeSlider = () => {
    const { destination } = useSelector((state) => state.employerFilter);
    // Adapt state for react-range (uses an array [min, max])
    const [values, setValues] = useState([destination.min, destination.max]);

    const dispatch = useDispatch();

    // destiations handler
    // Adapt handler for react-range (passes array)
    const handleOnChange = (newValues) => {
        // Update local state immediately for responsiveness
        setValues(newValues);
        // Dispatch the change (consider debouncing if performance is an issue)
        dispatch(addDestination({ min: newValues[0], max: newValues[1] }));
    };

    useEffect(() => {
        // Update state if Redux store changes
        setValues([destination.min, destination.max]);
    }, [destination.min, destination.max]); // Depend on specific min/max

    return (
        <div className="range-slider-one">
            <Range
                step={1}
                min={0}
                max={100}
                values={values}
                onChange={(newValues) => handleOnChange(newValues)}
                renderTrack={({ props, children }) => (
                    <div
                        {...props}
                        style={{
                            ...props.style,
                            height: '6px',
                            width: '100%',
                            background: getTrackBackground({
                                values: values,
                                colors: ['#ccc', '#007bff', '#ccc'], // Adjust colors as needed
                                min: 0,
                                max: 100
                            }),
                            borderRadius: '4px'
                        }}
                    >
                        {children}
                    </div>
                )}
                renderThumb={({ props }) => (
                    <div
                        {...props}
                        style={{
                            ...props.style,
                            height: '18px',
                            width: '18px',
                            backgroundColor: '#007bff', // Adjust thumb color
                            borderRadius: '50%',
                            boxShadow: '0px 2px 6px #AAA'
                        }}
                    />
                )}
            />
            <div className="input-outer">
                <div className="amount-outer">
                    {/* Display the max value from the state array */}
                    <span className="area-amount">{values[1]}</span>
                    km
                </div>
            </div>
        </div>
    );
};

export default DestinationRangeSlider;
