import { useState, useCallback, useEffect } from "react";
import { UserInfo, Notification, TopBarViewModel } from "../model/TopBar.types";

export const useTopBarViewModel = (
    initialUserInfo?: UserInfo,
    initialNotifications?: Notification[],
    onNotificationClick?: (notification: Notification) => void,
    onSupportClick?: () => void,
    onLogoutClick?: () => void
): TopBarViewModel => {
    const [userInfo, setUserInfo] = useState<UserInfo>(
        initialUserInfo || { name: "Usuário" }
    );

    const [notifications, setNotifications] = useState<Notification[]>(
        initialNotifications || [
            {
                id: "1",
                title: "Bem-vindo!",
                message: "Aproveite sua experiência na plataforma",
                read: false,
                timestamp: new Date(),
            },
        ]
    );

    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const unreadCount = notifications.filter((n) => !n.read).length;

    useEffect(() => {
        const role = localStorage.getItem("role");
        const userId = localStorage.getItem("userId");

        if (!role || !userId) {
            console.warn("Nenhum usuário logado no localStorage");
            return;
        }

        const endpoint =
            role === "ESTUDANTE"
                ? `http://localhost:8080/estudantes/${userId}`
                : role === "PROFESSOR"
                    ? `http://localhost:8080/professores/${userId}`
                    : null;

        if (!endpoint) return;

        fetch(endpoint)
            .then((res) => {
                if (!res.ok) throw new Error("Falha ao buscar dados do usuário");
                return res.json();
            })
            .then((data) => {
                setUserInfo({
                    name: data.nome || "Usuário",
                });
            })
            .catch((err) => {
                console.error("Erro ao carregar informações do usuário:", err);
            });
    }, []);

    // Funções internas da topbar
    const handleNotificationClick = useCallback(
        (notification: Notification) => {
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notification.id ? { ...n, read: true } : n
                )
            );
            onNotificationClick?.(notification);
        },
        [onNotificationClick]
    );

    const handleSupportClick = useCallback(() => {
        onSupportClick?.();
    }, [onSupportClick]);

    const handleLogoutClick = useCallback(() => {
        localStorage.clear(); // remove sessão
        onLogoutClick?.();
    }, [onLogoutClick]);

    const toggleNotifications = useCallback(() => {
        setIsNotificationsOpen((prev) => !prev);
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, read: true }))
        );
    }, []);

    return {
        userInfo,
        notifications,
        unreadCount,
        isNotificationsOpen,
        handleNotificationClick,
        handleSupportClick,
        handleLogoutClick,
        toggleNotifications,
        markAllAsRead,
    };
};
