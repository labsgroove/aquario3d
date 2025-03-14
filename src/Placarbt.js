import React, { useState, useEffect } from 'react';

function App() {
  const [stored, setStored] = useState(0);    // Total de paletes armazenados
  const [rejects, setRejects] = useState(0);  // Total de rejeitos

  // Calcula os paletes sem rejeição e a porcentagem
  const valid = stored - rejects;
  const percentage = stored > 0 ? ((valid / stored) * 100).toFixed(2) : 0;

  // Função para tratar eventos de teclado
  const handleKeyDown = (e) => {
    if (e.key === '+') {
      setStored(prev => prev + 1);
    } else if (e.key === '-') {
      setRejects(prev => prev + 1);
    }
  };

  // Adiciona e remove o listener de teclado
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>1BTTRANS</h1>
      <div style={{ border: '1px solid #ccc', padding: '40px', display: 'inline-block' }}>
        <h2>PALETES TOTAL: {stored}</h2>
        <h2>BDP: {percentage}%</h2>
      </div>
      <div style={{ marginTop: '40px' }}>
        <h3>BDP TOTAL: {valid}</h3>
      </div>
      <div style={{ marginTop: '40px' }}>
        <p>Pressione a tecla "+" para adicionar um palete armazenado</p>
        <p>Pressione a tecla "-" para registrar um rejeito</p>
      </div>
    </div>
  );
}

export default App;
