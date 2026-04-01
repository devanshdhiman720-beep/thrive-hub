import { AppLayout } from '@/components/AppLayout';
import { ModuleCard } from '@/components/ModuleCard';
import { useWellnessStore } from '@/store/wellnessStore';
import { Sparkles, GraduationCap, Heart, Wallet, Brain } from 'lucide-react';

export default function AIPage() {
  const { subjects, studySessions, assignments, healthLogs, habits, expenses } = useWellnessStore();

  // Generate local recommendations based on data
  const recommendations: { icon: typeof GraduationCap; title: string; text: string; color: string }[] = [];

  // Academic recommendations
  const lowestSubject = subjects.length
    ? subjects.reduce((lowest, s) => {
        const prog = s.syllabusTopics.length
          ? s.syllabusTopics.filter((t) => t.completed).length / s.syllabusTopics.length
          : 1;
        const lowestProg = lowest.syllabusTopics.length
          ? lowest.syllabusTopics.filter((t) => t.completed).length / lowest.syllabusTopics.length
          : 1;
        return prog < lowestProg ? s : lowest;
      })
    : null;

  if (lowestSubject) {
    const prog = lowestSubject.syllabusTopics.length
      ? Math.round(
          (lowestSubject.syllabusTopics.filter((t) => t.completed).length / lowestSubject.syllabusTopics.length) * 100
        )
      : 100;
    if (prog < 80) {
      recommendations.push({
        icon: GraduationCap,
        title: `Focus on ${lowestSubject.name}`,
        text: `Your progress is at ${prog}%. Try dedicating 30-minute focused sessions to cover remaining topics.`,
        color: 'text-academic',
      });
    }
  }

  const pendingAssigns = assignments.filter((a) => a.status !== 'completed');
  const urgentAssigns = pendingAssigns.filter((a) => {
    const diff = (new Date(a.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff <= 3 && diff >= 0;
  });
  if (urgentAssigns.length > 0) {
    recommendations.push({
      icon: GraduationCap,
      title: `${urgentAssigns.length} urgent assignment${urgentAssigns.length > 1 ? 's' : ''}`,
      text: `Due within 3 days: ${urgentAssigns.map((a) => a.title).join(', ')}. Prioritize these!`,
      color: 'text-destructive',
    });
  }

  const totalStudyMins = studySessions.reduce((s, ss) => s + ss.duration, 0);
  if (totalStudyMins < 120 && subjects.length > 0) {
    recommendations.push({
      icon: Brain,
      title: 'Increase study time',
      text: `You've logged ${totalStudyMins} minutes total. Aim for at least 2 hours to build momentum.`,
      color: 'text-academic',
    });
  }

  // Health recommendations
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = healthLogs.filter((l) => l.date === today);
  if (todayLogs.length === 0) {
    recommendations.push({
      icon: Heart,
      title: 'Get moving today',
      text: 'No exercise logged today. Even 15 minutes of walking can boost focus and mood!',
      color: 'text-health',
    });
  }

  const badMoods = healthLogs.filter((l) => l.mood === 'bad' || l.mood === 'terrible').length;
  if (badMoods > 2) {
    recommendations.push({
      icon: Heart,
      title: 'Mental wellness check',
      text: "You've recorded several low mood entries. Consider meditation, talking to someone, or taking a break.",
      color: 'text-health',
    });
  }

  const incompleteHabits = habits.filter((h) => !h.completedDates.includes(today));
  if (incompleteHabits.length > 0) {
    recommendations.push({
      icon: Heart,
      title: `${incompleteHabits.length} habits remaining today`,
      text: `Complete: ${incompleteHabits.map((h) => h.name).join(', ')} to keep your streaks going!`,
      color: 'text-health',
    });
  }

  // Finance recommendations
  const totalExpense = expenses.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const totalIncome = expenses.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  if (totalExpense > totalIncome && expenses.length > 0) {
    recommendations.push({
      icon: Wallet,
      title: 'Spending exceeds income',
      text: `You've spent $${totalExpense.toFixed(0)} but earned $${totalIncome.toFixed(0)}. Review non-essential spending.`,
      color: 'text-finance',
    });
  }

  const foodExpenses = expenses.filter((e) => e.type === 'expense' && e.category === 'food').reduce((s, e) => s + e.amount, 0);
  if (foodExpenses > totalExpense * 0.4 && foodExpenses > 0) {
    recommendations.push({
      icon: Wallet,
      title: 'High food spending',
      text: `Food is ${Math.round((foodExpenses / totalExpense) * 100)}% of expenses. Try meal prepping to save money!`,
      color: 'text-finance',
    });
  }

  // Fallback
  if (recommendations.length === 0) {
    recommendations.push({
      icon: Sparkles,
      title: 'Start tracking to get insights',
      text: 'Add subjects, log exercises, and track expenses. The more data you add, the smarter recommendations become!',
      color: 'text-ai',
    });
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">AI Insights</h1>
        <p className="mt-1 text-muted-foreground">
          Smart recommendations based on your data
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          💡 Enable Lovable Cloud for AI-powered personalized plans via Gemini/GPT
        </p>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, i) => {
          const Icon = rec.icon;
          return (
            <ModuleCard key={i} glowClass="glow-ai" className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ai/10">
                  <Icon className={`h-5 w-5 ${rec.color}`} />
                </div>
                <div>
                  <h3 className="font-display font-semibold">{rec.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{rec.text}</p>
                </div>
              </div>
            </ModuleCard>
          );
        })}
      </div>
    </AppLayout>
  );
}
