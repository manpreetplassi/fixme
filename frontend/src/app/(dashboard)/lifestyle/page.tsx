'use client';

import { FormEvent, useState } from 'react';
import { Activity, Dumbbell, Plus, Search, Trash2, Utensils } from 'lucide-react';
import { TimePicker } from '@/components/ui/time-picker';
import { PageHeader } from '@/components/layout/page-header';
import { MealEntry, LifestyleActivity, MealTemplate, LifestyleDay } from '@/lib/api/lifestyle';
import { useCreateLifestyleActivity, useCreateMeal, useCreateMealTemplate, useDeleteLifestyleActivity, useDeleteMeal, useLifestyleAnalytics, useLifestyleSearch, useLifestyleToday, useMealTemplates, useUpdateLifestyleDay, useUseMealTemplate } from '@/hooks/use-lifestyle';

const mealTypes = ['breakfast', 'lunch', 'snack', 'dinner'];
const sleepQualities = ['excellent', 'good', 'average', 'poor', 'missed'];
const moods = ['great', 'good', 'okay', 'low', 'bad'];
const energies = ['low', 'medium', 'high'];

const mealInitial = {
  meal_type: 'breakfast',
  meal_time: '',
  meal_name: '',
  food_items: '',
  homemade: true,
  outside_food: false,
  leftover_from_dinner: false,
  restaurant: '',
  sabzi_name: '',
  roti_count: '',
  rice: false,
  dal: false,
  salad: false,
  curd: false,
  fruits: false,
  tea: false,
  coffee: false,
  cost: '',
  outside_reason: '',
  quantity: '',
  notes: '',
};

const activityInitial = {
  activity_type: 'exercise',
  name: 'Walking',
  start_time: '',
  end_time: '',
  duration_minutes: '',
  project_name: '',
  notes: '',
};

