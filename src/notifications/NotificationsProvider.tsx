import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { notificationService } from './notificationService';
import { AppNotification } from './types';

const PAGE_SIZE = 10;
const POLL_MS = 60_000;

interface NotificationsContextValue {
  items: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  /** Atualiza só o contador de não lidas */
  refreshCount: () => Promise<void>;
  /** Carrega a primeira página (substitui a lista) */
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

const byNewest = (a: AppNotification, b: AppNotification) => b.createdAt.localeCompare(a.createdAt);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(-1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const fetchCount = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    try {
      setUnreadCount(await notificationService.unreadCount());
    } catch {
      // contador é "melhor esforço"; o painel mostra o erro quando aberto
    }
  }, []);

  const loadPage = useCallback(async (target: number) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const res = await notificationService.list(target, PAGE_SIZE);
      setItems((prev) => {
        const base = target === 0 ? [] : prev;
        const seen = new Set(base.map((n) => n.id));
        return [...base, ...res.items.filter((n) => !seen.has(n.id))].sort(byNewest);
      });
      setPage(res.page);
      setTotalPages(res.totalPages);
    } catch {
      setError('Não foi possível carregar as notificações.');
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([loadPage(0), fetchCount()]);
  }, [loadPage, fetchCount]);

  const loadMore = useCallback(() => loadPage(page + 1), [loadPage, page]);

  const markRead = useCallback(
    async (id: string) => {
      const target = items.find((n) => n.id === id);
      if (!target || target.read) return;
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await notificationService.markRead(id);
      } catch {
        // desfaz a atualização otimista
        setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
        void fetchCount();
      }
    },
    [items, fetchCount]
  );

  const markAllRead = useCallback(async () => {
    const snapshot = items;
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await notificationService.markAllRead();
    } catch {
      setItems(snapshot);
      void fetchCount();
    }
  }, [items, fetchCount]);

  // Contador no carregamento e a cada minuto (enquanto a aba está visível)
  useEffect(() => {
    void fetchCount();
    const t = window.setInterval(() => {
      if (document.visibilityState === 'visible') void fetchCount();
    }, POLL_MS);
    return () => window.clearInterval(t);
  }, [fetchCount]);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      items,
      unreadCount,
      loading,
      error,
      hasMore: page + 1 < totalPages,
      refreshCount: fetchCount,
      refresh,
      loadMore,
      markRead,
      markAllRead,
    }),
    [items, unreadCount, loading, error, page, totalPages, fetchCount, refresh, loadMore, markRead, markAllRead]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
