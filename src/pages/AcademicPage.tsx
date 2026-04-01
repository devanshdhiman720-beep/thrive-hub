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

  return (
    <AppLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Academic Tracker</h1>
          <p className="mt-1 text-muted-foreground">Manage subjects, study sessions & assignments</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-academic text-academic-foreground hover:bg-academic/90">
                <Plus className="mr-1 h-4 w-4" /> Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Subject</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Subject name" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} />
                <Input placeholder="Topics (comma separated)" value={newTopics} onChange={(e) => setNewTopics(e.target.value)} />
                <Button onClick={handleAddSubject} className="w-full bg-academic text-academic-foreground hover:bg-academic/90">Add Subject</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Clock className="mr-1 h-4 w-4" /> Log Study</Button>
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
                <Button onClick={handleAddSession} className="w-full bg-academic text-academic-foreground hover:bg-academic/90">Log Session</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><BookOpen className="mr-1 h-4 w-4" /> Assignment</Button>
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
                <Button onClick={handleAddAssignment} className="w-full bg-academic text-academic-foreground hover:bg-academic/90">Add Assignment</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Subjects */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {subjects.map((subject) => {
          const completed = subject.syllabusTopics.filter((t) => t.completed).length;
          const total = subject.syllabusTopics.length;
          const progress = total ? Math.round((completed / total) * 100) : 0;
          const subjectSessions = studySessions.filter((s) => s.subjectId === subject.id);
          const totalMins = subjectSessions.reduce((sum, s) => sum + s.duration, 0);

          return (
            <ModuleCard key={subject.id} glowClass="hover:glow-academic">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-academic/10">
                    <GraduationCap className="h-5 w-5 text-academic" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">{subject.name}</h3>
                    <p className="text-xs text-muted-foreground">{totalMins} min studied</p>
                  </div>
                </div>
                <span className="font-display text-lg font-bold text-academic">{progress}%</span>
              </div>
              <Progress value={progress} className="mb-4 h-2 [&>div]:bg-academic" />
              <div className="space-y-2">
                {subject.syllabusTopics.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => toggleTopic(subject.id, i)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-secondary"
                  >
                    {topic.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-academic" />
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
          <h2 className="mb-4 font-display text-xl font-semibold">Assignments</h2>
          <div className="space-y-3">
            {assignments.map((a) => (
              <ModuleCard key={a.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {subjects.find((s) => s.id === a.subjectId)?.name} · Due {a.deadline}
                  </p>
                </div>
                <Select value={a.status} onValueChange={(v) => updateAssignmentStatus(a.id, v as Assignment['status'])}>
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
