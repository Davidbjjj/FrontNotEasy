import React, { useState, useRef, useEffect } from "react";

export default function TokenInput({ length, onChange, value }) {
  const [values, setValues] = useState(Array(length).fill(""));
  const inputsRef = useRef([]);

  useEffect(() => {
    if (value && value.length === length) {
      setValues(value.split(""));
    }
  }, [value, length]);

  const handleChange = (e, index) => {
    const val = e.target.value.toUpperCase();
    
    // Se o valor estiver vazio (backspace/delete), limpar o campo atual
    if (!val) {
      const newValues = [...values];
      newValues[index] = "";
      setValues(newValues);
      onChange(newValues.join(""));
      return;
    }

    const singleChar = val.charAt(0);
    
    // Permitir apenas: A-Z e 0-9
    if (!/^[A-Z0-9]$/.test(singleChar)) return;

    const newValues = [...values];
    newValues[index] = singleChar;
    setValues(newValues);
    onChange(newValues.join(""));

    if (index < length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Se pressionar Backspace e o campo atual estiver vazio, voltar para o campo anterior
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      const newValues = [...values];
      newValues[index - 1] = ""; // Limpar o campo anterior
      setValues(newValues);
      onChange(newValues.join(""));
      inputsRef.current[index - 1].focus();
    }
  };

  return (
    <div className="token-input-container">
      {values.map((v, i) => (
        <input
          key={i}
          type="text"
          maxLength={1}
          value={v}
          ref={(el) => (inputsRef.current[i] = el)}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="token-input-box"
        />
      ))}
    </div>
  );
}