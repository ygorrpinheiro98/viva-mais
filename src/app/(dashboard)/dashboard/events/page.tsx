"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Calendar, 
  MapPin, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Search,
  Plus,
  Trophy,
  Bike,
  Footprints,
  Waves,
  Dumbbell,
  X,
  Mountain,
  CalendarCheck
} from "lucide-react";
import Link from "next/link";

type Event = {
  id: string;
  title: string;
  description: string;
  event_type: string;
  sport_type: string;
  start_date: string;
  end_date: string | null;
  location_name: string;
  city: string;
  state: string;
  distance: number | null;
  distance_unit: string;
  price: number | null;
  max_participants: number | null;
  image_url: string | null;
  organizer_name: string;
  status: string;
  participant_count?: number;
};

const sportIcons: Record<string, React.ReactNode> = {
  running: <Footprints className="w-5 h-5" />,
  cycling: <Bike className="w-5 h-5" />,
  trail: <Mountain className="w-5 h-5" />,
  swimming: <Waves className="w-5 h-5" />,
  triathlon: <Dumbbell className="w-5 h-5" />,
  general: <Trophy className="w-5 h-5" />,
  both: <CalendarCheck className="w-5 h-5" />,
};

const sportLabels: Record<string, string> = {
  running: "Corrida",
  cycling: "Ciclismo",
  trail: "Trilha",
  swimming: "Natação",
  triathlon: "Triatlo",
  general: "Geral",
  both: "Ambos",
};

