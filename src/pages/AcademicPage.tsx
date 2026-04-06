import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { ModuleCard } from '@/components/ModuleCard';
import { useWellnessStore } from '@/store/wellnessStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Plus, Clock, CheckCircle2, Circle, BookOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const SUBJECT_COLORS = ['hsl(170,100%,42%)', 'hsl(152,70%,48%)', 'hsl(38,92%,55%)', 'hsl(290,80%,60%)', 'hsl(200,80%,50%)'];

export default function AcademicPage() {
  const { subjects, studySessions, assignments, addSubject, addStudySession, addAssignment, updateAssignmentStatus, toggleTopic } = useWellnessStore();

  const [newSubject, setNewSubject] = useState('');
  const [newTopics, setNewTopics] = useState('');
  const [sessionSubject, setSessionSubject] = useState('');
  const [sessionDuration, setSessionDuration] = useState('');
  const [assignTitle, setAssignTitle] = useState('');
  const [assignSubject, setAssignSubject] = useState('');
  const [assignDeadline, setAssignDeadline] = useState('');
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const handleAddSubject = () => {
    if (!newSubject.trim()) return;
    const topics = newTopics.split(',').map((t) => t.trim()).filter(Boolean);
    addSubject(newSubject.trim(), topics);
    setNewSubject('');
    setNewTopics('');
    setSubjectDialogOpen(false);
  };

  const handleAddSession = () => {
    if (!sessionSubject || !sessionDuration) return;
    addStudySession(sessionSubject, parseInt(sessionDuration));
    setSessionDuration('');
    setSessionDialogOpen(false);
  };

  const handleAddAssignment = () => {
    if (!assignSubject || !assignTitle || !assignDeadline) return;
    addAssignment(assignSubject, assignTitle, assignDeadline);
    setAssignTitle('');
    setAssignDeadline('');
    setAssignDialogOpen(false);
  };

  // Chart data
  const subjectBreakdown = subjects.map((s, i) => ({
    name: s.name,
    hours: studySessions.filter((ss) => ss.subjectId === s.id).reduce((sum, ss) => sum + ss.duration, 0) / 60,
    fill: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
  }));

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const hours = studySessions.filter((s) => s.date === dateStr).reduce((sum, s) => sum + s.duration, 0) / 60;
    return { day: d.toLocaleDateString('en', { weekday: 'short' }), hours: parseFloat(hours.toFixed(1)) };
  });

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
          <h1 className="font-display text-3xl font-bold">📚 Study Tracker</h1>
          <p className="mt-1 text-muted-foreground">Track learning sessions · Each hour = +15 Karma</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-1 h-4 w-4" /> Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Subject</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Subject name" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} />
                <Input placeholder="Topics (comma separated)" value={newTopics} onChange={(e) => setNewTopics(e.target.value)} />
                <Button onClick={handleAddSubject} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Add Subject</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10"><Clock className="mr-1 h-4 w-4" /> + Log</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Log Study Session</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Select value={sessionSubject} onValueChange={setSessionSubject}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="Duration (minutes)" value={sessionDuration} onChange={(e) => setSessionDuration(e.target.value)} />
                <Button onClick={handleAddSession} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Log Session</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10"><BookOpen className="mr-1 h-4 w-4" /> Assignment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Assignment</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Select value={assignSubject} onValueChange={setAssignSubject}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input placeholder="Assignment title" value={assignTitle} onChange={(e) => setAssignTitle(e.target.value)} />
                <Input type="date" value={assignDeadline} onChange={(e) => setAssignDeadline(e.target.value)} />
                <Button onClick={handleAddAssignment} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Add Assignment</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Charts row */}
      {subjects.length > 0 && (
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ModuleCard>
            <p className="section-title mb-4">Subject Breakdown</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={subjectBreakdown.filter(s => s.hours > 0)} dataKey="hours" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={4}>
                  {subjectBreakdown.map((s, i) => (
                    <Cell key={i} fill={s.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'hsl(200,15%,50%)' }} />
              </PieChart>
            </ResponsiveContainer>
          </ModuleCard>
          <ModuleCard>
            <p className="section-title mb-4">Weekly Hours</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={last7}>
                <XAxis dataKey="day" stroke="hsl(200,15%,40%)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(200,15%,40%)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="hours" fill="hsl(170,100%,42%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ModuleCard>
        </div>
      )}

      {/* Subjects */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {subjects.map((subject) => {
          const completed = subject.syllabusTopics.filter((t) => t.completed).length;
          const total = subject.syllabusTopics.length;
          const progress = total ? Math.round((completed / total) * 100) : 0;
          const subjectSessions = studySessions.filter((s) => s.subjectId === subject.id);
          const totalMins = subjectSessions.reduce((sum, s) => sum + s.duration, 0);

          return (
            <ModuleCard key={subject.id}>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">{subject.name}</h3>
                    <p className="text-xs text-muted-foreground">{totalMins} min studied</p>
                  </div>
                </div>
                <span className="font-display text-lg font-bold text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="mb-4 h-2 [&>div]:bg-primary" />
              <div className="space-y-2">
                {subject.syllabusTopics.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => toggleTopic(subject.id, i)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-primary/5"
                  >
                    {topic.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={topic.completed ? 'line-through text-muted-foreground' : ''}>{topic.name}</span>
                  </button>
                ))}
              </div>
            </ModuleCard>
          );
        })}
      </div>

      {subjects.length === 0 && (
        <div className="mt-12 text-center text-muted-foreground">
          <GraduationCap className="mx-auto h-12 w-12 opacity-30" />
          <p className="mt-4">No subjects yet. Add your first subject to get started!</p>
        </div>
      )}

      {/* Assignments */}
      {assignments.length > 0 && (
        <div className="mt-8">
          <p className="section-title mb-4">Assignments</p>
          <div className="space-y-3">
            {assignments.map((a) => (
              <ModuleCard key={a.id} className="flex items-center justify-between !py-4">
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {subjects.find((s) => s.id === a.subjectId)?.name} · Due {a.deadline}
                  </p>
                </div>
                <Select value={a.status} onValueChange={(v) => updateAssignmentStatus(a.id, v as 'pending' | 'in-progress' | 'completed')}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </ModuleCard>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
