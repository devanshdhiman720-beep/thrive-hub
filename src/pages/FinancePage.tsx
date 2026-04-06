import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { ModuleCard } from '@/components/ModuleCard';
import { useWellnessStore } from '@/store/wellnessStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, Plus, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import type { Expense } from '@/store/wellnessStore';

const categories: Expense['category'][] = ['food', 'travel', 'study', 'entertainment', 'health', 'other'];

const categoryEmoji: Record<Expense['category'], string> = {
  food: '🍔', travel: '✈️', study: '📚', entertainment: '🎮', health: '💊', other: '📦',
};

const CAT_COLORS = ['hsl(170,100%,42%)', 'hsl(152,70%,48%)', 'hsl(38,92%,55%)', 'hsl(290,80%,60%)', 'hsl(200,80%,50%)', 'hsl(330,70%,55%)'];

export default function FinancePage() {
  const { expenses, addExpense } = useWellnessStore();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Expense['category']>('food');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAdd = () => {
    if (!amount || !description) return;
    addExpense({ amount: parseFloat(amount), description, category, type });
    setAmount('');
    setDescription('');
    setDialogOpen(false);
  };

  const totalIncome = expenses.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const totalExpense = expenses.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0);

  const catBreakdown = categories.map((cat, i) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    amount: expenses.filter((e) => e.type === 'expense' && e.category === cat).reduce((s, e) => s + e.amount, 0),
    fill: CAT_COLORS[i],
  })).filter((c) => c.amount > 0);

  const recentExpenses = [...expenses].reverse().slice(0, 15);

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
          <h1 className="font-display text-3xl font-bold">💰 Finance Tracker</h1>
          <p className="mt-1 text-muted-foreground">Conscious spending = Disciplined karma</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="mr-1 h-4 w-4" /> + Add</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log Transaction</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={() => setType('income')}
                  variant={type === 'income' ? 'default' : 'outline'}
                  className={type === 'income' ? 'flex-1 bg-primary text-primary-foreground' : 'flex-1 border-primary/30 text-primary'}
                >Income</Button>
                <Button
                  onClick={() => setType('expense')}
                  variant={type === 'expense' ? 'default' : 'outline'}
                  className={type === 'expense' ? 'flex-1 bg-finance text-finance-foreground' : 'flex-1 border-primary/30'}
                >Expense</Button>
              </div>
              <Input type="number" placeholder="Amount ($)" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Input placeholder="Note..." value={description} onChange={(e) => setDescription(e.target.value)} />
              {type === 'expense' && (
                <Select value={category} onValueChange={(v) => setCategory(v as Expense['category'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c} value={c}>{categoryEmoji[c]} {c}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              <Button onClick={handleAdd} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">+ Add</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ModuleCard>
          <p className="section-title mb-2">Total Income</p>
          <p className="font-display text-3xl font-bold text-primary">${totalIncome.toFixed(0)}</p>
        </ModuleCard>
        <ModuleCard>
          <p className="section-title mb-2">Total Expense</p>
          <p className="font-display text-3xl font-bold text-finance">${totalExpense.toFixed(0)}</p>
        </ModuleCard>
        <ModuleCard>
          <p className="section-title mb-2">Net Savings</p>
          <p className={`font-display text-3xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-primary' : 'text-destructive'}`}>
            ${(totalIncome - totalExpense).toFixed(0)}
          </p>
        </ModuleCard>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pie Chart */}
        <ModuleCard>
          <p className="section-title mb-4">Expense Categories</p>
          {catBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={catBreakdown} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={4}>
                  {catBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'hsl(200,15%,50%)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-muted-foreground">No data yet</div>
          )}
        </ModuleCard>

        {/* Recent */}
        <div>
          <p className="section-title mb-4">Recent Transactions</p>
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2">
            {recentExpenses.map((e) => (
              <ModuleCard key={e.id} className="flex items-center justify-between !py-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{e.type === 'income' ? '💰' : categoryEmoji[e.category]}</span>
                  <div>
                    <p className="text-sm font-medium">{e.description}</p>
                    <p className="text-xs text-muted-foreground">{e.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {e.type === 'income' ? (
                    <ArrowUpRight className="h-4 w-4 text-primary" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-finance" />
                  )}
                  <span className={`font-display font-bold ${e.type === 'income' ? 'text-primary' : 'text-finance'}`}>
                    ${e.amount.toFixed(2)}
                  </span>
                </div>
              </ModuleCard>
            ))}
            {recentExpenses.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">No transactions yet</div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
