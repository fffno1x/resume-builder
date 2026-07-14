import { useMemo, useRef, useState } from "react";
import { Columns2, Redo2, RotateCcw, Undo2, X } from "lucide-react";
import type { ResumeData, ResumeSectionId } from "../../types/resume";
import type { TemplateElement, TemplateSchema } from "../../types/template";
import { ResumePreview } from "../preview/ResumePreview";

type Props = {
  data: ResumeData;
  template: TemplateSchema;
  referenceImage: string;
  onChange: (template: TemplateSchema) => void;
  onClose: () => void;
};

export function TemplateDesigner({ data, onChange, onClose, referenceImage, template }: Props) {
  const initialRef = useRef(structuredClone(template));
  const [history, setHistory] = useState<TemplateSchema[]>([]);
  const [future, setFuture] = useState<TemplateSchema[]>([]);
  const [selectedId, setSelectedId] = useState(template.header[0]?.id ?? "");
  const [referenceOpacity, setReferenceOpacity] = useState(35);
  const selected = template.header.find((item) => item.id === selectedId) ?? null;

  const commit = (next: TemplateSchema) => { setHistory((items) => [...items.slice(-29), structuredClone(template)]); setFuture([]); onChange(next); };
  const patchElement = (patch: Partial<TemplateElement>) => commit({ ...template, header: template.header.map((item) => item.id === selectedId ? { ...item, ...patch } : item) });
  const patchStyle = (patch: Partial<TemplateElement["style"]>) => selected && patchElement({ style: { ...selected.style, ...patch } });
  const undo = () => { const previous = history[history.length - 1]; if (!previous) return; setHistory((items) => items.slice(0, -1)); setFuture((items) => [structuredClone(template), ...items]); onChange(previous); };
  const redo = () => { const next = future[0]; if (!next) return; setFuture((items) => items.slice(1)); setHistory((items) => [...items, structuredClone(template)]); onChange(next); };
  const reset = () => { commit(structuredClone(initialRef.current)); };

  const setColumnCount = (count: 1 | 2) => {
    const ids = template.columns.flatMap((column) => column.sectionIds);
    const columns = count === 1
      ? [{ id: "main", x: 14, width: 182, sectionIds: ids, gap: 4 }]
      : [
          { id: "left", x: 14, width: 55, sectionIds: ids.filter((_, index) => index % 2 === 0), gap: 4 },
          { id: "right", x: 75, width: 121, sectionIds: ids.filter((_, index) => index % 2 === 1), gap: 4 },
        ];
    commit({ ...template, columns });
  };

  const moveSection = (sectionId: ResumeSectionId, columnId: string) => {
    commit({ ...template, columns: template.columns.map((column) => ({ ...column, sectionIds: column.id === columnId ? [...column.sectionIds.filter((id) => id !== sectionId), sectionId] : column.sectionIds.filter((id) => id !== sectionId) })) });
  };

  const labels = useMemo(() => new Map(data.sections.map((item) => [item.id, item.title])), [data.sections]);

  return (
    <div className="template-designer">
      <div className="designer-toolbar">
        <strong>模板设计</strong>
        <div className="designer-actions">
          <button className="icon-button" disabled={!history.length} onClick={undo} title="撤销" type="button"><Undo2 size={16} /></button>
          <button className="icon-button" disabled={!future.length} onClick={redo} title="重做" type="button"><Redo2 size={16} /></button>
          <button className="icon-button" onClick={reset} title="恢复初始模板" type="button"><RotateCcw size={16} /></button>
          <button className="icon-button" onClick={onClose} title="退出模板设计" type="button"><X size={17} /></button>
        </div>
      </div>
      <div className="designer-layout">
        <div className="designer-canvas-wrap">
          <div className="designer-canvas">
            {referenceImage ? <img alt="参考模板" className="designer-reference" src={referenceImage} style={{ opacity: referenceOpacity / 100 }} /> : null}
            <ResumePreview customTemplate={template} data={data} template={`custom:${template.id}`} />
            <div className="designer-hit-layer">
              {template.header.map((item) => <DraggableElement element={item} key={item.id} onCommit={(patch) => { setSelectedId(item.id); commit({ ...template, header: template.header.map((value) => value.id === item.id ? { ...value, ...patch } : value) }); }} onSelect={() => setSelectedId(item.id)} selected={item.id === selectedId} />)}
            </div>
          </div>
        </div>
        <aside className="designer-inspector">
          <label>模板名称<input className="designer-text-input" maxLength={40} onChange={(event) => commit({ ...template, name: event.target.value })} type="text" value={template.name} /></label>
          {referenceImage ? <label>参考图透明度<input max={80} min={0} onChange={(event) => setReferenceOpacity(Number(event.target.value))} type="range" value={referenceOpacity} /></label> : null}
          <div className="segmented-control"><button className={template.columns.length === 1 ? "active" : ""} onClick={() => setColumnCount(1)} type="button">单栏</button><button className={template.columns.length === 2 ? "active" : ""} onClick={() => setColumnCount(2)} type="button"><Columns2 size={14} /> 双栏</button></div>
          <label>页面背景<input onChange={(event) => commit({ ...template, page: { ...template.page, background: event.target.value } })} type="color" value={template.page.background} /></label>
          <label>正文字号<input max={18} min={7} onChange={(event) => commit({ ...template, typography: { ...template.typography, bodySize: Number(event.target.value) } })} type="number" value={template.typography.bodySize} /></label>
          <label>中文字体<select onChange={(event) => commit({ ...template, typography: { ...template.typography, fontFamily: event.target.value as TemplateSchema["typography"]["fontFamily"] } })} value={template.typography.fontFamily}><option>Microsoft YaHei</option><option>SimSun</option><option>Arial</option><option>Georgia</option></select></label>
          <label>行距<input max={2} min={1} onChange={(event) => commit({ ...template, typography: { ...template.typography, lineHeight: Number(event.target.value) } })} step="0.05" type="number" value={template.typography.lineHeight} /></label>
          <label>标题字号<input max={24} min={8} onChange={(event) => commit({ ...template, typography: { ...template.typography, sectionTitleSize: Number(event.target.value) } })} type="number" value={template.typography.sectionTitleSize} /></label>
          <label>板块标题颜色<input onChange={(event) => commit({ ...template, typography: { ...template.typography, sectionTitleColor: event.target.value } })} type="color" value={template.typography.sectionTitleColor} /></label>
          {selected ? <div className="inspector-group"><h3>{bindingLabel(selected.binding)}</h3><NumberControl label="X" value={selected.x} onChange={(x) => patchElement({ x })} /><NumberControl label="Y" value={selected.y} onChange={(y) => patchElement({ y })} /><NumberControl label="宽度" value={selected.width} onChange={(width) => patchElement({ width })} />{selected.height != null ? <NumberControl label="高度" value={selected.height} onChange={(height) => patchElement({ height })} /> : null}<NumberControl label="字号" value={selected.style.fontSize} onChange={(fontSize) => patchStyle({ fontSize })} /><label>字重<select onChange={(event) => patchStyle({ fontWeight: Number(event.target.value) as TemplateElement["style"]["fontWeight"] })} value={selected.style.fontWeight}><option value="400">常规</option><option value="600">半粗</option><option value="700">粗体</option><option value="800">特粗</option></select></label><label>颜色<input onChange={(event) => patchStyle({ color: event.target.value })} type="color" value={selected.style.color} /></label></div> : null}
          <div className="inspector-group"><h3>栏位尺寸</h3>{template.columns.map((column, index) => <div className="column-control" key={column.id}><strong>{column.id === "main" ? "主栏" : column.id === "left" ? "左栏" : "右栏"}</strong><NumberControl label="X" value={column.x} onChange={(x) => commit({ ...template, columns: template.columns.map((item, itemIndex) => itemIndex === index ? { ...item, x } : item) })} /><NumberControl label="宽度" value={column.width} onChange={(width) => commit({ ...template, columns: template.columns.map((item, itemIndex) => itemIndex === index ? { ...item, width } : item) })} /><NumberControl label="板块间距" value={column.gap} onChange={(gap) => commit({ ...template, columns: template.columns.map((item, itemIndex) => itemIndex === index ? { ...item, gap } : item) })} /></div>)}</div>
          <div className="inspector-group"><h3>板块栏位</h3>{template.columns.flatMap((column) => column.sectionIds.map((id) => <label key={id}>{labels.get(id) ?? id}<select onChange={(event) => moveSection(id, event.target.value)} value={column.id}>{template.columns.map((option) => <option key={option.id} value={option.id}>{option.id === "main" ? "主栏" : option.id === "left" ? "左栏" : "右栏"}</option>)}</select></label>))}</div>
        </aside>
      </div>
    </div>
  );
}

