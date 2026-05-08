"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import WorkoutCalendar from "@/components/WorkoutCalendar";
import {
  TrendingUp,
  Flame,
  MapPin,
  Zap,
  Target,
  ChevronRight,
  Bike,
  Dumbbell,
  Activity,
  Heart,
  Gauge,
  Users,
  ChevronUp,
  ChevronDown,
  Zap as Lightning,
} from "lucide-react";

type Activity = {
  id: string;
  name: string;
  activity_type: string;
  distance_meters: number;
  moving_time_seconds: number;
  start_date: string;
  calories: number | null;
  average_heartrate?: number;
  total_elevation_gain?: number;
};

function Sparkline({ data, color }: { data: number[], color: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const height = 24;
  const width = 60;
  const barWidth = Math.max(4, (width - data.length * 2) / data.length);

  return (
    <svg width={width} height={height} className="inline-block">
      {data.map((value, i) => {
        const barHeight = Math.max(4, ((value - min) / range) * (height - 4));
        const isLast = i === data.length - 1;
        return (
          <rect
            key={i}
            x={i * (barWidth + 2)}
            y={height - barHeight}
            width={barWidth}
            height={barHeight}
            rx={2}
            fill={isLast ? color : `${color}60`}
          />
        );
      })}
    </svg>
  );
}

function KPICard({
  title,
  value,
  unit,
  trend,
  trendValue,
  sparkData,
  colorClass,
  icon: Icon,
  iconBg,
}: {
  title: string;
  value: string | number;
  unit: string;
  trend: "up" | "down" | "neutral";
  trendValue: string;
  sparkData: number[];
  colorClass: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
}) {
  const colors: Record<string, string> = {
    "text-[var(--primary)]": "#F97316",
    "text-[var(--secondary)]": "#22C55E",
    "text-[var(--info)]": "#3B82F6",
    "text-[var(--danger)]": "#EF4444",
  };
  const color = colors[colorClass] || "#F97316";

  return (
    <div className="kpi-card group">
      <div className="kpi-header">
        <div className="kpi-icon" style={{ backgroundColor: `${color}15` }}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
        <div className={`kpi-trend ${trend}`}>
          {trend === "up" && <ChevronUp className="w-4 h-4" />}
          {trend === "down" && <ChevronDown className="w-4 h-4" />}
          <span>{trendValue}</span>
        </div>
      </div>
      <div className="kpi-value">
        {value}
        {unit && <span className="text-lg font-normal ml-1 opacity-60">{unit}</span>}
      </div>
      <div className="kpi-label">{title}</div>
      <div className="mt-3">
        <Sparkline data={sparkData} color={color} />
      </div>
    </div>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  const [expanded, setExpanded] = useState(false);
  
  const isTodayCheck = (startDate: string) => {
    const today = new Date().toDateString();
    const activityDate = new Date(startDate).toDateString();
    return today === activityDate;
  };

  const formatDistance = (meters: number) => (Number(meters) / 1000).toFixed(2);
  const formatTime = (seconds: number) => {
    const h = Math.floor(Number(seconds) / 3600);
    const m = Math.floor((Number(seconds) % 3600) / 60);
    const s = Number(seconds) % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const calculatePace = () => {
    if (!activity.distance_meters) return "--:--";
    const paceSecs = Number(activity.moving_time_seconds) / (Number(activity.distance_meters) / 1000);
    const mins = Math.floor(paceSecs / 60);
    const secs = Math.round(paceSecs % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateCalories = () => {
    if (activity.calories && activity.calories > 0) return activity.calories;
    const distanceKm = Number(activity.distance_meters) / 1000;
    if (activity.activity_type === "Run" || activity.activity_type === "run") return Math.round(distanceKm * 60);
    if (activity.activity_type === "Ride" || activity.activity_type === "ride" || activity.activity_type === "VirtualRide") return Math.round(distanceKm * 30);
    return Math.round(distanceKm * 50);
  };

  const getActivityIcon = () => {
    if (activity.activity_type === "Run" || activity.activity_type === "run") return <Dumbbell className="w-5 h-5" />;
    if (activity.activity_type === "Ride" || activity.activity_type === "ride" || activity.activity_type === "VirtualRide") return <Bike className="w-5 h-5" />;
    if (activity.activity_type === "Swim" || activity.activity_type === "swim") return <Activity className="w-5 h-5" />;
    return <Lightning className="w-5 h-5" />;
  };

  const getActivityColor = () => {
    if (activity.activity_type === "Run" || activity.activity_type === "run") return { bg: "bg-[#EF4444]/10", text: "text-[#EF4444]", border: "#EF4444" };
    if (activity.activity_type === "Ride" || activity.activity_type === "ride" || activity.activity_type === "VirtualRide") return { bg: "bg-[#F97316]/10", text: "text-[#F97316]", border: "#F97316" };
    if (activity.activity_type === "Swim" || activity.activity_type === "swim") return { bg: "bg-[#3B82F6]/10", text: "text-[#3B82F6]", border: "#3B82F6" };
    return { bg: "bg-[#22C55E]/10", text: "text-[#22C55E]", border: "#22C55E" };
  };

  const color = getActivityColor();
  const tss = Math.round(calculateCalories() / 10);

  return (
    <div
      className={`activity-card ${expanded ? "expanded" : ""}`}
      style={{ borderColor: expanded ? color.border : "var(--border)" }}
    >
      <div
        className="flex items-center gap-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.bg} ${color.text}`}>
          {getActivityIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">
              {activity.name}
            </span>
            {isTodayCheck(activity.start_date) && (
              <span className="badge badge-success text-[10px]">HOJE</span>
            )}
          </div>
          <div className="text-sm flex items-center gap-3" style={{ color: "var(--muted-foreground)" }}>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {new Date(activity.start_date).toLocaleDateString("pt-BR", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </span>
            <span>•</span>
            <span className="capitalize">{activity.activity_type === "VirtualRide" ? "Ciclismo Virtual" : activity.activity_type}</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <div className="font-bold text-[#22C55E]">{formatDistance(activity.distance_meters)} km</div>
          </div>
          <div className="text-right hidden md:block">
            <div className="font-bold text-[#3B82F6]">{calculatePace()} /km</div>
          </div>
          <div className="text-right hidden lg:block">
            <div className="font-semibold">{formatTime(activity.moving_time_seconds)}</div>
          </div>
          <ChevronRight className={`w-5 h-5 transition-transform ${expanded ? "rotate-90" : ""}`} style={{ color: "var(--muted-foreground)" }} />
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="p-3 rounded-lg" style={{ background: "var(--muted)" }}>
              <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Distância</div>
              <div className="font-bold text-[#22C55E]">{formatDistance(activity.distance_meters)} km</div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: "var(--muted)" }}>
              <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Ritmo</div>
              <div className="font-bold text-[#3B82F6]">{calculatePace()} /km</div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: "var(--muted)" }}>
              <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Tempo</div>
              <div className="font-bold">{formatTime(activity.moving_time_seconds)}</div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: "var(--muted)" }}>
              <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Intensidade</div>
              <div className="font-bold text-[#F97316]">{tss} TSS</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {activity.average_heartrate && (
              <div className="p-3 rounded-lg flex items-center gap-3 flex-1 min-w-[150px]" style={{ background: "var(--muted)" }}>
                <Heart className="w-5 h-5 text-[#EF4444]" />
                <div>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>FC Média</div>
                  <div className="font-bold">{activity.average_heartrate} bpm</div>
                </div>
              </div>
            )}
            <div className="p-3 rounded-lg flex items-center gap-3 flex-1 min-w-[150px]" style={{ background: "var(--muted)" }}>
              <Gauge className="w-5 h-5 text-[#F97316]" />
              <div>
                <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>TSS</div>
                <div className="font-bold">{tss}</div>
              </div>
            </div>
            {activity.total_elevation_gain && (
              <div className="p-3 rounded-lg flex items-center gap-3 flex-1 min-w-[150px]" style={{ background: "var(--muted)" }}>
                <TrendingUp className="w-5 h-5 text-[#A855F7]" />
                <div>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Elevação</div>
                  <div className="font-bold">{activity.total_elevation_gain} m</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PMCChart() {
  const days = 14;
  const fitnessData = Array.from({ length: days }, (_, i) => 50 + Math.sin(i * 0.5) * 10 + Math.sin(i * 1.2) * 2.5);
  const fatigueData = Array.from({ length: days }, (_, i) => 40 + Math.cos(i * 0.3) * 15 + Math.cos(i * 0.8) * 4);
  const formData = fitnessData.map((f, i) => f - fatigueData[i]);

  const maxVal = Math.max(...fitnessData, ...fatigueData, ...formData.map(Math.abs), 1);
  const height = 80;
  const width = 280;
  const scale = (val: number) => (val / maxVal) * (height / 2);

  return (
    <div className="card-elevated p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm font-semibold">
          FITNESS / FADIGA / FORMA
        </h3>
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>PMC</span>
      </div>
      <svg width="100%" height={height + 20} viewBox={`0 0 ${width} ${height + 20}`} preserveAspectRatio="none">
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="var(--border)" strokeWidth="1" />
        
        <path
          d={`M ${fitnessData.map((v, i) => `${(i / (days - 1)) * width},${height / 2 - scale(v)}`).join(" L ")}`}
          fill="none"
          stroke="#F97316"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d={`M ${fatigueData.map((v, i) => `${(i / (days - 1)) * width},${height / 2 - scale(v)}`).join(" L ")}`}
          fill="none"
          stroke="#EF4444"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d={`M ${formData.map((v, i) => `${(i / (days - 1)) * width},${height / 2 - scale(Math.max(v, 0))}`).join(" L ")}`}
          fill="none"
          stroke="#22C55E"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <div className="flex justify-center gap-6 mt-2">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-0.5 rounded" style={{ backgroundColor: "#F97316" }} />
          <span style={{ color: "var(--muted-foreground)" }}>Fitness</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-0.5 rounded" style={{ backgroundColor: "#EF4444" }} />
          <span style={{ color: "var(--muted-foreground)" }}>Fadiga</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-0.5 rounded" style={{ backgroundColor: "#22C55E" }} />
          <span style={{ color: "var(--muted-foreground)" }}>Forma</span>
        </div>
      </div>
    </div>
  );
}

function SystemSuggestion({ form }: { form: number }) {
  let suggestion = { type: "success", text: "Manter carga atual", icon: Target };
  let bgClass = "badge-success";
  if (form > 15) {
    suggestion = { type: "warning", text: "Considerar aumento de carga", icon: TrendingUp };
    bgClass = "badge-warning";
  } else if (form < -15) {
    suggestion = { type: "info", text: "Recomendado descanso ativo", icon: Activity };
    bgClass = "badge-info";
  }

  const Icon = suggestion.icon;

  return (
    <div className={`card p-4 flex items-center gap-3`}>
      <Icon className={`w-5 h-5 ${bgClass.replace("badge-", "text-")}`} />
      <div>
        <div className="text-xs font-semibold uppercase" style={{ color: "var(--muted-foreground)" }}>Sugestão</div>
        <div className="text-sm font-medium">{suggestion.text}</div>
      </div>
    </div>
  );
}

function WeeklyLeaderboard({ currentUserId }: { currentUserId: string | undefined }) {
  const mockLeaderboard = [
    { id: "1", name: "Marcos Silva", tss: 850, avatar: "M" },
    { id: currentUserId || "2", name: "Você", tss: 720, isCurrent: true },
    { id: "3", name: "Ana Costa", tss: 680, avatar: "A" },
    { id: "4", name: "Pedro Santos", tss: 590, avatar: "P" },
    { id: "5", name: "Julia Lima", tss: 520, avatar: "J" },
  ];

  return (
    <div className="space-y-2">
      {mockLeaderboard.map((user, index) => (
        <div
          key={user.id}
          className={`card p-2 flex items-center gap-3 ${user.isCurrent ? "card-accent" : ""}`}
        >
          <div className="w-6 text-center font-bold text-sm" style={{ color: index < 3 ? "var(--primary)" : "var(--muted-foreground)" }}>
            {index + 1}°
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ backgroundColor: user.isCurrent ? "var(--primary)" : "var(--muted)" }}
          >
            {user.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {user.name}
            </div>
          </div>
          <div className="font-bold text-[#F97316] text-sm">
            {user.tss}
          </div>
        </div>
      ))}
    </div>
  );
}

function WorkoutCalendarComponent({ userId }: { userId?: string }) {
  if (!userId) return null;
  return <WorkoutCalendar userId={userId} />;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ id: string; full_name: string | null; avatar_url: string | null } | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const supabase = createClient();

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      const { data: activitiesData } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", user.id)
        .order("start_date", { ascending: false })
        .limit(50);
      setActivities(activitiesData || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateCalories = (activity: Activity) => {
    if (activity.calories && activity.calories > 0) return activity.calories;
    const distanceKm = Number(activity.distance_meters) / 1000;
    if (activity.activity_type === "Run" || activity.activity_type === "run") return Math.round(distanceKm * 60);
    if (activity.activity_type === "Ride" || activity.activity_type === "ride" || activity.activity_type === "VirtualRide") return Math.round(distanceKm * 30);
    return Math.round(distanceKm * 50);
  };

  const getWeeklyStats = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(now.getDate() - daysToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const weekActivities = activities.filter(a => {
      const activityDate = new Date(a.start_date);
      return activityDate >= startOfWeek;
    });

    const weekDistance = weekActivities.reduce((acc, a) => acc + Number(a.distance_meters || 0), 0);
    const weekTime = weekActivities.reduce((acc, a) => acc + Number(a.moving_time_seconds || 0), 0);
    const weekCalories = weekActivities.reduce((acc, a) => acc + calculateCalories(a), 0);
    const weekTSS = weekActivities.reduce((acc, a) => acc + Math.round(calculateCalories(a) / 10), 0);

    const dailyDistance = Array(7).fill(0);
    weekActivities.forEach(a => {
      const activityDate = new Date(a.start_date);
      const dayIndex = activityDate.getDay() === 0 ? 6 : activityDate.getDay() - 1;
      dailyDistance[dayIndex] += Number(a.distance_meters || 0) / 1000;
    });

    const dailyTSS = Array(7).fill(0);
    weekActivities.forEach(a => {
      const activityDate = new Date(a.start_date);
      const dayIndex = activityDate.getDay() === 0 ? 6 : activityDate.getDay() - 1;
      dailyTSS[dayIndex] += Math.round(calculateCalories(a) / 10);
    });

    const dailyCalories = Array(7).fill(0);
    weekActivities.forEach(a => {
      const activityDate = new Date(a.start_date);
      const dayIndex = activityDate.getDay() === 0 ? 6 : activityDate.getDay() - 1;
      dailyCalories[dayIndex] += calculateCalories(a);
    });

    return {
      count: weekActivities.length,
      distance: weekDistance,
      time: weekTime,
      calories: weekCalories,
      tss: weekTSS,
      dailyDistance,
      dailyTSS,
      dailyCalories
    };
  };

  const weeklyStats = getWeeklyStats();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getWeeklyProgress = () => {
    const goal = 150;
    return Math.min((weeklyStats.tss / goal) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--primary)" }}>
            <Activity className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
            Carregando dados...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <header className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs mb-1">
            <span className="badge badge-primary">KINETIC LAB</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-display">
            {getGreeting()}, <span className="text-gradient">{profile?.full_name?.split(" ")[0] || "Atleta"}</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Pronto para mais uma sessão?
          </p>
        </div>

        <div className="card p-4 min-w-[280px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>PROGRESSO SEMANAL</span>
            <span className="text-sm font-bold text-[#22C55E]">{weeklyStats.tss} / 150 TSS</span>
          </div>
          <div className="progress">
            <div
              className="progress-bar progress-bar-success"
              style={{ width: `${getWeeklyProgress()}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
            <span>{weeklyStats.count} atividades</span>
            <span>{getWeeklyProgress().toFixed(0)}%</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Carga de Treino (TSS)"
          value={weeklyStats.tss}
          unit="TSS"
          trend="up"
          trendValue="+12%"
          sparkData={weeklyStats.dailyTSS}
          colorClass="text-[var(--primary)]"
          icon={Gauge}
          iconBg="bg-[var(--primary)]/10"
        />
        <KPICard
          title="Atividades"
          value={weeklyStats.count}
          unit=""
          trend={weeklyStats.count > 3 ? "up" : "neutral"}
          trendValue={weeklyStats.count > 3 ? "+2" : "0"}
          sparkData={[1, 2, 1, 3, 2, 1, weeklyStats.count]}
          colorClass="text-[var(--secondary)]"
          icon={Target}
          iconBg="bg-[var(--secondary)]/10"
        />
        <KPICard
          title="Distância"
          value={weeklyStats.distance.toFixed(1)}
          unit="km"
          trend="up"
          trendValue="+8%"
          sparkData={weeklyStats.dailyDistance.map(v => v * 10)}
          colorClass="text-[var(--info)]"
          icon={MapPin}
          iconBg="bg-[var(--info)]/10"
        />
        <KPICard
          title="Calorias Queimadas"
          value={Math.round(weeklyStats.calories).toLocaleString()}
          unit="kcal"
          trend="up"
          trendValue="+15%"
          sparkData={weeklyStats.dailyCalories.map(v => v / 100)}
          colorClass="text-[var(--danger)]"
          icon={Flame}
          iconBg="bg-[var(--danger)]/10"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#F97316]" />
              <span>ATIVIDADES RECENTES</span>
            </h2>
            <Link href="/dashboard/strava" className="text-sm btn btn-ghost">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.slice(0, 5).map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="card text-center py-16">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--primary-glow)" }}>
                <Bike className="w-10 h-10 text-[#F97316]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Comece sua jornada
              </h3>
              <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
                Conecte ao Strava para sincronizar suas atividades
              </p>
              <Link href="/dashboard/strava" className="btn btn-primary">
                Conectar ao Strava <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <PMCChart />
          <SystemSuggestion form={-5} />
          
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-semibold">RANKING SEMANAL</h3>
              <Users className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
            </div>
            <WeeklyLeaderboard currentUserId={profile?.id} />
          </div>

          <WorkoutCalendarComponent userId={profile?.id} />
        </div>
      </div>
    </div>
  );
}
