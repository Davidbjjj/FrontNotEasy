import React, { useEffect, useId, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from './NotificationsProvider';
import { AppNotification } from './types';
import { Button } from '../ui/Button/Button';
import { EmptyState } from '../ui/EmptyState/EmptyState';
import styles from './NotificationBell.module.css';

export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `${minutes} min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h atrás`;
  const days = Math.floor(hours / 24);
  return `${days} dia${days > 1 ? 's' : ''} atrás`;
}

/** Sino com contador de não lidas + painel paginado. */
const NotificationBell: React.FC = () => {
  const { items, unreadCount, loading, error, hasMore, refreshCount, refresh, loadMore, markRead, markAllRead } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const navigate = useNavigate();

  // O sino só monta em páginas logadas: busca o contador assim que aparece (ex.: logo após o login)
  useEffect(() => {
    void refreshCount();
  }, [refreshCount]);

  // Atualiza a lista ao abrir
  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

  // Fecha com Esc (devolvendo o foco ao sino) ou clique fora
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [open]);

  const handleItem = (n: AppNotification) => {
    void markRead(n.id);
    if (n.link && n.link.startsWith('/')) {
      setOpen(false);
      navigate(n.link);
    }
  };

  const badge = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.bell}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={
          unreadCount > 0 ? `Notificações, ${unreadCount} não lida${unreadCount > 1 ? 's' : ''}` : 'Notificações'
        }
      >
        <Bell size={20} aria-hidden="true" />
        <span className={styles.label}>Notificações</span>
        {unreadCount > 0 && (
          <span className={styles.badge} aria-hidden="true">{badge}</span>
        )}
      </button>

      {open && (
        <section id={panelId} className={styles.panel} aria-label="Painel de notificações">
          <header className={styles.header}>
            <h2 className={styles.title}>Notificações</h2>
            <Button variant="ghost" onClick={() => void markAllRead()} disabled={unreadCount === 0}>
              Marcar todas como lidas
            </Button>
          </header>

          <div className={styles.body}>
            {error && (
              <div className={styles.error} role="alert">
                <span>{error}</span>
                <Button variant="secondary" onClick={() => void refresh()}>Tentar de novo</Button>
              </div>
            )}

            {!error && items.length === 0 && !loading && (
              <EmptyState
                compact
                title="Tudo em dia"
                description="Avisos de listas novas, prazos e notas lançadas aparecem aqui."
              />
            )}

            {items.length > 0 && (
              <ul className={styles.list}>
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      className={`${styles.item} ${n.read ? '' : styles.unread}`}
                      onClick={() => handleItem(n)}
                    >
                      <span className={styles.itemTitle}>
                        {!n.read && <span className="sr-only">Não lida: </span>}
                        {n.title}
                      </span>
                      <span className={styles.itemMessage}>{n.message}</span>
                      <time className={styles.itemTime} dateTime={n.createdAt}>
                        {formatRelativeTime(n.createdAt)}
                      </time>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {loading && <p className={styles.status} role="status">Carregando…</p>}
          </div>

          {hasMore && !loading && (
            <footer className={styles.footer}>
              <Button variant="secondary" onClick={() => void loadMore()}>Carregar mais</Button>
            </footer>
          )}
        </section>
      )}
    </div>
  );
};

export default NotificationBell;
