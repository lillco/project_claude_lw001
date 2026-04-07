import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const modes = [
  { key: 'system', icon: Monitor, label: 'System' },
  { key: 'light', icon: Sun, label: 'Hell' },
  { key: 'dark', icon: Moon, label: 'Dunkel' },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const currentIndex = modes.findIndex((m) => m.key === theme);
  const next = modes[(currentIndex + 1) % modes.length];
  const current = modes[currentIndex];
  const Icon = current.icon;

  return (
    <button
      onClick={() => setTheme(next.key)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white text-sm"
      title={`Darstellung: ${current.label}`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{current.label}</span>
    </button>
  );
}
