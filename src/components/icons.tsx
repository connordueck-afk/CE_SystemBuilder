/**
 * Shared icon wrapper — all app icons are imported from lucide-react through
 * this module so sizing and styling stays consistent. To switch icon libraries
 * or adjust defaults, change only this file.
 */
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  Sun,
  Moon,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  X,
  Plus,
  Minus,
  Search,
  FileDown,
  Share2,
  RotateCcw,
  Save,
  FolderOpen,
  Palette,
  Bug,
  Maximize2,
  Route,
  type LucideIcon,
} from 'lucide-react';

type IconSize = number;

interface IconProps {
  size?: IconSize;
  className?: string;
  strokeWidth?: number;
}

function withDefaults(Icon: LucideIcon, defaultSize: IconSize = 18): React.FC<IconProps> {
  const Wrapped: React.FC<IconProps> = ({ size = defaultSize, className, strokeWidth = 1.8 }) => (
    <Icon size={size} className={className} strokeWidth={strokeWidth} />
  );
  Wrapped.displayName = `Icon(${Icon.displayName ?? Icon.name})`;
  return Wrapped;
}

// --- Navigation / UI chrome (16px default) ---
export const IconChevronDown    = withDefaults(ChevronDown, 14);
export const IconChevronRight   = withDefaults(ChevronRight, 14);
export const IconChevronLeft    = withDefaults(ChevronLeft, 14);
export const IconChevronUp      = withDefaults(ChevronUp, 14);

// --- Theme ---
export const IconSun  = withDefaults(Sun, 16);
export const IconMoon = withDefaults(Moon, 16);

// --- Actions ---
export const IconSettings    = withDefaults(Settings, 18);
export const IconSearch      = withDefaults(Search, 16);
export const IconClose       = withDefaults(X, 18);
export const IconSave        = withDefaults(Save, 16);
export const IconFolderOpen  = withDefaults(FolderOpen, 16);
export const IconShare       = withDefaults(Share2, 16);
export const IconRotateCcw   = withDefaults(RotateCcw, 16);
export const IconFileDown    = withDefaults(FileDown, 16);
export const IconPalette     = withDefaults(Palette, 16);
export const IconBug         = withDefaults(Bug, 16);
export const IconMaximize    = withDefaults(Maximize2, 16);
export const IconRoute       = withDefaults(Route, 16);

// --- Panels ---
export const IconPanelLeftClose  = withDefaults(PanelLeftClose, 18);
export const IconPanelLeftOpen   = withDefaults(PanelLeftOpen, 18);
export const IconPanelRightClose = withDefaults(PanelRightClose, 18);
export const IconPanelRightOpen  = withDefaults(PanelRightOpen, 18);

// --- Status ---
export const IconAlertTriangle = withDefaults(AlertTriangle, 16);
export const IconAlertCircle   = withDefaults(AlertCircle, 16);
export const IconInfo          = withDefaults(Info, 16);
export const IconCheckCircle   = withDefaults(CheckCircle2, 16);

// --- Expand/collapse ---
export const IconPlus  = withDefaults(Plus, 14);
export const IconMinus = withDefaults(Minus, 14);
