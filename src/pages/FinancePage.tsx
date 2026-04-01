import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { ModuleCard } from '@/components/ModuleCard';
import { useWellnessStore } from '@/store/wellnessStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, Plus, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Expense } from '@/store/wellnessStore';

const categories: Expense['category'][] = ['food', 'travel', 'study', 'entertainment', 'health', 'other'];

const categoryEmoji: Record<Expense['category'], string> = {
  food: '🍔', travel: '✈️', study: '📚', entertainment: '🎮', health: '💊', other: '📦',
};

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

  const catBreakdown = categories.map((cat) => ({
    name: cat,
    amount: expenses.filter((e) => e.type === 'expense' && e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.amount > 0);

  const recentExpenses = [...expenses].reverse().slice(0, 15);

  return (
    <AppLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Finance Tracker</h1>
          <p className="mt-1 text-muted-foreground">Track income, expenses & budget</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-finance text-finance-foreground hover:bg-finance/90"><Plus className="mr-1 h-4 w-4" /> Add Entry</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Transaction</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={() => setType('expense')} variant={type === 'expense' ? 'default' : 'outline'} className="flex-1">Expense</Button>
                <Button onClick={() => setType('income')} variant={type === 'income' ? 'default' : 'outline'} className="flex-1">Income</Button>
              </div>
              <Input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              {type === 'expense' && (
                <Select value={category} onValueChange={(v) => setCategory(v as Expense['category'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c} value={c}>{categoryEmoji[c]} {c}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              <Button onClick={handleAdd} className="w-full bg-finance text-finance-foreground hover:bg-finance/90">Add</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ModuleCard glowClass="glow-health">
          <div className="flex items-center gap-2 text-health">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm font-medium">Income</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold">${totalIncome.toFixed(2)}</p>
        </ModuleCard>
        <ModuleCard glowClass="glow-finance">
          <div className="flex items-center gap-2 text-destructive">
            <TrendingDown className="h-5 w-5" />
            <span className="text-sm font-medium">Expenses</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold">${totalExpense.toFixed(2)}</p>
        </ModuleCard>
        <ModuleCard>
          <div className="flex items-center gap-2 text-finance">
            <Wallet className="h-5 w-5" />
            <span className="text-sm font-medium">Balance</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold">${(totalIncome - totalExpense).toFixed(2)}</p>
        </ModuleCard>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart */}
        <div className="glass rounded-xl p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">By Category</h2>
          {catBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={catBreakdown} layout="vertical">
                <XAxis type="number" stroke="hsl(215,15%,55%)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="hsl(215,15%,55%)" fontSize={12} tickLine={false} axisLine={false} width={90} />
                <Tooltip contentStyle={{ background: 'hsl(225,20%,12%)', border: '1px solid hsl(225,15%,18%)', borderRadius: 8, color: 'hsl(210,20%,92%)' }} />
                <Bar dataKey="amount" fill="hsl(38,92%,55%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-muted-foreground">No data yet</div>
          )}
        </div>

        {/* Recent */}
        <div>
          <h2 className="mb-4 font-display text-lg font-semibold">Recent Transactions</h2>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {recentExpenses.map((e) => (
              <ModuleCard key={e.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{e.type === 'income' ? '💰' : categoryEmoji[e.category]}</span>
                  <div>
                    <p className="text-sm font-medium">{e.description}</p>
                    <p className="text-xs text-muted-foreground">{e.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {e.type === 'income' ? (
                    <ArrowUpRight className="h-4 w-4 text-health" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-destructive" />
                  )}
                  <span className={`font-display font-bold ${e.type === 'income' ? 'text-health' : 'text-destructive'}`}>
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
