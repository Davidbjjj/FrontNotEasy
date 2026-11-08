import React from 'react';
import { STATUS_LABEL, TIPO_LABEL } from './duvidaLogic';
import type { Duvida } from './types';
import styles from './Duvida.module.css';

export const DuvidaStatus: React.FC<{ duvidas: Duvida[] }> = ({ duvidas }) => {
  if (duvidas.length === 0) return null;
  return (
    <ul className={styles.lista} aria-label="Suas dúvidas e contestações desta questão">
      {duvidas.map((d) => (
        <li key={d.id} className={styles.item}>
          <div className={styles.itemHead}>
            <strong>{TIPO_LABEL[d.tipo]}</strong>
            <span className={`${styles.status} ${styles[`s${d.status}`]}`}>Status: {STATUS_LABEL[d.status]}</span>
          </div>
          <p className={styles.texto}>{d.texto}</p>
          {d.anexoNome && <p className={styles.meta}>Anexo: {d.anexoNome}</p>}
          {d.resposta && (
            <p className={styles.resposta}><strong>Resposta do professor: </strong>{d.resposta}</p>
          )}
        </li>
      ))}
    </ul>
  );
};