export default function LifestylePage() {
  const today = useLifestyleToday();
  const weekly = useLifestyleAnalytics('week');
  const monthly = useLifestyleAnalytics('month');
  const templates = useMealTemplates();
  const updateDay = useUpdateLifestyleDay();
  const createMeal = useCreateMeal();
  const deleteMeal = useDeleteMeal();
  const createTemplate = useCreateMealTemplate();
  const useTemplate = useUseMealTemplate();
  const createActivity = useCreateLifestyleActivity();
  const deleteActivity = useDeleteLifestyleActivity();
  const [mealForm, setMealForm] = useState(mealInitial);
  const [activityForm, setActivityForm] = useState(activityInitial);
  const [search, setSearch] = useState('');
  const searchResults = useLifestyleSearch(search);

  const day = today.data?.day;

  function updateField(name: string, value: string | boolean) {
    void updateDay.mutateAsync({ [name]: value });
  }

  async function submitMeal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createMeal.mutateAsync({
      ...mealForm,
      food_items: mealForm.food_items.split(',').map((item) => item.trim()).filter(Boolean),
      roti_count: mealForm.roti_count ? Number(mealForm.roti_count) : undefined,
      cost: mealForm.cost ? Number(mealForm.cost) : undefined,
    });
    setMealForm(mealInitial);
  }

  async function saveMealTemplate() {
    if (!mealForm.meal_name.trim()) return;
    await createTemplate.mutateAsync({
      name: mealForm.meal_name,
      meal_type: mealForm.meal_type,
      food_items: mealForm.food_items.split(',').map((item) => item.trim()).filter(Boolean),
      homemade: mealForm.homemade,
      sabzi_name: mealForm.sabzi_name || undefined,
      roti_count: mealForm.roti_count ? Number(mealForm.roti_count) : undefined,
      notes: mealForm.notes || undefined,
    });
  }

  async function submitActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createActivity.mutateAsync({
      ...activityForm,
      duration_minutes: activityForm.duration_minutes ? Number(activityForm.duration_minutes) : undefined,
    });
    setActivityForm(activityInitial);
  }

  const saving = updateDay.isPending || createMeal.isPending || createActivity.isPending;

  return (
    <div>
      <PageHeader title="Lifestyle Journal" subtitle="Meals, sleep, exercise, productivity, mood, energy, and searchable history." />

      {today.isLoading ? <p className="mb-4 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">Loading lifestyle journal...</p> : null}
      {today.isError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">Could not load lifestyle journal.</p> : null}

      {today.data ? (
        <>
          <section className="mb-6 grid gap-4 md:grid-cols-4">
            <Metric label="Daily score" value={`${today.data.score.percentage}%`} />
            <Metric label="Sleep" value={day?.sleep_hours ? `${day.sleep_hours}h` : '--'} />
            <Metric label="Productive" value={`${Math.round((today.data.activities.filter((entry: LifestyleActivity) => entry.activity_type === 'productivity').reduce((sum: number, entry: LifestyleActivity) => sum + entry.duration_minutes, 0) / 60) * 10) / 10}h`} />
          </section>

          <section className="mb-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-black/10 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70 lg:col-span-2">
              <h2 className="mb-4 text-xl font-black">Today basics</h2>
              <div className="grid gap-3 md:grid-cols-4">
                <Field label="Wake" type="time" value={day?.wake_time ?? ''} onChange={(value) => updateField('wake_time', value)} />
                <Field label="Sleep" type="time" value={day?.sleep_time ?? ''} onChange={(value) => updateField('sleep_time', value)} />
                <Field label="Sleep hours" type="number" value={day?.sleep_hours ?? ''} onChange={(value) => updateField('sleep_hours', value)} />
                <SelectField label="Sleep quality" value={day?.sleep_quality ?? ''} options={sleepQualities} onChange={(value) => updateField('sleep_quality', value)} />
                <SelectField label="Mood" value={day?.mood ?? ''} options={moods} onChange={(value) => updateField('mood', value)} />
                <SelectField label="Morning energy" value={day?.morning_energy ?? ''} options={energies} onChange={(value) => updateField('morning_energy', value)} />
                <SelectField label="Night energy" value={day?.night_energy ?? ''} options={energies} onChange={(value) => updateField('night_energy', value)} />
                <Field label="Screen off" type="time" value={day?.screen_shutdown_time ?? ''} onChange={(value) => updateField('screen_shutdown_time', value)} />
              </div>
              <textarea className="mt-3 min-h-20 w-full resize-none rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" placeholder="Notes: overtime, headache, office party, tired, cooked..." value={day?.notes ?? ''} onChange={(event) => updateField('notes', event.target.value)} />
              {saving ? <p className="mt-2 text-xs text-slate-500">Saving...</p> : null}
            </div>

            <div className="rounded-lg border border-black/10 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
              <h2 className="mb-4 text-xl font-black">Insights</h2>
              <div className="space-y-3">
                {(today.data.insights as string[]).map((insight) => (
                  <p key={insight} className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100">{insight}</p>
                ))}
              </div>
            </div>
          </section>

          <section className="mb-6 grid gap-4 lg:grid-cols-2">
            <form onSubmit={submitMeal} className="rounded-lg border border-black/10 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><Utensils className="h-5 w-5" /> Meal log</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <SelectField label="Meal" value={mealForm.meal_type} options={mealTypes} onChange={(value) => setMealForm((current) => ({ ...current, meal_type: value }))} />
                <Field label="Time" type="time" value={mealForm.meal_time} onChange={(value) => setMealForm((current) => ({ ...current, meal_time: value }))} />
                <Field label="Meal name" value={mealForm.meal_name} onChange={(value) => setMealForm((current) => ({ ...current, meal_name: value }))} />
                <Field label="Food items" value={mealForm.food_items} onChange={(value) => setMealForm((current) => ({ ...current, food_items: value }))} placeholder="Poha, Banana" />
                <Field label="Sabzi" value={mealForm.sabzi_name} onChange={(value) => setMealForm((current) => ({ ...current, sabzi_name: value }))} />
                <Field label="Rotis" type="number" value={mealForm.roti_count} onChange={(value) => setMealForm((current) => ({ ...current, roti_count: value }))} />
                <Field label="Restaurant" value={mealForm.restaurant} onChange={(value) => setMealForm((current) => ({ ...current, restaurant: value }))} />
                <Field label="Cost" type="number" value={mealForm.cost} onChange={(value) => setMealForm((current) => ({ ...current, cost: value }))} />
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-4">
                {(['homemade', 'outside_food', 'leftover_from_dinner', 'fruits', 'tea', 'coffee', 'rice', 'dal', 'salad', 'curd'] as const).map((key) => (
                  <label key={key} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs capitalize dark:border-slate-800">
                    <input type="checkbox" checked={Boolean(mealForm[key])} onChange={(event) => setMealForm((current) => ({ ...current, [key]: event.target.checked }))} />
                    {key.replaceAll('_', ' ')}
                  </label>
                ))}
              </div>
              <textarea className="mt-3 min-h-16 w-full resize-none rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" placeholder="Reason, quantity, notes" value={mealForm.notes} onChange={(event) => setMealForm((current) => ({ ...current, notes: event.target.value }))} />
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:bg-slate-300" disabled={createMeal.isPending}><Plus className="h-4 w-4" /> Add meal</button>
                <button type="button" onClick={saveMealTemplate} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900">Save template</button>
              </div>
            </form>

            <form onSubmit={submitActivity} className="rounded-lg border border-black/10 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><Dumbbell className="h-5 w-5" /> Exercise / productivity</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <SelectField label="Type" value={activityForm.activity_type} options={['exercise', 'productivity']} onChange={(value) => setActivityForm((current) => ({ ...current, activity_type: value }))} />
                <Field label="Name" value={activityForm.name} onChange={(value) => setActivityForm((current) => ({ ...current, name: value }))} placeholder="Gym, Walking, Coding" />
                <Field label="Start" type="time" value={activityForm.start_time} onChange={(value) => setActivityForm((current) => ({ ...current, start_time: value }))} />
                <Field label="End" type="time" value={activityForm.end_time} onChange={(value) => setActivityForm((current) => ({ ...current, end_time: value }))} />
                <Field label="Minutes" type="number" value={activityForm.duration_minutes} onChange={(value) => setActivityForm((current) => ({ ...current, duration_minutes: value }))} />
                <Field label="Project" value={activityForm.project_name} onChange={(value) => setActivityForm((current) => ({ ...current, project_name: value }))} />
              </div>
              <textarea className="mt-3 min-h-16 w-full resize-none rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" placeholder="Notes" value={activityForm.notes} onChange={(event) => setActivityForm((current) => ({ ...current, notes: event.target.value }))} />
              <button className="mt-3 inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-600 disabled:bg-slate-300" disabled={createActivity.isPending}><Activity className="h-4 w-4" /> Add activity</button>
            </form>
          </section>

          <section className="mb-6 grid gap-4 lg:grid-cols-3">
            <List title="Meals today" items={today.data.meals} onDelete={deleteMeal.mutate} type="meal" />
            <List title="Activities today" items={today.data.activities} onDelete={deleteActivity.mutate} type="activity" />
            <div className="rounded-lg border border-black/10 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
              <h2 className="mb-4 text-xl font-black">Meal templates</h2>
              <div className="space-y-2">
                {((templates.data ?? []) as MealTemplate[]).map((template) => (
                  <button key={template.id} onClick={() => useTemplate.mutate(template.id)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900">
                    <span className="font-semibold">{template.name}</span>
                    <span className="block text-xs text-slate-500">{template.meal_type} / {template.food_items.join(', ')}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Metric label="Avg sleep" value={`${Number(weekly.data?.averageSleep ?? 0).toFixed(1)}h`} />
            <Metric label="Home cooked" value={`${weekly.data?.homeCookedPercent ?? 0}%`} />
            <Metric label="Outside meals" value={weekly.data?.outsideMeals ?? 0} />
            <Metric label="Coding hours" value={`${weekly.data?.codingHours ?? 0}h`} />
            <Metric label="Fruit days" value={weekly.data?.fruitDays ?? 0} />
            <Metric label="Most common sabzi" value={weekly.data?.mostCommonSabzi ?? '--'} />
            <Metric label="Monthly consistency" value={`${monthly.data?.consistency ?? 0}%`} />
          </section>

          <section className="rounded-lg border border-black/10 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><Search className="h-5 w-5" /> Search history</h2>
            <input className="mb-4 w-full rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" placeholder="Rajma, gym, office party, restaurant..." value={search} onChange={(event) => setSearch(event.target.value)} />
            {searchResults.data ? (
              <div className="grid gap-3 md:grid-cols-3">
                <SearchGroup title="Meals" items={searchResults.data.meals} />
                <SearchGroup title="Days" items={searchResults.data.days} />
                <SearchGroup title="Activities" items={searchResults.data.activities} />
              </div>
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string | number; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  if (type === 'time') {
    return <TimePicker label={label} value={String(value)} onChange={onChange} />;
  }
  return (
    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
      {label}
      <input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-950 dark:border-slate-800 dark:text-slate-100" />
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-950 dark:border-slate-800 dark:text-slate-100">
        <option value="">Select</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function List({ title, items, onDelete, type }: { title: string; items: Array<MealEntry | LifestyleActivity>; onDelete: (id: string) => void; type: 'meal' | 'activity' }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
      <h2 className="mb-4 text-xl font-black">{title}</h2>
      <div className="space-y-2">
        {items.map((item) => {
          const titleText = type === 'meal' ? mealTitle(item as MealEntry) : activityTitle(item as LifestyleActivity);
          const detailText = type === 'meal' ? mealDetail(item as MealEntry) : activityDetail(item as LifestyleActivity);

          return (
            <article key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
              <div>
                <p className="font-semibold">{titleText}</p>
                <p className="text-xs text-slate-500">{detailText}</p>
              </div>
              <button onClick={() => onDelete(item.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40">
                <Trash2 className="h-4 w-4" />
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

type SearchItem = MealEntry | LifestyleActivity | LifestyleDay;

function SearchGroup({ title, items }: { title: string; items: SearchItem[] }) {
  return (
    <div>
      <h3 className="mb-2 font-bold">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <p key={item.id} className="rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-900">
            <span className="font-semibold">{searchDate(item)}</span>
            <span className="block text-xs text-slate-500">{searchLabel(item)}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

function mealTitle(item: MealEntry) {
  return item.meal_name || item.meal_type;
}

function mealDetail(item: MealEntry) {
  return [item.meal_time, item.food_items?.join(', '), item.sabzi_name].filter(Boolean).join(' / ');
}

function activityTitle(item: LifestyleActivity) {
  return item.name || item.activity_type;
}

function activityDetail(item: LifestyleActivity) {
  return [item.start_time, `${item.duration_minutes} min`, item.project_name].filter(Boolean).join(' / ');
}

function searchLabel(item: SearchItem) {
  if ('meal_name' in item) return item.meal_name || item.sabzi_name || item.restaurant || item.notes || item.meal_type;
  if ('project_name' in item) return item.name || item.project_name || item.notes || item.activity_type;
  return item.notes || item.mood || 'Daily note';
}

function searchDate(item: SearchItem) {
  if ('meal_date' in item) return item.meal_date;
  if ('activity_date' in item) return item.activity_date;
  return item.log_date;
}
