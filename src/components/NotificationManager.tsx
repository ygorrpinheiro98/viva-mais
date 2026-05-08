"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { Bell, BellOff, Settings, Check, X } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface NotificationPreferences {
  workout_reminders: boolean;
  workout_reminder_time: string;
  new_posts: boolean;
  new_comments: boolean;
  new_likes: boolean;
  challenge_updates: boolean;
  weekly_summary: boolean;
}

interface NotificationManagerProps {
  variant?: "button" | "modal" | "inline";
  className?: string;
}

export function NotificationManager({
  variant = "button",
  className = "",
}: NotificationManagerProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    workout_reminders: true,
    workout_reminder_time: "07:00",
    new_posts: true,
    new_comments: true,
    new_likes: true,
    challenge_updates: true,
    weekly_summary: true,
  });

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const res = await fetch("/api/push/preferences", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (data.preferences) {
        setPreferences({
          workout_reminders: data.preferences.workout_reminders ?? true,
          workout_reminder_time: data.preferences.workout_reminder_time ?? "07:00",
          new_posts: data.preferences.new_posts ?? true,
          new_comments: data.preferences.new_comments ?? true,
          new_likes: data.preferences.new_likes ?? true,
          challenge_updates: data.preferences.challenge_updates ?? true,
          weekly_summary: data.preferences.weekly_summary ?? true,
        });
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const subscribeToPush = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey) as BufferSource,
      });

      const subscriptionJson = subscription.toJSON();
      
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          endpoint: subscriptionJson.endpoint,
          p256dh: subscriptionJson.keys?.p256dh,
          auth: subscriptionJson.keys?.auth,
          notification_type: "all",
        }),
      });

      setIsSubscribed(true);
      setPermission("granted");
      
      await fetch("/api/push/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(preferences),
      });
    } catch (error) {
      console.error("Push subscription error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        await fetch(`/api/push/subscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
      }

      setIsSubscribed(false);
      setPermission("default");
    } catch (error) {
      console.error("Unsubscribe error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      await fetch("/api/push/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(preferences),
      });
    } catch (error) {
      console.error("Save preferences error:", error);
    }
  };

  const handleTogglePreference = async (key: keyof NotificationPreferences) => {
    if (key === "workout_reminder_time") return;
    
    const newPrefs = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(newPrefs);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await fetch("/api/push/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(newPrefs),
    });
  };

  const handleTimeChange = async (time: string) => {
    const newPrefs = { ...preferences, workout_reminder_time: time };
    setPreferences(newPrefs);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await fetch("/api/push/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(newPrefs),
    });
  };

  if (!isSupported) {
    return null;
  }

  if (variant === "button") {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={`p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${className}`}
          title={
            permission === "granted"
              ? "Notificações ativas"
              : "Ativar notificações"
          }
        >
          {permission === "granted" ? (
            <Bell className="w-5 h-5 text-green-500" />
          ) : (
            <BellOff className="w-5 h-5 text-zinc-400" />
          )}
        </button>

        {showModal && (
          <NotificationModal
            permission={permission}
            isSubscribed={isSubscribed}
            isLoading={isLoading}
            preferences={preferences}
            onSubscribe={subscribeToPush}
            onUnsubscribe={unsubscribe}
            onClose={() => setShowModal(false)}
            onTogglePreference={handleTogglePreference}
            onTimeChange={handleTimeChange}
          />
        )}
      </>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Notificações Push</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {permission === "granted"
                ? "Receba lembretes e atualizações"
                : "Ative para receber notificações"}
            </p>
          </div>
          {permission === "granted" ? (
            <button
              onClick={unsubscribe}
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              Desativar
            </button>
          ) : (
            <button
              onClick={subscribeToPush}
              disabled={isLoading || permission === "denied"}
              className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              Ativar
            </button>
          )}
        </div>

        {permission === "denied" && (
          <p className="text-sm text-amber-500">
            Notificações bloqueadas. Habilite nas configurações do navegador.
          </p>
        )}

        {permission === "granted" && (
          <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <label className="flex items-center justify-between">
              <span className="text-sm">Lembretes de treino</span>
              <input
                type="checkbox"
                checked={preferences.workout_reminders}
                onChange={() => handleTogglePreference("workout_reminders")}
                className="rounded text-green-500"
              />
            </label>
            {preferences.workout_reminders && (
              <div className="flex items-center justify-between pl-4">
                <span className="text-sm text-zinc-500">Horário</span>
                <input
                  type="time"
                  value={preferences.workout_reminder_time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="px-2 py-1 text-sm border rounded dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>
            )}
            <label className="flex items-center justify-between">
              <span className="text-sm">Novos posts</span>
              <input
                type="checkbox"
                checked={preferences.new_posts}
                onChange={() => handleTogglePreference("new_posts")}
                className="rounded text-green-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Novos comentários</span>
              <input
                type="checkbox"
                checked={preferences.new_comments}
                onChange={() => handleTogglePreference("new_comments")}
                className="rounded text-green-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Novos likes</span>
              <input
                type="checkbox"
                checked={preferences.new_likes}
                onChange={() => handleTogglePreference("new_likes")}
                className="rounded text-green-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Atualizações de desafios</span>
              <input
                type="checkbox"
                checked={preferences.challenge_updates}
                onChange={() => handleTogglePreference("challenge_updates")}
                className="rounded text-green-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Resumo semanal</span>
              <input
                type="checkbox"
                checked={preferences.weekly_summary}
                onChange={() => handleTogglePreference("weekly_summary")}
                className="rounded text-green-500"
              />
            </label>
          </div>
        )}
      </div>
    );
  }

  return null;
}

