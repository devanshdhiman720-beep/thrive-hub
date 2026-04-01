import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { ModuleCard } from '@/components/ModuleCard';
import { useWellnessStore } from '@/store/wellnessStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Plus, Flame, Smile, Meh, Frown, ThumbsUp, ThumbsDown, CheckCircle2, Circle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { HealthLog } from '@/store/wellnessStore';

const moodIcons: Record<HealthLog['mood'], { icon: typeof Smile; label: string }> = {
  great: { icon: ThumbsUp, label: '🤩 Great' },
  good: { icon: Smile, label: '😊 Good' },
  okay: { icon: Meh, label: '😐 Okay' },
  bad: { icon: Frown, label: '😟 Bad' },
  terrible: { icon: ThumbsDown, label: '😢 Terrible' },
};

const moodColors: Record<HealthLog['mood'], string> = {
  great: 'text-health',
  good: 'text-health',
  okay: 'text-finance',
  bad: 'text-destructive',
  terrible: 'text-destructive',
};

export default function HealthPage() {
  const { healthLogs, habits, addHealthLog, addHabit, toggleHabitToday } = useWellnessStore();
  const [exercise, setExercise] = useState('');
  const [duration, setDuration] = useState('');
  const [mood, setMood] = useState<HealthLog['mood']>('good');
  const [habitName, setHabitName] = useState('');
  const [logOpen, setLogOpen] = useState(false);
  const [habitOpen, setHabitOpen] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const handleLog = () => {
    if (!exercise || !duration) return;
    addHealthLog(exercise, parseInt(duration), mood);
    setExercise('');
    setDuration('');
    setLogOpen(false);
  };

  const handleAddHabit = () => {
    if (!habitName.trim()) return;
    addHabit(habitName.trim());
    setHabitName('');
    setHabitOpen(false);
  };

  const todayLogs = healthLogs.filter((l) => l.date === today);
  const recentLogs = healthLogs.slice(-10).reverse();

  return (
    <AppLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Health & Wellness</h1>
          <p className="mt-1 text-muted-foreground">Track exercise, mood & daily habits</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={logOpen} onOpenChange={setLogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-health text-health-foreground hover:bg-health/90"><Plus className="mr-1 h-4 w-4" /> Log Exercise</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Log Exercise & Mood</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Exercise (e.g., Running)" value={exercise} onChange={(e) => setExercise(e.target.value)} />
                <Input type="number" placeholder="Duration (minutes)" value={duration} onChange={(e) => setDuration(e.target.value)} />
                <Select value={mood} onValueChange={(v) => setMood(v as HealthLog['mood'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(moodIcons).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleLog} className="w-full bg-health text-health-foreground hover:bg-health/90">Log</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={habitOpen} onOpenChange={setHabitOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Flame className="mr-1 h-4 w-4" /> New Habit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Habit</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Habit name (e.g., Drink 8 glasses of water)" value={habitName} onChange={(e) => setHabitName(e.target.value)} />
                <Button onClick={handleAddHabit} className="w-full bg-health text-health-foreground hover:bg-health/90">Add Habit</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Habits */}
        <div>
          <h2 className="mb-4 font-display text-lg font-semibold">Daily Habits</h2>
          {habits.length > 0 ? (
            <div className="space-y-3">
              {habits.map((h) => {
                const doneToday = h.completedDates.includes(today);
                return (
                  <ModuleCard key={h.id} className="flex cursor-pointer items-center justify-between py-4" glowClass={doneToday ? 'glow-health' : ''}>
                    <button onClick={() => toggleHabitToday(h.id)} className="flex items-center gap-3">
                      {doneToday ? <CheckCircle2 className="h-5 w-5 text-health" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                      <span className={doneToday ? 'line-through text-muted-foreground' : ''}>{h.name}</span>
                    </button>
                    <div className="flex items-center gap-1 text-sm text-health">
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
          <h2 className="mb-4 font-display text-lg font-semibold">Recent Activity</h2>
          {recentLogs.length > 0 ? (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <ModuleCard key={log.id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{log.exercise}</p>
                    <p className="text-xs text-muted-foreground">{log.duration} min · {log.date}</p>
                  </div>
                  <span className={moodColors[log.mood]}>{moodIcons[log.mood].label}</span>
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
