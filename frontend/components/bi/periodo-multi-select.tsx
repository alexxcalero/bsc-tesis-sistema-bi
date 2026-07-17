'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar, X } from 'lucide-react';

interface PeriodoItem {
  id: number;
  nombre: string;
}

interface PeriodoMultiSelectProps {
  periodos: PeriodoItem[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function PeriodoMultiSelect({ periodos, selectedIds, onChange }: PeriodoMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const togglePeriodo = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  const allSelected = periodos.length > 0 && selectedIds.length === periodos.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal"
        >
          <div className="flex items-center gap-2 truncate">
            <Calendar className="w-4 h-4 shrink-0" />
            {selectedIds.length === 0
              ? 'Todos los períodos'
              : `${selectedIds.length} período${selectedIds.length !== 1 ? 's' : ''} seleccionado${selectedIds.length !== 1 ? 's' : ''}`}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-2" align="start">
        <div className="space-y-1">
          <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer text-sm">
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange(periodos.map((p) => String(p.id)));
                } else {
                  onChange([]);
                }
              }}
            />
            <span className="font-medium">Todos</span>
          </label>
          <div className="h-px bg-border my-1" />
          {periodos.length === 0 ? (
            <p className="px-2 py-4 text-sm text-muted-foreground text-center">
              No hay períodos disponibles
            </p>
          ) : (
            <div className="max-h-[220px] overflow-y-auto">
              {periodos.map((periodo) => {
                const isSelected = selectedIds.includes(String(periodo.id));
                return (
                  <label
                    key={periodo.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer text-sm"
                    onClick={() => togglePeriodo(String(periodo.id))}
                  >
                    <Checkbox checked={isSelected} />
                    <span>{periodo.nombre}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
        {selectedIds.length > 0 && (
          <div className="border-t border-border mt-2 pt-2">
            <Button variant="ghost" size="sm" className="w-full text-xs gap-1" onClick={clearAll}>
              <X className="w-3 h-3" />
              Limpiar selección
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
