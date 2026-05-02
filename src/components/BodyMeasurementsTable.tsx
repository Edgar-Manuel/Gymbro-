import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { BodyMeasurement } from '@/types';
import { readField } from '@/utils/bodyCalculations';
import { type Units, DEFAULT_UNITS, weightFromBase, lengthFromBase } from '@/utils/units';
import { Pencil, Trash2, Download, ArrowUpDown, ArrowUp, ArrowDown, History } from 'lucide-react';
import { toast } from 'sonner';

type ColumnKey = 'fecha' | 'peso' | 'grasaCorporal' | 'pecho' | 'cintura' | 'cadera'
  | 'brazoDerecho' | 'brazoIzquierdo' | 'musloDerecho' | 'musloIzquierdo'
  | 'pantorrillaDerecha' | 'pantorrillaIzquierda';

type ColumnType = 'date' | 'weight' | 'percent' | 'length';

interface ColumnDef {
  key: ColumnKey;
  label: string;
  type: ColumnType;
  alwaysVisible?: boolean;
}

const COLUMNS: ColumnDef[] = [
  { key: 'fecha',                label: 'Fecha',     type: 'date',    alwaysVisible: true },
  { key: 'peso',                 label: 'Peso',      type: 'weight',  alwaysVisible: true },
  { key: 'grasaCorporal',        label: '% Grasa',   type: 'percent' },
  { key: 'pecho',                label: 'Pecho',     type: 'length' },
  { key: 'cintura',              label: 'Cintura',   type: 'length',  alwaysVisible: true },
  { key: 'cadera',               label: 'Cadera',    type: 'length' },
  { key: 'brazoDerecho',         label: 'Brazo D',   type: 'length' },
  { key: 'brazoIzquierdo',       label: 'Brazo I',   type: 'length' },
  { key: 'musloDerecho',         label: 'Muslo D',   type: 'length' },
  { key: 'musloIzquierdo',       label: 'Muslo I',   type: 'length' },
  { key: 'pantorrillaDerecha',   label: 'Pant. D',   type: 'length' },
  { key: 'pantorrillaIzquierda', label: 'Pant. I',   type: 'length' },
];

function unitLabel(col: ColumnDef, units: Units): string | null {
  if (col.type === 'weight') return units.weight;
  if (col.type === 'length') return units.length;
  if (col.type === 'percent') return '%';
  return null;
}

function convertValue(col: ColumnDef, baseValue: number | undefined, units: Units): number | undefined {
  if (baseValue == null) return undefined;
  if (col.type === 'weight') return weightFromBase(baseValue, units.weight);
  if (col.type === 'length') return lengthFromBase(baseValue, units.length);
  return baseValue; // percent o date
}

type SortDir = 'asc' | 'desc';

interface Props {
  measurements: BodyMeasurement[];
  units?: Units;
  onEdit: (m: BodyMeasurement) => void;
  onDelete: (m: BodyMeasurement) => void;
}

function getCellValue(m: BodyMeasurement, key: ColumnKey): number | undefined {
  if (key === 'fecha') return new Date(m.fecha).getTime();
  if (key === 'peso' || key === 'grasaCorporal') return m[key] ?? undefined;
  return readField(m, key as any);
}

function formatCell(m: BodyMeasurement, col: ColumnDef, units: Units): string {
  if (col.key === 'fecha') {
    return new Date(m.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' });
  }
  const baseV = getCellValue(m, col.key);
  const conv = convertValue(col, baseV, units);
  if (conv == null) return '—';
  return conv.toFixed(1);
}

function exportToCsv(measurements: BodyMeasurement[], units: Units) {
  const headers = COLUMNS.map(c => {
    const u = unitLabel(c, units);
    return c.label + (u ? ` (${u})` : '');
  });
  const rows = measurements.map(m =>
    COLUMNS.map(c => {
      if (c.key === 'fecha') return new Date(m.fecha).toISOString().slice(0, 10);
      const v = convertValue(c, getCellValue(m, c.key), units);
      return v == null ? '' : v.toFixed(2);
    }),
  );
  const csv = [headers, ...rows]
    .map(row => row.map(cell => {
      const s = String(cell);
      // Escape: si contiene ; , " o \n → wrap en comillas y duplicar comillas internas
      return /[;,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(';'))
    .join('\n');

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mediciones-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function BodyMeasurementsTable({ measurements, units = DEFAULT_UNITS, onEdit, onDelete }: Props) {
  const [sortKey, setSortKey] = useState<ColumnKey>('fecha');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  if (measurements.length === 0) return null;

  const sorted = [...measurements].sort((a, b) => {
    const va = getCellValue(a, sortKey);
    const vb = getCellValue(b, sortKey);
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    return sortDir === 'asc' ? va - vb : vb - va;
  });

  const toggleSort = (key: ColumnKey) => {
    if (key === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const handleExport = () => {
    if (measurements.length === 0) {
      toast.error('No hay mediciones para exportar');
      return;
    }
    exportToCsv(sorted, units);
    toast.success(`${measurements.length} mediciones exportadas`);
  };

  const SortIcon = ({ k }: { k: ColumnKey }) =>
    k !== sortKey
      ? <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-30" />
      : sortDir === 'asc'
        ? <ArrowUp className="w-3 h-3 inline ml-1" />
        : <ArrowDown className="w-3 h-3 inline ml-1" />;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium flex items-center gap-2">
          <History className="w-4 h-4" />
          Historial completo ({measurements.length})
        </h4>
        <Button variant="outline" size="sm" onClick={handleExport} className="h-8 text-xs">
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Exportar CSV
        </Button>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs">
            <tr>
              {COLUMNS.map(col => {
                const u = unitLabel(col, units);
                return (
                  <th
                    key={col.key}
                    className={`px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap cursor-pointer hover:text-foreground select-none ${
                      col.alwaysVisible ? '' : 'hidden md:table-cell'
                    }`}
                    onClick={() => toggleSort(col.key)}
                  >
                    {col.label}
                    {u && <span className="text-muted-foreground/60"> ({u})</span>}
                    <SortIcon k={col.key} />
                  </th>
                );
              })}
              <th className="px-2 py-2 text-right font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m, idx) => (
              <tr
                key={m.id}
                className={`border-t ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'} hover:bg-accent/50`}
              >
                {COLUMNS.map(col => (
                  <td
                    key={col.key}
                    className={`px-3 py-2 whitespace-nowrap ${col.alwaysVisible ? '' : 'hidden md:table-cell'} ${
                      getCellValue(m, col.key) == null ? 'text-muted-foreground/40' : ''
                    }`}
                  >
                    {formatCell(m, col, units)}
                  </td>
                ))}
                <td className="px-2 py-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onEdit(m)}
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => onDelete(m)}
                      title="Borrar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-muted-foreground mt-2 md:hidden">
        Desliza horizontalmente para ver todas las columnas →
      </p>
    </div>
  );
}
