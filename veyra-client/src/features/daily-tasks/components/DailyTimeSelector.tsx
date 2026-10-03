/**
 * DailyTimeSelector — Premium, interactive time adder for daily tasks and habits.
 * Features atmospheric time-of-day cards, LED digital tuner, quick stepping,
 * per-day schedule matrix, and gamified deadline impact preview.
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
  Clock,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Copy,
  RotateCcw,
  Check,
  Calendar,
  Zap,
  type LucideIcon,
} from 'lucide-react';

interface DailyTimeSelectorProps {
  hasEndTime: boolean;
  onToggleHasEndTime: (enabled: boolean) => void;
  dueTime: string; // HH:mm
  onDueTimeChange: (time: string) => void;
  selectedDays: number[];
  customizePerDay: boolean;
  onToggleCustomizePerDay: (enabled: boolean) => void;
  dayDueTimes: Record<number, string>;
  onDayDueTimesChange: (dayTimes: Record<number, string>) => void;
}

const DAYS_META = [
  { label: 'Sun', value: 0, full: 'Sunday' },
  { label: 'Mon', value: 1, full: 'Monday' },
  { label: 'Tue', value: 2, full: 'Tuesday' },
  { label: 'Wed', value: 3, full: 'Wednesday' },
  { label: 'Thu', value: 4, full: 'Thursday' },
  { label: 'Fri', value: 5, full: 'Friday' },
  { label: 'Sat', value: 6, full: 'Saturday' },
];

interface PresetTime {
  id: string;
  label: string;
  time: string;
  time12: string;
  tagline: string;
  icon: LucideIcon;
  accent: string;
  selectedBorder: string;
  selectedGlow: string;
  selectedBg: string;
}

const PRESETS: PresetTime[] = [
  {
    id: 'morning',
    label: 'Morning',
    time: '09:00',
    time12: '9:00 AM',
    tagline: 'Start early',
    icon: Sunrise,
    accent: 'text-amber-400',
    selectedBorder: 'border-amber-400/80',
    selectedGlow: 'shadow-amber-500/20',
    selectedBg: 'from-amber-500/20 via-orange-500/10 to-transparent',
  },
  {
    id: 'midday',
    label: 'Midday',
    time: '13:00',
    time12: '1:00 PM',
    tagline: 'Lunch reset',
    icon: Sun,
    accent: 'text-sky-400',
    selectedBorder: 'border-sky-400/80',
    selectedGlow: 'shadow-sky-500/20',
    selectedBg: 'from-sky-500/20 via-blue-500/10 to-transparent',
  },
  {
    id: 'evening',
    label: 'Evening',
    time: '18:00',
    time12: '6:00 PM',
    tagline: 'Post workday',
    icon: Sunset,
    accent: 'text-purple-400',
    selectedBorder: 'border-purple-400/80',
    selectedGlow: 'shadow-purple-500/20',
    selectedBg: 'from-purple-500/20 via-pink-500/10 to-transparent',
  },
  {
    id: 'night',
    label: 'Night',
    time: '21:00',
    time12: '9:00 PM',
    tagline: 'Evening routine',
    icon: Moon,
    accent: 'text-blue-400',
    selectedBorder: 'border-blue-400/80',
    selectedGlow: 'shadow-blue-500/25',
    selectedBg: 'from-blue-600/25 via-indigo-600/15 to-transparent',
  },
  {
    id: 'midnight',
    label: 'Midnight',
    time: '23:59',
    time12: '11:59 PM',
    tagline: 'Full day window',
    icon: Sparkles,
    accent: 'text-emerald-400',
    selectedBorder: 'border-emerald-400/80',
    selectedGlow: 'shadow-emerald-500/20',
    selectedBg: 'from-emerald-500/20 via-teal-500/10 to-transparent',
  },
];

/** Convert HH:mm to 12h formatted string (e.g. 9:00 PM) */
function format12h(timeStr: string): string {
  if (!timeStr || !timeStr.includes(':')) return timeStr;
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = String(m).padStart(2, '0');
  return `${displayH}:${displayM} ${period}`;
}

