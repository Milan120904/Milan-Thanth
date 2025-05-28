import React, { useEffect } from 'react';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseCharts } from './components/ExpenseCharts';
import { ViewSelector } from './components/ViewSelector';
import { Login } from './components/Login';
import { Wallet, LogOut } from 'lucide-react';
import { useAuthStore, useExpenseStore } from './store';
import { supabase } from './supabaseClient';

function App() {
  const { user, setUser } = useAuthStore();
  const { setExpenses } = useExpenseStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      // Fetch user's expenses
      const fetchExpenses = async () => {
        const { data: expenses, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (!error && expenses) {
          setExpenses(expenses);
        }
      };

      fetchExpenses();
    } else {
      // Clear expenses when user logs out
      setExpenses([]);
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Wallet size={32} className="text-blue-400 mr-2" />
            <h1 className="text-3xl font-bold">Expense Tracker</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
          >
            <LogOut size={20} />
            Logout
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <ExpenseForm />
            <ViewSelector />
            <ExpenseCharts />
          </div>
          <ExpenseList />
        </div>
      </div>
    </div>
  );
}

export default App;