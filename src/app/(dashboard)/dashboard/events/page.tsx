"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Event = {
  id: string;
  title: string;
  description: string;
  event_type: string;
  sport: string;
  city: string;
  state: string;
  event_date: string;
  distance_km: number;
  url: string;
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "running" | "cycling">("all");
  const supabase = createClient();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("event_date");

    if (data) setEvents(data);
    setLoading(false);
  };

  const filteredEvents = events.filter(e => {
    if (filter === "all") return true;
    return e.sport === filter || e.sport === "both";
  });

  const getDaysUntil = (date: string) => {
    const eventDate = new Date(date);
    const now = new Date();
    const days = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">📅 Eventos</h1>
        <p className="text-muted-foreground">Corridas, pedaladas e eventos de endurance</p>
      </div>

      <div className="flex gap-2 mb-8">
        {[
          { id: "all", label: "🌐 Todos" },
          { id: "running", label: "🏃 Corrida" },
          { id: "cycling", label: "🚴 Ciclismo" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              filter === f.id ? "bg-primary text-white" : "bg-muted hover:bg-muted/70"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredEvents.map((event) => {
          const daysUntil = getDaysUntil(event.event_date);
          const isPast = daysUntil < 0;

          return (
            <div key={event.id} className={`p-6 rounded-2xl glass-effect ${isPast ? "opacity-60" : ""}`}>
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center ${
                  event.sport === "running" ? "bg-primary/20" : "bg-secondary/20"
                }`}>
                  <span className="text-2xl">
                    {event.sport === "running" ? "🏃" : event.sport === "cycling" ? "🚴" : "⚡"}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        📍 {event.city}, {event.state}
                      </p>
                    </div>
                    <div className="text-right">
                      {daysUntil > 0 ? (
                        <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                          Em {daysUntil} dias
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                          Evento passado
                        </div>
                      )}
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-muted-foreground mt-2">{event.description}</p>
                  )}

                  <div className="flex items-center gap-4 mt-4 text-sm">
                    <span>📆 {new Date(event.event_date).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}</span>
                    {event.distance_km && (
                      <span>📏 {event.distance_km} km</span>
                    )}
                    <span className="px-2 py-1 rounded bg-muted capitalize">{event.event_type}</span>
                  </div>
                </div>
              </div>

              {!isPast && (
                <div className="mt-4 pt-4 border-t border-border flex justify-end">
                  {event.url ? (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-medium hover:opacity-90"
                    >
                      Inscrever-se →
                    </a>
                  ) : (
                    <button className="px-6 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-medium hover:opacity-90">
                      Quero participar!
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12 glass-effect rounded-2xl">
          <p className="text-muted-foreground text-lg">Nenhum evento encontrado</p>
          <p className="text-muted-foreground">Novos eventos em breve!</p>
        </div>
      )}
    </div>
  );
}
