import React, { useState, useRef, useEffect } from 'react';

const DropdownCheckbox = ({ label, options, selectedOptions, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleOptionChange = (e) => {
    const { value } = e.target;
    const newSelectedOptions = selectedOptions.includes(value)
      ? selectedOptions.filter(option => option !== value)
      : [...selectedOptions, value];
    onChange(newSelectedOptions);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(prevState => !prevState);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="dropdown-checkbox" ref={dropdownRef}>
      <button type="button" onClick={handleToggle} className="dropdown-toggle">
        {label}
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          {options.map((option) => (
            <label key={option} className="dropdown-item">
              <input
                type="checkbox"
                value={option}
                checked={selectedOptions.includes(option)}
                onChange={handleOptionChange}
              />
              {option}
            </label>
          ))}
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default DropdownCheckbox;
