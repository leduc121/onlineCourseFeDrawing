import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import DrawingToolbar, { DrawingTool } from './DrawingToolbar';

interface DrawingCanvasProps {
  onSave?: (imageData: string) => Promise<void>;
  isLoading?: boolean;
  initialImage?: string;
  submissionId?: string;
}

type Point = { x: number; y: number };

const PAPER_COLOR = '#fffdf8';

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  onSave,
  isLoading = false,
  initialImage,
  submissionId
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const startPointRef = useRef<Point | null>(null);
  const snapshotRef = useRef<ImageData | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(4);
  const [color, setColor] = useState('#201a17');
  const [tool, setTool] = useState<DrawingTool>('pen');
  const [historyStack, setHistoryStack] = useState<ImageData[]>([]);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setupCanvas = () => {
      const nextCanvas = canvasRef.current;
      if (!nextCanvas) return;

      const rect = nextCanvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const dpr = window.devicePixelRatio || 1;
      nextCanvas.width = Math.floor(rect.width * dpr);
      nextCanvas.height = Math.floor(rect.height * dpr);

      const ctx = nextCanvas.getContext('2d');
      if (!ctx) return;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.fillStyle = PAPER_COLOR;
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctxRef.current = ctx;
      setCanvasReady(true);

      if (initialImage) {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
          const scale = Math.min(rect.width / image.width, rect.height / image.height);
          const drawWidth = image.width * scale;
          const drawHeight = image.height * scale;
          const x = (rect.width - drawWidth) / 2;
          const y = (rect.height - drawHeight) / 2;
          ctx.drawImage(image, x, y, drawWidth, drawHeight);
          saveHistory();
        };
        image.src = initialImage;
      } else {
        saveHistory();
      }
    };

    const frame = requestAnimationFrame(setupCanvas);
    return () => cancelAnimationFrame(frame);
  }, [initialImage]);

  const saveHistory = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistoryStack(prev => [...prev, snapshot]);
  };

  const restoreSnapshot = () => {
    const ctx = ctxRef.current;
    if (!ctx || !snapshotRef.current) return;
    ctx.putImageData(snapshotRef.current, 0, 0);
  };

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  const drawShape = (ctx: CanvasRenderingContext2D, start: Point, current: Point) => {
    if (tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(current.x, current.y);
      ctx.stroke();
      return;
    }

    if (tool === 'rectangle') {
      const width = current.x - start.x;
      const height = current.y - start.y;
      ctx.strokeRect(start.x, start.y, width, height);
      return;
    }

    if (tool === 'circle') {
      const radius = Math.sqrt((current.x - start.x) ** 2 + (current.y - start.y) ** 2);
      ctx.beginPath();
      ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    const point = getPoint(event);
    if (!ctx || !canvas || !point) return;

    canvas.setPointerCapture(event.pointerId);
    setIsDrawing(true);
    startPointRef.current = point;
    snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = tool === 'eraser' ? PAPER_COLOR : color;

    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = ctxRef.current;
    const point = getPoint(event);
    if (!isDrawing || !ctx || !point || !startPointRef.current) return;

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = tool === 'eraser' ? PAPER_COLOR : color;

    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      return;
    }

    restoreSnapshot();
    drawShape(ctx, startPointRef.current, point);
  };

  const finishStroke = () => {
    const ctx = ctxRef.current;
    if (!ctx || !isDrawing) return;

    ctx.closePath();
    setIsDrawing(false);
    startPointRef.current = null;
    snapshotRef.current = null;
    saveHistory();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = PAPER_COLOR;
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHistoryStack([]);
    saveHistory();
  };

  const undo = () => {
    const ctx = ctxRef.current;
    if (!ctx || historyStack.length <= 1) return;

    const nextHistory = [...historyStack];
    nextHistory.pop();
    const previousImage = nextHistory[nextHistory.length - 1];
    if (!previousImage) return;

    ctx.putImageData(previousImage, 0, 0);
    setHistoryStack(nextHistory);
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `artacademy-drawing-${Date.now()}.png`;
    link.click();
  };

  const handleSave = async () => {
    if (!canvasRef.current || !onSave) return;

    try {
      await onSave(canvasRef.current.toDataURL('image/png'));
    } catch (error) {
      console.error('Failed to save drawing:', error);
      alert('Failed to save drawing');
    }
  };

  return (
    <section className="overflow-hidden rounded-[32px] border border-[#e5d9ca] bg-[linear-gradient(180deg,#fffdf8_0%,#f4ede3_100%)] shadow-[0_24px_60px_rgba(32,18,10,0.12)]">
      <div className="border-b border-[#ece0d2] px-5 py-5 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#eadbcb] bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7f72]">
              <Sparkles size={12} strokeWidth={1.8} />
              Drawing Studio
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#201a17]">Build the artwork directly on canvas</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6e6055]">
              Sketch, block shapes, refine lines, and export or save a polished submission without leaving the lesson.
            </p>
          </div>
          <div className="grid gap-2 text-sm text-[#6e6055] md:text-right">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#fff6ed] px-3 py-1 font-medium text-[#8d4b31]">
              <CheckCircle2 size={14} strokeWidth={1.8} />
              {submissionId ? 'Connected to submission' : 'Ready for a new submission'}
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-[#9c8f84]">
              Tool: {tool} | Brush: {lineWidth}px
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 md:p-6">
        <DrawingToolbar
          color={color}
          onColorChange={setColor}
          lineWidth={lineWidth}
          onLineWidthChange={setLineWidth}
          tool={tool}
          onToolChange={setTool}
          onUndo={undo}
          onClear={clearCanvas}
          onDownload={downloadDrawing}
          canUndo={historyStack.length > 1}
        />

        <div className="overflow-hidden rounded-[30px] border border-[#dfd1c2] bg-[linear-gradient(180deg,#f6efe5_0%,#fdf9f2_100%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] md:p-4">
          <div className="rounded-[24px] border border-[#e7ddd2] bg-white p-3 shadow-[0_18px_40px_rgba(32,18,10,0.08)]">
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={finishStroke}
              onPointerLeave={finishStroke}
              className={`block w-full rounded-[18px] bg-[#fffdf8] ${
                tool === 'eraser' ? 'cursor-cell' : 'cursor-crosshair'
              }`}
              style={{ minHeight: '520px', touchAction: 'none' }}
            />
          </div>
        </div>

        {onSave && (
          <div className="flex flex-col gap-4 rounded-[28px] border border-[#eadccc] bg-white/80 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#251b16]">Save your current draft</p>
              <p className="mt-1 text-sm text-[#716357]">
                Keep a clean checkpoint before moving on to shading, color balance, or final submission.
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={isLoading || !canvasReady}
              className="inline-flex items-center justify-center rounded-2xl bg-[#201a17] px-6 py-3 text-sm font-bold text-[#fff9f4] transition-all hover:-translate-y-0.5 hover:bg-[#312722] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Saving draft...' : 'Save Drawing'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default DrawingCanvas;
