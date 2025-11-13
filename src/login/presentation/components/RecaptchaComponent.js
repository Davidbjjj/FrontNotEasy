import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';

/**
 * Componente de CAPTCHA para testes locais (substitui reCAPTCHA real durante desenvolvimento)
 * Fornece 3 tipos de testes diferentes:
 *  - Math: pergunta simples de soma/subtração
 *  - Escolha: clique no ícone correto
 *  - Digitar: digite a palavra mostrada
 *
 * O componente expõe `executeRecaptcha()` via ref, que abre um overlay
 * e resolve com um token fake quando o teste for aprovado.
 * Use apenas em desenvolvimento/local.
 */
const generateFakeToken = (type) => {
  return `captcha-pass-${type}-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
};

// Modal/overlay data will be handled in the parent component to avoid nested hook issues

export const RecaptchaComponent = forwardRef(({ onToken }, ref) => {
  const [visible, setVisible] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [resolver, setResolver] = useState(null);
  // store test-specific data here to avoid nested components/hooks
  const [testData, setTestData] = useState(null);
  const [inputValue, setInputValue] = useState('');

  useImperativeHandle(ref, () => ({
    executeRecaptcha: (action = 'login') => {
      return new Promise((resolve) => {
        const tests = ['math','choice','type'];
        const picked = tests.includes(action) ? action : tests[Math.floor(Math.random()*tests.length)];

        // prepare data for the picked test
        let data = null;
        if (picked === 'math') {
          const a = Math.floor(Math.random() * 9) + 1;
          const b = Math.floor(Math.random() * 9) + 1;
          const op = Math.random() < 0.5 ? '+' : '-';
          const answer = op === '+' ? a + b : a - b;
          data = { a, b, op, answer };
        } else if (picked === 'choice') {
          const items = ['🐶','🐱','🐵','🐻','🐼','🐸'];
          const target = items[Math.floor(Math.random() * items.length)];
          const shuffled = items.sort(() => 0.5 - Math.random()).slice(0,4);
          if (!shuffled.includes(target)) shuffled[0] = target;
          data = { target, options: shuffled };
        } else if (picked === 'type') {
          const words = ['seguro','noteasy','devtest','liberdade','ola123'];
          const w = words[Math.floor(Math.random() * words.length)];
          data = { word: w };
        }

        setCurrentTest(picked);
        setTestData(data);
        setInputValue('');
        setVisible(true);
        setResolver(() => ({ resolve }));
      });
    }
  }));

  const handleSuccess = () => {
    const token = generateFakeToken(currentTest || 'test');
    // eslint-disable-next-line no-console
    console.log('DEBUG: CAPTCHA passed, token=', token);
    if (typeof onToken === 'function') onToken(token);
    if (resolver?.resolve) resolver.resolve(token);
    setVisible(false);
    setCurrentTest(null);
    setResolver(null);
    setTestData(null);
    setInputValue('');
  };

  const handleFail = () => {
    // eslint-disable-next-line no-console
    console.log('DEBUG: CAPTCHA failed or cancelled');
    if (resolver?.resolve) resolver.resolve(null);
    setVisible(false);
    setCurrentTest(null);
    setResolver(null);
    setTestData(null);
    setInputValue('');
  };

  // Render overlay inline to avoid nested-hook issues
  return (
    <>
      {visible && testData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: 20, borderRadius: 8, width: 360, maxWidth: '90%' }}>
            <button onClick={handleFail} style={{ float: 'right', border: 'none', background: 'transparent', fontSize: 16 }}>✕</button>
            <h3 style={{ marginTop: 0 }}>Verificação: você não é um robô</h3>

            {currentTest === 'math' && (
              <form onSubmit={(e)=>{ e.preventDefault(); if (parseInt(inputValue,10) === testData.answer) handleSuccess(); else handleFail(); }}>
                <p>Resolva: <strong>{testData.a} {testData.op} {testData.b}</strong></p>
                <input autoFocus value={inputValue} onChange={(e)=>setInputValue(e.target.value)} placeholder="Resultado" style={{ width: '100%', padding: 8 }} />
                <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                  <button type="submit">Verificar</button>
                  <button type="button" onClick={handleFail}>Cancelar</button>
                </div>
              </form>
            )}

            {currentTest === 'choice' && (
              <div>
                <p>Clique no ícone: <strong style={{ fontSize: 20 }}>{testData.target}</strong></p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {testData.options.map((opt, idx) => (
                    <button key={idx} onClick={() => { setInputValue(opt); if (opt === testData.target) handleSuccess(); else handleFail(); }} style={{ fontSize: 24, padding: 12 }}>{opt}</button>
                  ))}
                </div>
                <div style={{ marginTop: 10 }}>
                  <button onClick={handleFail}>Fechar</button>
                </div>
              </div>
            )}

            {currentTest === 'type' && (
              <form onSubmit={(e)=>{ e.preventDefault(); if (inputValue && inputValue.toString().trim().toLowerCase() === testData.word.toString().trim().toLowerCase()) handleSuccess(); else handleFail(); }}>
                <p style={{ userSelect: 'all', fontWeight: 'bold', fontSize: 18 }}>{testData.word}</p>
                <input value={inputValue} onChange={(e)=>setInputValue(e.target.value)} placeholder="Digite a palavra acima" style={{ width: '100%', padding: 8 }} />
                <div style={{ marginTop: 10 }}>
                  <button type="submit">Verificar</button>
                  <button type="button" onClick={handleFail}>Cancelar</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
});

RecaptchaComponent.displayName = 'RecaptchaComponent';

export default RecaptchaComponent;
