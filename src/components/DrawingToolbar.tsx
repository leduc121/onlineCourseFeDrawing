import React from 'react';
import {
  Circle,
  Download,
  Eraser,
  Minus,
  PenTool,
  RotateCcw,
  Square,
  Trash2,
} from 'lucide-react';

export type DrawingTool = 'pen' | 'eraser' | 'line' | 'rectangle' | 'circle';

export interface DrawingToolbarProps {
  color: string;
  onColorChange: (color: string) => void;
  lineWidth: number;
  onLineWidthChange: (width: number) => void;
  tool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  onUndo: () => void;
  onClear: () => void;
  onDownload: () => void;
  canUndo: boolean;
}

const tools: Array<{ id: DrawingTool; label: string; icon: React.ReactNode }> = [
  { id: 'pen', label: 'Pen', icon: <PenTool size={16} strokeWidth={1.8} /> },
  { id: 'eraser', label: 'Eraser', icon: <Eraser size={16} strokeWidth={1.8} /> },
  { id: 'line', label: 'Line', icon: <Minus size={16} strokeWidth={1.8} /> },
  { id: 'rectangle', label: 'Frame', icon: <Square size={16} strokeWidth={1.8} /> },
  { id: 'circle', label: 'Circle', icon: <Circle size={16} strokeWidth={1.8} /> },
];

const presetColors = ['#201a17', '#7c3f2c', '#bf5b32', '#c89f65', '#698b74', '#4b6a88', '#8c5a7f'];

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  color,
  onColorChange,
  lineWidth,
  onLineWidthChange,
  tool,
  onToolChange,
  onUndo,
  onClear,
  onDownload,
  canUndo
}) => {
  return (
    <div className="rounded-[28px] border border-[#e5d9ca] bg-[linear-gradient(180deg,#fffdf8_0%,#f6f0e8_100%)] p-4 shadow-[0_12px_30px_rgba(32,18,10,0.08)]">
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr_1fr_auto]">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7f72]">Tools</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {tools.map((item) => {
              const isActive = tool === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onToolChange(item.id)}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition-all active:scale-[0.98] ${
                    isActive
                      ? 'border-[#7c3f2c] bg-[#201a17] text-[#fff9f4] shadow-[0_10px_24px_rgba(32,18,10,0.18)]'
                      : 'border-[#ded2c4] bg-white text-[#3a2f2a] hover:border-[#c6b7a7] hover:bg-[#fcf7f1]'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7f72]">Palette</p>
          <div className="mt-3 flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => onColorChange(e.target.value)}
              className="h-11 w-14 cursor-pointer rounded-2xl border border-[#ded2c4] bg-white p-1"
              title="Custom color"
            />
            <div className="flex flex-wrap gap-2">
              {presetColors.map((preset) => (
                <button
                  key={preset}
                  onClick={() => onColorChange(preset)}
                  className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                    color === preset ? 'border-[#201a17]' : 'border-white'
                  }`}
                  style={{ backgroundColor: preset }}
                  title={preset}
                />
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7f72]">Brush Size</p>
          <div className="mt-3 rounded-2xl border border-[#e3d6c8] bg-white px-4 py-3">
            <input
              type="range"
              min="1"
              max="28"
              value={lineWidth}
              onChange={(e) => onLineWidthChange(parseInt(e.target.value, 10))}
              className="w-full cursor-pointer accent-[#7c3f2c]"
            />
            <div className="mt-2 flex items-center justify-between text-xs font-medium text-[#76665b]">
              <span>Fine</span>
              <span>{lineWidth}px</span>
              <span>Bold</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7f72]">Actions</p>
          <div className="mt-3 flex flex-wrap gap-2 lg:justify-end">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="inline-flex items-center gap-2 rounded-2xl border border-[#ded2c4] bg-white px-3 py-2 text-sm font-semibold text-[#3a2f2a] transition-all hover:bg-[#f7efe6] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw size={16} strokeWidth={1.8} />
              Undo
            </button>
            <button
              onClick={onClear}
              className="inline-flex items-center gap-2 rounded-2xl border border-[#ead2cb] bg-[#fff7f4] px-3 py-2 text-sm font-semibold text-[#9a4d38] transition-all hover:bg-[#fdece6]"
            >
              <Trash2 size={16} strokeWidth={1.8} />
              Clear
            </button>
            <button
              onClick={onDownload}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#201a17] px-3 py-2 text-sm font-semibold text-[#fff9f4] transition-all hover:bg-[#312722]"
            >
              <Download size={16} strokeWidth={1.8} />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawingToolbar;
