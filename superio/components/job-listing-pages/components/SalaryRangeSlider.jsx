
'use client'

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { Range, getTrackBackground } from "react-range";

// Define configurations for different salary units
const salaryUnits = {
    YEAR: { min: 0, max: 200000, step: 1000, label: 'Per Year', defaultRange: [0, 200000] },
    HOUR: { min: 0, max: 150, step: 5, label: 'Per Hour', defaultRange: [0, 150] },
    // Add other units like MONTH, WEEK, DAY if needed
};

const SalaryRangeSlider = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // --- State Initialization ---
    const initialUnit = searchParams.get('salary_unit') || 'YEAR';
    const [selectedUnit, setSelectedUnit] = useState(salaryUnits[initialUnit] ? initialUnit : 'YEAR');

    const currentUnitConfig = salaryUnits[selectedUnit];

    // Initialize range values based on URL params *and* selected unit's bounds
    const initialMin = parseInt(searchParams.get('salary_min') || currentUnitConfig.defaultRange[0], 10);
    const initialMax = parseInt(searchParams.get('salary_max') || currentUnitConfig.defaultRange[1], 10);

    // Ensure initial values are within the bounds of the selected unit
    const clampedMin = Math.max(currentUnitConfig.min, Math.min(currentUnitConfig.max, initialMin));
    const clampedMax = Math.max(clampedMin, Math.min(currentUnitConfig.max, initialMax)); // Ensure max >= min

    const [values, setValues] = useState([clampedMin, clampedMax]);

    // --- Update URL on final change ---
    const handleFinalChange = useCallback((finalValues) => {
        const params = new URLSearchParams(searchParams);
        const currentMin = params.get('salary_min');
        const currentMax = params.get('salary_max');
        const currentUnitParam = params.get('salary_unit'); // Get current unit from params

        const newMin = finalValues[0].toString();
        const newMax = finalValues[1].toString();

        // Update only if values or unit have actually changed
        if (currentMin !== newMin || currentMax !== newMax || currentUnitParam !== selectedUnit) {
            params.set('salary_min', newMin);
            params.set('salary_max', newMax);
            params.set('salary_unit', selectedUnit); // Include selected unit
            params.set('page', '1'); // Reset page on filter change
            router.push(`/jobs?${params.toString()}`, { scroll: false });
        }
    }, [searchParams, router, selectedUnit]); // Add selectedUnit dependency

    // --- Update local state for immediate visual feedback ---
    const handleOnChange = (newValues) => {
        setValues(newValues);
    };

    // --- Effect to sync state with URL changes ---
    // --- Handle Unit Change ---
    const handleUnitChange = (event) => {
        const newUnit = event.target.value;
        const newUnitConfig = salaryUnits[newUnit];

        setSelectedUnit(newUnit);
        setValues(newUnitConfig.defaultRange); // Reset slider to default for new unit

        // Update URL immediately on unit change
        const params = new URLSearchParams(searchParams);
        params.set('salary_unit', newUnit);
        params.set('salary_min', newUnitConfig.defaultRange[0].toString());
        params.set('salary_max', newUnitConfig.defaultRange[1].toString());
        params.set('page', '1');
        router.push(`/jobs?${params.toString()}`, { scroll: false });
    };

    // --- Effect to sync state with URL changes ---
    useEffect(() => {
        const urlUnit = searchParams.get('salary_unit') || 'YEAR';
        const validUrlUnit = salaryUnits[urlUnit] ? urlUnit : 'YEAR';
        const urlUnitConfig = salaryUnits[validUrlUnit];

        const urlMin = parseInt(searchParams.get('salary_min') || urlUnitConfig.defaultRange[0], 10);
        const urlMax = parseInt(searchParams.get('salary_max') || urlUnitConfig.defaultRange[1], 10);

        // Clamp URL values to the bounds of the URL unit
        const clampedUrlMin = Math.max(urlUnitConfig.min, Math.min(urlUnitConfig.max, urlMin));
        const clampedUrlMax = Math.max(clampedUrlMin, Math.min(urlUnitConfig.max, urlMax));

        // Update state only if it differs from URL
        if (selectedUnit !== validUrlUnit || values[0] !== clampedUrlMin || values[1] !== clampedUrlMax) {
            setSelectedUnit(validUrlUnit);
            setValues([clampedUrlMin, clampedUrlMax]);
        }
        // Intentionally only run when searchParams changes
    }, [searchParams]); // Removed values and selectedUnit from deps to avoid loops

    return (
        <div className="salary-range"> {/* Removed range-slider-one if not needed */}
             {/* Unit Selection Radio Buttons */}
             <div className="salary-unit-selection mb-3">
                {Object.entries(salaryUnits).map(([unitKey, unitConfig]) => (
                    <div className="form-check form-check-inline" key={unitKey}>
                        <input
                            className="form-check-input"
                            type="radio"
                            name="salaryUnit"
                            id={`unit-${unitKey}`}
                            value={unitKey}
                            checked={selectedUnit === unitKey}
                            onChange={handleUnitChange}
                        />
                        <label className="form-check-label" htmlFor={`unit-${unitKey}`}>
                            {unitConfig.label}
                        </label>
                    </div>
                ))}
            </div>

            <Range
                step={currentUnitConfig.step}
                min={currentUnitConfig.min}
                max={currentUnitConfig.max}
                values={values}
                onChange={handleOnChange}
                onFinalChange={handleFinalChange}
                renderTrack={({ props, children }) => (
                    <div
                        {...props}
                        style={{
                            ...props.style,
                            height: '6px',
                            width: '100%',
                            background: getTrackBackground({
                                values: values,
                                colors: ['#ccc', '#007bff', '#ccc'],
                                min: currentUnitConfig.min,
                                max: currentUnitConfig.max
                            }),
                            borderRadius: '4px'
                        }}
                    >
                        {children}
                    </div>
                )}
                renderThumb={({ props }) => {
                    const { key, ...otherProps } = props;
                    return (
                        <div
                            key={key}
                            {...otherProps}
                            style={{
                                ...otherProps.style,
                                height: '18px',
                                width: '18px',
                                backgroundColor: '#007bff', // Adjust thumb color
                                borderRadius: '50%',
                                boxShadow: '0px 2px 6px #AAA'
                            }}
                        />
                    );
                }}
            />
            <div className="input-outer">
                <div className="amount-outer">
                    <span className="d-inline-flex align-items-center">
                        {/* Display values dynamically based on unit */}
                        <span className="min">${values[0].toLocaleString()}</span>
                        <span className="max ms-2">
                            ${values[1] === currentUnitConfig.max
                                ? `${currentUnitConfig.max.toLocaleString()}+`
                                : values[1].toLocaleString()}
                        </span>
                        <span className="unit-label ms-2">({currentUnitConfig.label})</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SalaryRangeSlider;