interface NotificationModalProps {
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  preferences: NotificationPreferences;
  onSubscribe: () => void;
  onUnsubscribe: () => void;
  onClose: () => void;
  onTogglePreference: (key: keyof NotificationPreferences) => void;
  onTimeChange: (time: string) => void;
}

function NotificationModal({
  permission,
  isSubscribed,
  isLoading,
  preferences,
  onSubscribe,
  onUnsubscribe,
  onClose,
  onTogglePreference,
  onTimeChange,
}: NotificationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5" />
            <h2 className="font-semibold">Notificações</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {permission === "denied" ? (
            <div className="text-center py-6">
              <BellOff className="w-12 h-12 mx-auto text-zinc-400 mb-3" />
              <p className="text-sm text-zinc-500">
                Notificações bloqueadas.
                <br />
                Habilite nas configurações do navegador.
              </p>
            </div>
          ) : permission === "granted" || isSubscribed ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">Notificações ativas</span>
                <Check className="w-5 h-5 text-green-500" />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center justify-between py-2">
                  <span className="text-sm">Lembretes de treino</span>
                  <input
                    type="checkbox"
                    checked={preferences.workout_reminders}
                    onChange={() => onTogglePreference("workout_reminders")}
                    className="rounded text-green-500"
                  />
                </label>
                {preferences.workout_reminders && (
                  <div className="flex items-center justify-between pl-4 py-2">
                    <span className="text-xs text-zinc-500">Horário do lembrete</span>
                    <input
                      type="time"
                      value={preferences.workout_reminder_time}
                      onChange={(e) => onTimeChange(e.target.value)}
                      className="px-2 py-1 text-sm border rounded dark:bg-zinc-800 dark:border-zinc-700"
                    />
                  </div>
                )}
                <label className="flex items-center justify-between py-2">
                  <span className="text-sm">Novos posts</span>
                  <input
                    type="checkbox"
                    checked={preferences.new_posts}
                    onChange={() => onTogglePreference("new_posts")}
                    className="rounded text-green-500"
                  />
                </label>
                <label className="flex items-center justify-between py-2">
                  <span className="text-sm">Comentários</span>
                  <input
                    type="checkbox"
                    checked={preferences.new_comments}
                    onChange={() => onTogglePreference("new_comments")}
                    className="rounded text-green-500"
                  />
                </label>
                <label className="flex items-center justify-between py-2">
                  <span className="text-sm">Desafios</span>
                  <input
                    type="checkbox"
                    checked={preferences.challenge_updates}
                    onChange={() => onTogglePreference("challenge_updates")}
                    className="rounded text-green-500"
                  />
                </label>
              </div>

              <button
                onClick={onUnsubscribe}
                disabled={isLoading}
                className="w-full mt-4 px-4 py-2 text-sm bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                Desativar notificações
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <Bell className="w-12 h-12 mx-auto text-zinc-400 mb-3" />
              <p className="text-sm text-zinc-500 mb-4">
                Receba lembretes de treino, atualizações da comunidade e muito mais.
              </p>
              <button
                onClick={onSubscribe}
                disabled={isLoading}
                className="w-full px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Ativando..." : "Ativar notificações"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
