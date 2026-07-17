'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { toast } from 'sonner';

export interface ReposicionItem {
  id: string;
  ofertaId: number;
  tipoDocumento: string;
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  segmento: string;
  zona: string;
  agencia: string;
  canal: string;
  tipoCliente: string;
  campaniaCodigo: string;
  campaniaNombre: string;
  monto: number;
  tasa: number;
  fechaOferta: string;
  estado: string;
}

interface ReposicionContextType {
  items: ReposicionItem[];
  agregar: (item: Omit<ReposicionItem, 'id'>) => void;
  eliminar: (id: string) => void;
  limpiar: () => void;
  exportarCsv: () => void;
  cantidad: number;
}

const STORAGE_KEY = 'bi_reposicion_ofertas';

function cargarStorage(): ReposicionItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function guardarStorage(items: ReposicionItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const ReposicionContext = createContext<ReposicionContextType | null>(null);

export function ReposicionProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ReposicionItem[]>([]);

  useEffect(() => {
    setItems(cargarStorage());
  }, []);

  useEffect(() => {
    guardarStorage(items);
  }, [items]);

  const agregar = useCallback((item: Omit<ReposicionItem, 'id'>) => {
    let duplicado = false;
    setItems(prev => {
      const existe = prev.find(i => i.ofertaId === item.ofertaId);
      if (existe) {
        duplicado = true;
        return prev;
      }
      const nuevo: ReposicionItem = {
        ...item,
        id: crypto.randomUUID(),
      };
      return [...prev, nuevo];
    });
    if (duplicado) {
      toast.error('Este lead ya se encuentra en la tabla de reposición');
    } else {
      toast.success('Lead agregado a la tabla de reposición');
    }
  }, []);

  const eliminar = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const limpiar = useCallback(() => {
    setItems([]);
  }, []);

  const exportarCsv = useCallback(() => {
    if (items.length === 0) {
      toast.error('No hay leads en la tabla de reposición');
      return;
    }

    const encabezados = [
      'campaniaCodigo',
      'campaniaNombre',
      'monto',
      'tasa',
      'fechaOferta',
      'estado',
      'tipoDocumento',
      'numeroDocumento',
      'primerNombre',
      'segundoNombre',
      'apellidoPaterno',
      'apellidoMaterno',
      'fechaNacimiento',
      'segmento',
      'zona',
      'agencia',
      'canal',
      'tipoCliente',
    ];

    const separador = ',';
    const filas = items.map(i => [
      i.campaniaCodigo,
      i.campaniaNombre,
      i.monto.toFixed(2),
      i.tasa?.toFixed(2) ?? '',
      i.fechaOferta,
      i.estado,
      i.tipoDocumento,
      i.numeroDocumento,
      i.primerNombre ?? '',
      i.segundoNombre ?? '',
      i.apellidoPaterno ?? '',
      i.apellidoMaterno ?? '',
      i.fechaNacimiento ?? '',
      i.segmento ?? '',
      i.zona ?? '',
      i.agencia ?? '',
      i.canal ?? '',
      i.tipoCliente ?? '',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(separador));

    const csv = [encabezados.join(separador), ...filas].join('\r\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reposicion_ofertas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado correctamente');
  }, [items]);

  const value: ReposicionContextType = {
    items,
    agregar,
    eliminar,
    limpiar,
    exportarCsv,
    cantidad: items.length,
  };

  return (
    <ReposicionContext.Provider value={value}>
      {children}
    </ReposicionContext.Provider>
  );
}

export function useReposicion(): ReposicionContextType {
  const ctx = useContext(ReposicionContext);
  if (!ctx) {
    throw new Error('useReposicion debe usarse dentro de ReposicionProvider');
  }
  return ctx;
}