function DraggableElement({ element, onCommit, onSelect, selected }: { element: TemplateElement; onCommit: (patch: Partial<TemplateElement>) => void; onSelect: () => void; selected: boolean }) {
  const start = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  return <button className={`designer-hit ${selected ? "selected" : ""}`} onClick={onSelect} onPointerDown={(event) => { onSelect(); start.current = { x: event.clientX, y: event.clientY, left: element.x, top: element.y }; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerUp={(event) => { if (!start.current) return; const rect = event.currentTarget.parentElement?.getBoundingClientRect(); if (rect) onCommit({ x: clamp(start.current.left + (event.clientX - start.current.x) / rect.width * 210, 0, 210 - element.width), y: clamp(start.current.top + (event.clientY - start.current.y) / rect.height * 297, 0, 80) }); start.current = null; }} style={{ height: `${element.height ?? 8}mm`, left: `${element.x}mm`, top: `${element.y}mm`, width: `${element.width}mm` }} type="button"><span>{bindingLabel(element.binding)}</span></button>;
}
function NumberControl({ label, onChange, value }: { label: string; onChange: (value: number) => void; value: number }) { return <label>{label}<input onChange={(event) => onChange(Number(event.target.value))} step="0.5" type="number" value={Number(value.toFixed(1))} /></label>; }
function bindingLabel(value: TemplateElement["binding"]) { return ({ name: "姓名", title: "求职方向", contact: "联系方式", photo: "照片" })[value]; }
function clamp(value: number, min: number, max: number) { return Math.min(Math.max(value, min), max); }