/** Compute relative time description from now */
function getRelativeRemainingText(dueTimeStr: string): string {
  if (!dueTimeStr || !dueTimeStr.includes(':')) return '';
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const [h, m] = dueTimeStr.split(':').map(Number);
  const dueMin = h * 60 + m;
  const diff = dueMin - currentMin;

  if (diff < 0) {
    const passed = Math.abs(diff);
    const hrs = Math.floor(passed / 60);
    const mins = passed % 60;
    return `Deadline passed ${hrs > 0 ? `${hrs}h ` : ''}${mins}m ago today`;
  } else if (diff === 0) {
    return 'Deadline is right now';
  } else {
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hrs > 0 ? `${hrs}h ` : ''}${mins}m remaining today`;
  }
}

export const DailyTimeSelector: React.FC<DailyTimeSelectorProps> = ({
  hasEndTime,
  onToggleHasEndTime,
  dueTime,
  onDueTimeChange,
  selectedDays,
  customizePerDay,
  onToggleCustomizePerDay,
  dayDueTimes,
  onDayDueTimesChange,
}) => {
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Parse hours and minutes
  const { hour24, minute, hour12, isPM } = useMemo(() => {
    const [h, m] = dueTime.split(':').map(Number);
    const validH = isNaN(h) ? 21 : Math.max(0, Math.min(23, h));
    const validM = isNaN(m) ? 0 : Math.max(0, Math.min(59, m));
    const isPeriodPM = validH >= 12;
    const h12 = validH % 12 === 0 ? 12 : validH % 12;
    return {
      hour24: validH,
      minute: validM,
      hour12: h12,
      isPM: isPeriodPM,
    };
  }, [dueTime]);

  const updateHour = useCallback(
    (delta: number) => {
      let nextH = (hour24 + delta) % 24;
      if (nextH < 0) nextH += 24;
      onDueTimeChange(`${String(nextH).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    },
    [hour24, minute, onDueTimeChange]
  );

  const updateMinute = useCallback(
    (delta: number) => {
      let nextTotal = hour24 * 60 + minute + delta;
      nextTotal = ((nextTotal % 1440) + 1440) % 1440;
      const nextH = Math.floor(nextTotal / 60);
      const nextM = nextTotal % 60;
      onDueTimeChange(`${String(nextH).padStart(2, '0')}:${String(nextM).padStart(2, '0')}`);
    },
    [hour24, minute, onDueTimeChange]
  );

  const togglePeriod = useCallback(() => {
    const newH = (hour24 + 12) % 24;
    onDueTimeChange(`${String(newH).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
  }, [hour24, minute, onDueTimeChange]);

  const handleSetMinute = useCallback(
    (targetMinute: number) => {
      onDueTimeChange(`${String(hour24).padStart(2, '0')}:${String(targetMinute).padStart(2, '0')}`);
    },
    [hour24, onDueTimeChange]
  );

  const handleDayTimeChange = useCallback(
    (dayVal: number, timeVal: string) => {
      onDayDueTimesChange({
        ...dayDueTimes,
        [dayVal]: timeVal,
      });
    },
    [dayDueTimes, onDayDueTimesChange]
  );

  const applyToAllDays = useCallback(() => {
    const updated: Record<number, string> = {};
    for (const d of selectedDays) {
      updated[d] = dueTime;
    }
    onDayDueTimesChange(updated);
    setCopyFeedback('Applied to all days');
    setTimeout(() => setCopyFeedback(null), 2000);
  }, [selectedDays, dueTime, onDayDueTimesChange]);

  const applyWeekdayWeekendPreset = useCallback(
    (weekdayTime: string, weekendTime: string) => {
      const updated: Record<number, string> = {};
      for (const d of selectedDays) {
        if (d === 0 || d === 6) {
          updated[d] = weekendTime;
        } else {
          updated[d] = weekdayTime;
        }
      }
      onDayDueTimesChange(updated);
      setCopyFeedback('Split weekdays & weekends');
      setTimeout(() => setCopyFeedback(null), 2000);
    },
    [selectedDays, onDayDueTimesChange]
  );

  const activePreset = useMemo(() => PRESETS.find((p) => p.time === dueTime), [dueTime]);
  const relativeText = useMemo(() => getRelativeRemainingText(dueTime), [dueTime]);

  return (
    <div className="rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 p-4 sm:p-5 space-y-4 shadow-xl backdrop-blur-md relative overflow-hidden transition-all duration-300">
      {/* Decorative background glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar with Master Toggle */}
      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              hasEndTime
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-md shadow-blue-500/20'
                : 'bg-white/5 text-zinc-500 border border-white/5'
            }`}
          >
            <Clock size={18} className={hasEndTime ? 'animate-pulse' : ''} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-fluid-sm font-bold text-white tracking-wide">
                Daily Deadline / Cut-off
              </span>
              {hasEndTime ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Strict
                </span>
              ) : (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                  Flexible
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400">
              {hasEndTime
                ? 'Complete before deadline or marked as missed'
                : 'No strict cut-off time (anytime before midnight)'}
            </p>
          </div>
        </div>

        {/* Master Neon Switch */}
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hasEndTime}
            onChange={(e) => onToggleHasEndTime(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-zinc-800/80 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-md peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-cyan-500 border border-white/10 peer-checked:border-blue-400/50"></div>
        </label>
      </div>

      {hasEndTime && (
        <div className="space-y-4 pt-1 animate-fade-in relative z-10">
          {/* Atmospheric Time of Day Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Quick Time Presets
              </span>
              <span className="text-[10px] text-zinc-500">Pick a daily anchor</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = dueTime === preset.time;
                return (
                  <button
                    type="button"
                    key={preset.id}
                    onClick={() => onDueTimeChange(preset.time)}
                    className={`relative p-2.5 rounded-xl border text-left transition-all duration-200 group overflow-hidden ${
                      isSelected
                        ? `bg-gradient-to-b ${preset.selectedBg} ${preset.selectedBorder} shadow-lg ${preset.selectedGlow} scale-[1.02]`
                        : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected ? `${preset.accent} bg-white/10` : 'text-zinc-400 bg-white/5'
                        }`}
                      >
                        <Icon size={15} />
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-sm">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div className="font-semibold text-xs text-white truncate">{preset.label}</div>
                    <div className="text-[11px] font-mono text-zinc-300 font-medium">{preset.time12}</div>
                    <div className="text-[9px] text-zinc-500 truncate mt-0.5">{preset.tagline}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Central LED Digital Clock Tuner */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 relative overflow-hidden shadow-inner">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* LED Digital Display */}
              <div className="flex items-center gap-2">
                {/* Hours Box */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => updateHour(1)}
                    className="p-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                    title="Add 1 hour"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <div className="w-16 h-14 rounded-xl bg-zinc-900/90 border border-blue-500/30 shadow-inner flex items-center justify-center text-fluid-2xl font-bold font-mono text-blue-400 tracking-wider">
                    {String(hour12).padStart(2, '0')}
                  </div>
                  <button
                    type="button"
                    onClick={() => updateHour(-1)}
                    className="p-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                    title="Minus 1 hour"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <span className="text-[10px] text-zinc-500 mt-0.5">HOUR</span>
                </div>

                {/* Blinking Colon */}
                <div className="text-2xl font-mono text-blue-400 font-bold mb-4 animate-pulse select-none">
                  :
                </div>

                {/* Minutes Box */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => updateMinute(5)}
                    className="p-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                    title="Add 5 minutes"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <div className="w-16 h-14 rounded-xl bg-zinc-900/90 border border-blue-500/30 shadow-inner flex items-center justify-center text-fluid-2xl font-bold font-mono text-cyan-400 tracking-wider">
                    {String(minute).padStart(2, '0')}
                  </div>
                  <button
                    type="button"
                    onClick={() => updateMinute(-5)}
                    className="p-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                    title="Minus 5 minutes"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <span className="text-[10px] text-zinc-500 mt-0.5">MIN</span>
                </div>

                {/* AM / PM Toggle */}
                <div className="flex flex-col gap-1.5 ml-2 mb-4">
                  <button
                    type="button"
                    onClick={() => isPM && togglePeriod()}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      !isPM
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/30 scale-105'
                        : 'bg-white/5 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => !isPM && togglePeriod()}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      isPM
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/30 scale-105'
                        : 'bg-white/5 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>

              {/* Quick Steppers & Synchronized Native Input */}
              <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-zinc-400 font-medium">Quick Minutes:</span>
                  <div className="flex gap-1">
                    {[0, 15, 30, 45].map((mVal) => (
                      <button
                        type="button"
                        key={mVal}
                        onClick={() => handleSetMinute(mVal)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors ${
                          minute === mVal
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'bg-white/5 hover:bg-white/10 text-zinc-400 border border-white/5'
                        }`}
                      >
                        :{String(mVal).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Format summary pill & native time sync */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-300 flex items-center gap-1.5">
                    <span className="text-blue-400 font-semibold">{format12h(dueTime)}</span>
                    <span className="text-zinc-500">|</span>
                    <span className="text-zinc-400">{dueTime} 24h</span>
                  </div>

                  {/* Native Time Picker trigger */}
                  <label
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white cursor-pointer transition-colors relative"
                    title="Open native clock"
                  >
                    <input
                      type="time"
                      value={dueTime}
                      onChange={(e) => onDueTimeChange(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Clock size={14} />
                  </label>
                </div>

                {relativeText && (
                  <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <Zap size={10} className="text-amber-400" />
                    <span>{relativeText}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Per-Day Custom Schedule Section */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => onToggleCustomizePerDay(!customizePerDay)}
                className="flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors py-1 group"
              >
                <div className="w-5 h-5 rounded-md bg-blue-500/10 group-hover:bg-blue-500/20 flex items-center justify-center">
                  <Calendar size={12} className="text-blue-400" />
                </div>
                <span>
                  {customizePerDay ? 'Collapse per-day schedule' : 'Customize end time per day'}
                </span>
                {customizePerDay ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {customizePerDay && (
                <span className="text-[10px] text-zinc-500">
                  {selectedDays.length} {selectedDays.length === 1 ? 'day' : 'days'} active
                </span>
              )}
            </div>

            {customizePerDay && (
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-3 animate-fade-in">
                {/* Quick Schedule Action Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-white/5">
                  <button
                    type="button"
                    onClick={applyToAllDays}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition-colors"
                  >
                    <Copy size={11} /> Apply {format12h(dueTime)} to all
                  </button>
                  <button
                    type="button"
                    onClick={() => applyWeekdayWeekendPreset('18:00', '22:00')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition-colors"
                  >
                    <Zap size={11} className="text-amber-400" /> Weekdays 6PM / Weekends 10PM
                  </button>
                  <button
                    type="button"
                    onClick={() => onDayDueTimesChange({})}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-red-300 border border-white/10 transition-colors ml-auto"
                    title="Reset to default"
                  >
                    <RotateCcw size={11} /> Reset
                  </button>
                </div>

                {copyFeedback && (
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1 animate-fade-in font-medium">
                    <Check size={12} /> {copyFeedback}
                  </div>
                )}

                {/* Day Matrix Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DAYS_META.filter((d) => selectedDays.includes(d.value)).map((d) => {
                    const currentVal = dayDueTimes[d.value] || dueTime;
                    const isCustomized = Boolean(dayDueTimes[d.value]);
                    return (
                      <div
                        key={d.value}
                        className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                          isCustomized
                            ? 'bg-blue-500/10 border-blue-500/30'
                            : 'bg-white/[0.02] border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-white font-mono">
                            {d.label}
                          </span>
                          <div>
                            <span className="text-xs text-white font-medium block">{d.full}</span>
                            <span className="text-[10px] text-zinc-400 block font-mono">
                              {format12h(currentVal)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <input
                            type="time"
                            value={currentVal}
                            onChange={(e) => handleDayTimeChange(d.value, e.target.value)}
                            className="glass-input p-1.5 rounded-lg text-xs font-mono text-white bg-black/60 border border-white/15 focus:border-blue-400 w-28 text-center"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Gamified Deadline Rule Notice */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-900/20 via-indigo-900/20 to-purple-900/20 border border-blue-500/30 flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle size={14} />
            </div>
            <div className="text-[11px] leading-relaxed text-zinc-300">
              <span className="font-semibold text-white">Daily Lock Rule: </span>
              Habit must be logged before{' '}
              <strong className="text-cyan-300 font-mono">{format12h(dueTime)}</strong>. If not
              completed before the deadline, it will be marked as{' '}
              <strong className="text-rose-400">Missed / Not Done</strong> for that day and no XP
              will be awarded.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
