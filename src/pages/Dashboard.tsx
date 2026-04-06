import { AppLayout } from '@/components/AppLayout';
import { StatCard, ModuleCard } from '@/components/ModuleCard';
import { useWellnessStore } from '@/store/wellnessStore';
import { Clock, Target, TrendingUp, Flame, Heart, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const CHART_COLORS = ['hsl(170,100%,42%)', 'hsl(152,70%,48%)', 'hsl(38,92%,55%)', 'hsl(290,80%,60%)', 'hsl(200,80%,50%)', 'hsl(330,70%,55%)'];

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

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const mins = studySessions.filter((s) => s.date === dateStr).reduce((sum, s) => sum + s.duration, 0);
    return { day: d.toLocaleDateString('en', { weekday: 'short' }), minutes: mins };
  });

  const catData = ['food', 'travel', 'study', 'entertainment', 'health', 'other']
    .map((cat) => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: expenses.filter((e) => e.type === 'expense' && e.category === cat).reduce((sum, e) => sum + e.amount, 0),
    }))
    .filter((c) => c.value > 0);

  const tooltipStyle = {
    background: 'hsl(220,35%,8%)',
    border: '1px solid hsl(170,60%,20%)',
    borderRadius: 8,
    color: 'hsl(180,20%,90%)',
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">
          Namaste, Student <span className="text-2xl">🙏</span>
        </h1>
        <p className="mt-1 text-muted-foreground">Your evolution continues · Track · Grow · Transcend</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Study Hours" value={`${(totalStudyMinutes / 60).toFixed(1)}H`} />
        <StatCard label="Syllabus Progress" value={`${avgProgress}%`} />
        <StatCard label="Active Habits" value={habits.length} />
        <StatCard label="Net Balance" value={`$${(totalIncome - totalExpenses).toFixed(0)}`} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ModuleCard>
          <p className="section-title mb-4">📚 Study This Week</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={last7}>
              <XAxis dataKey="day" stroke="hsl(200,15%,40%)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(200,15%,40%)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="minutes" fill="hsl(170,100%,42%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ModuleCard>

        <ModuleCard>
          <p className="section-title mb-4">💰 Finance Overview</p>
          {catData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={45} paddingAngle={4}>
                  {catData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'hsl(200,15%,50%)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-muted-foreground">No expenses yet</div>
          )}
        </ModuleCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ModuleCard>
          <div className="flex items-center gap-2 text-primary">
            <Target className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider font-medium">Assignments</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold">
            {completedAssignments}/{assignments.length}
          </p>
          <p className="text-xs text-muted-foreground">completed</p>
        </ModuleCard>
        <ModuleCard>
          <div className="flex items-center gap-2 text-health">
            <Heart className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider font-medium">Today's Exercise</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold">{todayLogs.reduce((s, l) => s + l.duration, 0)} min</p>
          <p className="text-xs text-muted-foreground">{todayLogs.length} sessions</p>
        </ModuleCard>
        <ModuleCard>
          <div className="flex items-center gap-2 text-finance">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider font-medium">This Month</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold">${totalExpenses.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">spent</p>
        </ModuleCard>
      </div>
    </AppLayout>
  );
}