const sportColors: Record<string, string> = {
  running: "#22c55e",
  cycling: "#3b82f6",
  trail: "#f59e0b",
  swimming: "#06b6d4",
  triathlon: "#8b5cf6",
  both: "#ec4899",
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterSport, setFilterSport] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchEvents();
  }, [currentMonth, filterSport]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59).toISOString();

      let query = supabase
        .from("events")
        .select("*")
        .gte("start_date", startOfMonth)
        .lte("start_date", endOfMonth)
        .eq("status", "active")
        .order("start_date", { ascending: true });

      if (filterSport !== "all") {
        query = query.eq("sport_type", filterSport);
      }

      const { data } = await query;

      if (data && data.length > 0) {
        const eventsWithParticipants = await Promise.all(
          data.map(async (event) => {
            const { count } = await supabase
              .from("event_participants")
              .select("*", { count: "exact", head: true })
              .eq("event_id", event.id);
            return { ...event, participant_count: count || 0 };
          })
        );
        setEvents(eventsWithParticipants);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start_date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredEvents = events.filter((event) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(query) ||
        event.city?.toLowerCase().includes(query) ||
        event.location_name?.toLowerCase().includes(query)
      );
    }
    if (selectedDate) {
      const eventDate = new Date(event.start_date);
      return (
        eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()
      );
    }
    return true;
  });

  const days = getDaysInMonth(currentMonth);
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Eventos
          </h1>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Encontre corridas, passeios e eventos na sua região
          </p>
        </div>

        <Link
          href="/dashboard/events/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Criar Evento
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div
            className="rounded-xl border p-4"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold capitalize">
                {currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </h2>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium py-2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const dayEvents = getEventsForDate(day);
                const isSelected = selectedDate?.toDateString() === day.toDateString();
                const isToday = new Date().toDateString() === day.toDateString();

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(isSelected ? null : day)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative ${
                      isSelected ? "bg-primary text-white" : ""
                    } ${isToday && !isSelected ? "ring-2 ring-primary" : ""} ${
                      !isSelected ? "hover:bg-zinc-100 dark:hover:bg-zinc-800" : ""
                    }`}
                    style={{
                      color: isSelected ? "white" : "var(--foreground)",
                    }}
                  >
                    {day.getDate()}
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 absolute bottom-1">
                        {dayEvents.slice(0, 3).map((e, i) => (
                          <div
                            key={i}
                            className="w-1 h-1 rounded-full"
                            style={{ backgroundColor: isSelected ? "white" : (sportColors[e.sport_type] || "#22c55e") }}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="mt-3 text-sm text-primary hover:underline"
              >
                Limpar seleção
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-transparent"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
                showFilters ? "bg-primary text-white border-primary" : ""
              }`}
              style={{ borderColor: "var(--border)", color: showFilters ? "white" : "inherit" }}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtrar</span>
            </button>
          </div>

          {showFilters && (
            <div
              className="flex flex-wrap gap-2 p-4 rounded-lg border"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              {["all", "running", "cycling", "both"].map((sport) => (
                <button
                  key={sport}
                  onClick={() => setFilterSport(sport)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    filterSport === sport
                      ? "bg-primary text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {sport !== "all" && (
                    <span style={{ color: filterSport === sport ? "white" : sportColors[sport] }}>
                      {sportIcons[sport]}
                    </span>
                  )}
                  {sport === "all" ? "Todos" : sportLabels[sport] || sport}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
                <p className="text-sm mt-2" style={{ color: "var(--muted-foreground)" }}>
                  Carregando eventos...
                </p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-zinc-300 mb-3" />
                <p className="text-zinc-500">Nenhum evento encontrado</p>
                <p className="text-sm text-zinc-400 mt-1">
                  {selectedDate
                    ? "Nenhum evento nesta data"
                    : "Tente buscar por outro termo ou filtre por esporte"}
                </p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="rounded-xl border p-4 cursor-pointer hover:border-primary/50 transition-colors"
                  style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                >
                  <div className="flex gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ 
                        backgroundColor: sportColors[event.sport_type] + "20",
                        color: sportColors[event.sport_type]
                      }}
                    >
                      {sportIcons[event.sport_type] || <Trophy className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold truncate">{event.title}</h3>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: event.price === 0 || event.price === null
                              ? "#22c55e20"
                              : "#3b82f620",
                            color: event.price === 0 || event.price === null ? "#22c55e" : "#3b82f6"
                          }}
                        >
                          {event.price === 0 || event.price === null ? "Grátis" : `R$ ${event.price}`}
                        </span>
                      </div>
                      <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                        {sportLabels[event.sport_type]}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(event.start_date).toLocaleDateString("pt-BR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {event.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {event.city}
                          </span>
                        )}
                        {event.distance && (
                          <span className="flex items-center gap-1">
                            <Trophy className="w-3.5 h-3.5" />
                            {event.distance} {event.distance_unit}
                          </span>
                        )}
                        {event.participant_count !== undefined && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {event.participant_count}
                            {event.max_participants && `/${event.max_participants}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div
            className="rounded-xl border p-4 sticky top-20"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <h3 className="font-semibold mb-4">Próximos Eventos</h3>
            <div className="space-y-3">
              {events.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="flex gap-3 cursor-pointer hover:opacity-80 transition-opacity p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <div
                    className="text-center rounded-lg p-2 min-w-[50px]"
                    style={{
                      backgroundColor: sportColors[event.sport_type] + "20",
                      color: sportColors[event.sport_type]
                    }}
                  >
                    <div className="text-lg font-bold">
                      {new Date(event.start_date).getDate()}
                    </div>
                    <div className="text-[10px] uppercase font-medium">
                      {new Date(event.start_date).toLocaleDateString("pt-BR", { month: "short" })}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{event.title}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {event.city}
                    </p>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-center py-6">
                  <Calendar className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                  <p className="text-sm text-zinc-500">
                    Nenhum evento este mês
                  </p>
                </div>
              )}
            </div>
          </div>

          <div
            className="rounded-xl border p-4"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <h3 className="font-semibold mb-3">Por esporte</h3>
            <div className="space-y-2">
              {["running", "cycling", "both"].map((sport) => {
                const count = events.filter(e => e.sport_type === sport).length;
                return (
                  <button
                    key={sport}
                    onClick={() => setFilterSport(sport)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                      filterSport === sport
                        ? "bg-primary/10"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ color: sportColors[sport] }}>
                        {sportIcons[sport]}
                      </span>
                      <span className="text-sm">{sportLabels[sport]}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: "var(--card)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: sportColors[selectedEvent.sport_type] + "20",
                  color: sportColors[selectedEvent.sport_type]
                }}
              >
                {sportIcons[selectedEvent.sport_type] || <Trophy className="w-6 h-6" />}
              </div>
              <span
                className="text-xs px-3 py-1 rounded-full font-medium"
                style={{
                  backgroundColor: sportColors[selectedEvent.sport_type] + "20",
                  color: sportColors[selectedEvent.sport_type]
                }}
              >
                {sportLabels[selectedEvent.sport_type]}
              </span>
            </div>

            <h2 className="text-xl font-bold mb-2">{selectedEvent.title}</h2>

            {selectedEvent.description && (
              <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
                {selectedEvent.description}
              </p>
            )}

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <span>{formatDate(selectedEvent.start_date)}</span>
              </div>
              {selectedEvent.location_name && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                  <span>
                    {selectedEvent.location_name}
                    {selectedEvent.city && ` - ${selectedEvent.city}, ${selectedEvent.state}`}
                  </span>
                </div>
              )}
              {selectedEvent.distance && (
                <div className="flex items-center gap-3 text-sm">
                  <Trophy className="w-4 h-4 text-zinc-400" />
                  <span>{selectedEvent.distance} {selectedEvent.distance_unit}</span>
                </div>
              )}
              {selectedEvent.participant_count !== undefined && (
                <div className="flex items-center gap-3 text-sm">
                  <Users className="w-4 h-4 text-zinc-400" />
                  <span>
                    {selectedEvent.participant_count} participantes
                    {selectedEvent.max_participants && ` de ${selectedEvent.max_participants}`}
                  </span>
                </div>
              )}
              {selectedEvent.organizer_name && (
                <div className="flex items-center gap-3 text-sm">
                  <Users className="w-4 h-4 text-zinc-400" />
                  <span>Organizado por {selectedEvent.organizer_name}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button className="flex-1 py-3 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity">
                Inscrever-se
              </button>
              <button className="px-4 py-3 rounded-lg border font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                Compartilhar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
