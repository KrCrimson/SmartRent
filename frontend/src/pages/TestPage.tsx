import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f0f0f0',
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>
          🚀 SmartRent Frontend Funcionando
        </h1>
        <p style={{ color: '#666', marginBottom: '10px' }}>
          Backend: ✅ Conectado (localhost:5000)
        </p>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Frontend: ✅ React + Vite (localhost:5173)
        </p>
        <div style={{
          padding: '15px',
          backgroundColor: '#e8f5e8',
          borderRadius: '4px',
          color: '#2d5a2d'
        }}>
          Sistema listo para implementar HU-015: Formularios de Alertas
        </div>
      </div>
    </div>
  );
};

export default TestPage;