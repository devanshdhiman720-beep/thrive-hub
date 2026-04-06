import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { ModuleCard } from '@/components/ModuleCard';
import { useWellnessStore } from '@/store/wellnessStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Plus, Flame, CheckCircle2, Circle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { HealthLog } from '@/store/wellnessStore';

const moodEmojis: { value: HealthLog['mood']; emoji: string; label: string }[] = [
  { value: 'terrible', emoji: '😢', label: 'Terrible' },
  { value: 'bad', emoji: '😟', label: 'Bad' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'good', emoji: '😊', label: 'Good' },
  { value: 'great', emoji: '🤩', label: 'Great' },
];

const moodScores: Record<HealthLog['mood'], number> = {
  terrible: 2, bad: 4, okay: 6, good: 8, great: 10,
};

const moodBarColors: Record<number, string> = {
  2: 'hsl(0,72%,55%)', 4: 'hsl(30,80%,55%)', 6: 'hsl(38,92%,55%)', 8: 'hsl(152,70%,48%)', 10: 'hsl(170,100%,42%)',
};

export default function HealthPage() {
  const { healthLogs, habits, addHealthLog, addHabit, toggleHabitToday } = useWellnessStore();
  const [exercise, setExercise] = useState('');
  const [duration, setDuration] = useState('');
  const [mood, setMood] = useState<HealthLog['mood']>('good');
  const [habitName, setHabitName] = useState('');
  const [logOpen, setLogOpen] = useState(false);
  const [habitOpen, setHabitOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState<HealthLog['mood'] | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const handleLog = () => {
    if (!exercise || !duration) return;
    addHealthLog(exercise, parseInt(duration), selectedMood || mood);
    setExercise('');
    setDuration('');
    setSelectedMood(null);
    setLogOpen(false);
  };

  const handleAddHabit = () => {
    if (!habitName.trim()) return;
    addHabit(habitName.trim());
    setHabitName('');
    setHabitOpen(false);
  };

  // Weekly mood data
  const weekMood = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLogs = healthLogs.filter((l) => l.date === dateStr);
    const avgScore = dayLogs.length
      ? Math.round(dayLogs.reduce((s, l) => s + moodScores[l.mood], 0) / dayLogs.length)
      : 0;
    const dayEmoji = dayLogs.length ? moodEmojis.find(m => moodScores[m.value] === avgScore)?.emoji || '😐' : '';
    return {
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      score: avgScore,
      emoji: dayEmoji,
      fill: avgScore > 0 ? (moodBarColors[avgScore] || 'hsl(170,100%,42%)') : 'hsl(220,25%,15%)',
    };
  });

  const todayLogs = healthLogs.filter((l) => l.date === today);
  const recentLogs = healthLogs.slice(-10).reverse();

  const tooltipStyle = {
    background: 'hsl(220,35%,8%)',
    border: '1px solid hsl(170,60%,20%)',
    borderRadius: 8,
    color: 'hsl(180,20%,90%)',
  };

  return (
    <AppLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">🧘 Mood & Health Tracker</h1>
          <p className="mt-1 text-muted-foreground">Emotional awareness = Karmic clarity</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={logOpen} onOpenChange={setLogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="mr-1 h-4 w-4" /> Log Activity</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Log Exercise & Mood</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Exercise (e.g., Running)" value={exercise} onChange={(e) => setExercise(e.target.value)} />
                <Input type="number" placeholder="Duration (minutes)" value={duration} onChange={(e) => setDuration(e.target.value)} />
                <Select value={mood} onValueChange={(v) => setMood(v as HealthLog['mood'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {moodEmojis.map(({ value, emoji, label }) => (
                      <SelectItem key={value} value={value}>{emoji} {label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleLog} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">🧘 Log Mood (+15 Karma)</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={habitOpen} onOpenChange={setHabitOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10"><Flame className="mr-1 h-4 w-4" /> New Habit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Habit</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Habit name" value={habitName} onChange={(e) => setHabitName(e.target.value)} />
                <Button onClick={handleAddHabit} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Add Habit</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Mood Selector */}
      <ModuleCard className="mb-8">
        <p className="section-title mb-4 text-center">How are you feeling right now?</p>
        <div className="flex justify-center gap-4">
          {moodEmojis.map(({ value, emoji }) => (
            <button
              key={value}
              onClick={() => setSelectedMood(value)}
              className={`flex h-14 w-14 items-center justify-center rounded-xl text-2xl transition-all
                ${selectedMood === value ? 'bg-primary/20 border-2 border-primary scale-110' : 'bg-secondary/50 border border-primary/10 hover:bg-primary/10'}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </ModuleCard>

      {/* Mood Chart */}
      <ModuleCard className="mb-8">
        <p className="section-title mb-4">Weekly Mood Journey</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weekMood}>
            <XAxis
              dataKey="day"
              stroke="hsl(200,15%,40%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={({ x, y, payload }) => (
                <g transform={`translate(${x},${y})`}>
                  <text x={0} y={0} dy={14} textAnchor="middle" fill="hsl(200,15%,50%)" fontSize={11}>
                    {payload.value}
                  </text>
                </g>
              )}
            />
            <YAxis stroke="hsl(200,15%,40%)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="score" radius={[6, 6, 0, 0]}>
              {weekMood.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ModuleCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Habits */}
        <div>
          <p className="section-title mb-4">Daily Habits</p>
          {habits.length > 0 ? (
            <div className="space-y-3">
              {habits.map((h) => {
                const doneToday = h.completedDates.includes(today);
                return (
                  <ModuleCard key={h.id} className="flex cursor-pointer items-center justify-between !py-4" glowClass={doneToday ? 'glow-health' : ''}>
                    <button onClick={() => toggleHabitToday(h.id)} className="flex items-center gap-3">
                      {doneToday ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                      <span className={doneToday ? 'line-through text-muted-foreground' : ''}>{h.name}</span>
                    </button>
                    <div className="flex items-center gap-1 text-sm text-primary">
                      <Flame className="h-4 w-4" />
                      <span className="font-display font-bold">{h.streak}</span>
                    </div>
                  </ModuleCard>
                );
              })}
            </div>
          ) : (
            <ModuleCard className="text-center text-muted-foreground py-12">
              <Flame className="mx-auto h-8 w-8 opacity-30" />
              <p className="mt-2">No habits yet. Start building streaks!</p>
            </ModuleCard>
          )}
        </div>

        {/* Recent Logs */}
        <div>
          <p className="section-title mb-4">Recent Activity</p>
          {recentLogs.length > 0 ? (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <ModuleCard key={log.id} className="flex items-center justify-between !py-4">
                  <div>
                    <p className="font-medium">{log.exercise}</p>
                    <p className="text-xs text-muted-foreground">{log.duration} min · {log.date}</p>
                  </div>
                  <span className="text-lg">{moodEmojis.find(m => m.value === log.mood)?.emoji}</span>
                </ModuleCard>
              ))}
            </div>
          ) : (
            <ModuleCard className="text-center text-muted-foreground py-12">
              <Heart className="mx-auto h-8 w-8 opacity-30" />
              <p className="mt-2">No activity logged yet</p>
            </ModuleCard>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
