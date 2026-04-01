import { AppLayout } from '@/components/AppLayout';
import { StatCard } from '@/components/ModuleCard';
import { useWellnessStore } from '@/store/wellnessStore';
import { GraduationCap, Heart, Wallet, Sparkles, Clock, Target, TrendingUp, Flame } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CHART_COLORS = ['hsl(210,90%,56%)', 'hsl(152,70%,48%)', 'hsl(38,92%,55%)', 'hsl(290,80%,60%)', 'hsl(262,80%,60%)'];

export default function Dashboard() {
  const { subjects, studySessions, assignments, healthLogs, habits, expenses } = useWellnessStore();

  const totalStudyMinutes = studySessions.reduce((sum, s) => sum + s.duration, 0);
  const completedAssignments = assignments.filter((a) => a.status === 'completed').length;
  const todayLogs = healthLogs.filter((l) => l.date === new Date().toISOString().split('T')[0]);
  const totalExpenses = expenses.filter((e) => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = expenses.filter((e) => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);

  const avgProgress = subjects.length
    ? Math.round(
        subjects.reduce((sum, s) => {
          const done = s.syllabusTopics.filter((t) => t.completed).length;
          return sum + (s.syllabusTopics.length ? (done / s.syllabusTopics.length) * 100 : 0);
        }, 0) / subjects.length
      )
    : 0;

  // Study data for last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const mins = studySessions.filter((s) => s.date === dateStr).reduce((sum, s) => sum + s.duration, 0);
    return { day: d.toLocaleDateString('en', { weekday: 'short' }), minutes: mins };
  });

  // Expense categories
  const catData = ['food', 'travel', 'study', 'entertainment', 'health', 'other']
    .map((cat) => ({
      name: cat,
      value: expenses.filter((e) => e.type === 'expense' && e.category === cat).reduce((sum, e) => sum + e.amount, 0),
    }))
    .filter((c) => c.value > 0);

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Your wellness overview at a glance</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Study Hours"
          value={`${(totalStudyMinutes / 60).toFixed(1)}h`}
          icon={<Clock className="h-6 w-6 text-academic" />}
          accentClass="bg-academic/10"
        />
        <StatCard
          label="Syllabus Progress"
          value={`${avgProgress}%`}
          icon={<GraduationCap className="h-6 w-6 text-academic" />}
          accentClass="bg-academic/10"
        />
        <StatCard
          label="Active Habits"
          value={habits.length}
          icon={<Flame className="h-6 w-6 text-health" />}
          accentClass="bg-health/10"
        />
        <StatCard
          label="Balance"
          value={`$${(totalIncome - totalExpenses).toFixed(0)}`}
          icon={<Wallet className="h-6 w-6 text-finance" />}
          accentClass="bg-finance/10"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Study chart */}
        <div className="glass rounded-xl p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Study Activity (7 days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={last7}>
              <XAxis dataKey="day" stroke="hsl(215,15%,55%)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(215,15%,55%)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(225,20%,12%)', border: '1px solid hsl(225,15%,18%)', borderRadius: 8, color: 'hsl(210,20%,92%)' }}
              />
              <Bar dataKey="minutes" fill="hsl(210,90%,56%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expense breakdown */}
        <div className="glass rounded-xl p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Expense Breakdown</h2>
          {catData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={4}>
                  {catData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'hsl(225,20%,12%)', border: '1px solid hsl(225,15%,18%)', borderRadius: 8, color: 'hsl(210,20%,92%)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-muted-foreground">No expenses yet</div>
          )}
        </div>
      </div>

      {/* Quick stats row */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 text-academic">
            <Target className="h-4 w-4" />
            <span className="text-sm font-medium">Assignments</span>
          </div>
          <p className="mt-2 font-display text-xl font-bold">
            {completedAssignments}/{assignments.length}
          </p>
          <p className="text-xs text-muted-foreground">completed</p>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 text-health">
            <Heart className="h-4 w-4" />
            <span className="text-sm font-medium">Today's Exercise</span>
          </div>
          <p className="mt-2 font-display text-xl font-bold">{todayLogs.reduce((s, l) => s + l.duration, 0)} min</p>
          <p className="text-xs text-muted-foreground">{todayLogs.length} sessions</p>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 text-finance">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">This Month</span>
          </div>
          <p className="mt-2 font-display text-xl font-bold">${totalExpenses.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">spent</p>
        </div>
      </div>
    </AppLayout>
  );
}
