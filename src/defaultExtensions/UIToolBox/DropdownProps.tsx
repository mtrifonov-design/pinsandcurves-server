import React, { useState, useEffect } from 'react';

interface DropdownProps {
  options: string[]; // List of available options
  selectedValue?: string; // Initial selected value
  onChange: (value: string | undefined) => void; // Callback when selection changes
}

const Dropdown: React.FC<DropdownProps> = ({ options, selectedValue, onChange }) => {
  const [currentValue, setCurrentValue] = useState<string | undefined>(selectedValue);

  // Detect changes to selectedValue from props and update state
  useEffect(() => {
    setCurrentValue(selectedValue);
  }, [selectedValue]);

  // Determine if the current value is invalid
  const isInvalidSelection = currentValue && !options.includes(currentValue);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value === 'None' ? undefined : event.target.value;
    setCurrentValue(value);
    onChange(value);
  };

  return (
    <div style={{ display: 'inline-block', position: 'relative' }}>
      {/* Dropdown */}
      <select
        value={currentValue ?? 'None'}
        onChange={handleSelectChange}
        style={{
          color: isInvalidSelection ? 'var(--danger)' : 'var(--gray7)',
          backgroundColor: 'var(--gray1)',
          borderColor: 'transparent',
          borderRadius: 'var(--borderRadiusSmall)',
          width: '100%',
        }}
      >
        {/* Default "None" option */}
        <option value="None" disabled={!currentValue}>Default</option>

        {/* Render options */}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}

        {/* Current invalid value if applicable */}
        {isInvalidSelection && (
          <option value={currentValue} disabled>
            {currentValue} (Not Connected)
          </option>
        )}
      </select>
    </div>
  );
};

export default Dropdown;

// Usage example:
// <Dropdown
//   options={["Option 1", "Option 2", "Option 3"]}
//   selectedValue={undefined}
//   onChange={(value) => console.log("Selected value:", value)}
// />
