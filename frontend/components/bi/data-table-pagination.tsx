'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTablePaginationProps {
  page: number;
  pageCount: number;
  totalItems?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showPageSizeSelector?: boolean;
  showGoToPage?: boolean;
}

export function DataTablePagination({
  page,
  pageCount,
  totalItems,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  showGoToPage = true,
}: DataTablePaginationProps) {
  const [goToPage, setGoToPage] = useState('');

  if (pageCount <= 1 && totalItems !== undefined && totalItems <= pageSize) {
    return null;
  }

  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = totalItems === undefined ? undefined : Math.min(page * pageSize, totalItems);

  const getVisiblePages = () => {
    const delta = 1;
    const range: (number | string)[] = [];

    for (let i = 1; i <= pageCount; i++) {
      if (
        i === 1 ||
        i === pageCount ||
        (i >= page - delta && i <= page + delta)
      ) {
        range.push(i);
      } else if (range[range.length - 1] !== '...') {
        range.push('...');
      }
    }

    return range;
  };

  const handleGoToPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const target = parseInt(goToPage, 10);
      if (!isNaN(target) && target >= 1 && target <= pageCount) {
        onPageChange(target);
      }
      setGoToPage('');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 border-t border-border">
      <div className="text-sm text-muted-foreground">
        {totalItems !== undefined ? (
          <>
            Mostrando <span className="font-medium">{startItem}</span> a{' '}
            <span className="font-medium">{endItem}</span> de{' '}
            <span className="font-medium">{totalItems}</span> resultados
          </>
        ) : (
          <>Página {page} de {pageCount}</>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filas</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page === 1}
            onClick={() => onPageChange(1)}
            title="Primera página"
          >
            <ChevronFirst className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            title="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {getVisiblePages().map((item, index) =>
            item === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={item}
                variant={page === item ? 'default' : 'outline'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onPageChange(item as number)}
              >
                {item}
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page === pageCount}
            onClick={() => onPageChange(page + 1)}
            title="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page === pageCount}
            onClick={() => onPageChange(pageCount)}
            title="Última página"
          >
            <ChevronLast className="h-4 w-4" />
          </Button>
        </div>

        {showGoToPage && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ir a</span>
            <Input
              type="number"
              min={1}
              max={pageCount}
              value={goToPage}
              onChange={(e) => setGoToPage(e.target.value)}
              onKeyDown={handleGoToPage}
              className="h-8 w-16"
              placeholder="#"
            />
          </div>
        )}
      </div>
    </div>
  );
}
