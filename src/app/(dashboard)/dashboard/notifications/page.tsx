"use client";

import { NotificationManager } from "@/components/NotificationManager";
import { Smartphone, Bell, MessageSquare, Trophy, BarChart3 } from "lucide-react";

export default function NotificationsSettingsPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
          Configurações de Notificações
        </h1>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Gerencie como e quando você recebe notificações do VIVA+
        </p>
      </div>

      <div className="rounded-xl border p-6 mb-6" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-green-500/10">
            <Smartphone className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h2 className="font-semibold">Notificações Push</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Receba alertas mesmo quando o app não está aberto
            </p>
          </div>
        </div>

        <NotificationManager variant="inline" />
      </div>

      <div className="rounded-xl border p-6" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <h3 className="font-semibold mb-4">Tipos de Notificação</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Bell className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Lembretes de Treino</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Receba um lembrete diário no horário que preferir para não perder nenhum treino.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <MessageSquare className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Interações no Feed</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Seja notificado sobre novos comentários e likes nas suas publicações.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Desafios</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Acompanhe o progresso nos desafios e Receba badges de conquista.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <BarChart3 className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Resumo Semanal</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Receba um resumo das suas atividades e evolução da semana.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
