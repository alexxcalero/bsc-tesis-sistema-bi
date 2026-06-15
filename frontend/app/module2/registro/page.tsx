'use client';

import { MainLayout } from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { cargasApi, catalogosApi } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

export default function RegistroProcesoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tipoCarga, setTipoCarga] = useState<string>('');
  const [periodo, setPeriodo] = useState<string>('');
  const [nombreCarga, setNombreCarga] = useState<string>('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [observaciones, setObservaciones] = useState<string>('');
  const [notificacion, setNotificacion] = useState<{ tipo: 'error' | 'success'; mensaje: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tiposCarga, setTiposCarga] = useState<{ id: number; codigo: string; nombre: string }[]>([]);

  useEffect(() => {
    catalogosApi.listarTiposCarga().then((data) => {
      setTiposCarga(data);
    }).catch(() => {
      setNotificacion({ tipo: 'error', mensaje: 'Error al cargar tipos de carga' });
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArchivo(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!tipoCarga || !nombreCarga || !archivo) {
      setNotificacion({ tipo: 'error', mensaje: 'Por favor complete todos los campos requeridos' });
      setTimeout(() => setNotificacion(null), 4000);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const datos = {
        tipoCargaId: Number(tipoCarga),
        observacion: observaciones || undefined,
      };
      formData.append('datos', new Blob([JSON.stringify(datos)], { type: 'application/json' }));
      formData.append('archivo', archivo);

      await cargasApi.registrar(formData);

      setNotificacion({ tipo: 'success', mensaje: 'Proceso de carga iniciado exitosamente. Será redirigido en breve...' });
      setTimeout(() => {
        router.push('/module2/inbox');
      }, 2000);
    } catch (err: any) {
      setNotificacion({ tipo: 'error', mensaje: err.message || 'Error al registrar la carga' });
      setIsSubmitting(false);
      setTimeout(() => setNotificacion(null), 4000);
    }
  };

  const fechaActual = new Date().toISOString().split('T')[0];

  return (
    <MainLayout
      breadcrumbs={[
        { label: 'Captura Digital', href: '/module2' },
        { label: 'Bandeja de Cargas', href: '/module2/inbox' },
        { label: 'Nuevo Registro' },
      ]}
    >
      <div className="p-6 space-y-6">
        {notificacion && (
          <div className={`p-4 rounded-lg border flex items-center gap-3 ${
            notificacion.tipo === 'error'
              ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
              : 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
          }`}>
            <div className={`text-${notificacion.tipo === 'error' ? 'red' : 'green'}-600`}>
              {notificacion.tipo === 'error' ? '✕' : '✓'}
            </div>
            <p className={`text-sm ${
              notificacion.tipo === 'error'
                ? 'text-red-800 dark:text-red-200'
                : 'text-green-800 dark:text-green-200'
            }`}>
              {notificacion.mensaje}
            </p>
          </div>
        )}

        <div>
          <Link href="/module2/inbox">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Registro de Proceso de Carga</h1>
          <p className="text-muted-foreground mt-2">Registra una nueva carga de datos al sistema</p>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Información de la Carga</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Tipo de Carga *</label>
              <Select value={tipoCarga} onValueChange={setTipoCarga}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo de carga" />
                </SelectTrigger>
                <SelectContent>
                  {tiposCarga.map((tipo) => (
                    <SelectItem key={tipo.id} value={String(tipo.id)}>
                      {tipo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Período</label>
              <Input
                type="text"
                placeholder="Ej: 2025-01"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Nombre o Referencia de Carga *</label>
              <Input
                placeholder="Ej: Carga_Enero_2025"
                value={nombreCarga}
                onChange={(e) => setNombreCarga(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Archivo *</label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-secondary/10 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer block">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    {archivo ? archivo.name : 'Haz clic para seleccionar archivo'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Formato: CSV (máx. 50 MB)</p>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Observaciones o Comentarios</label>
            <textarea
              className="w-full min-h-24 p-3 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground"
              placeholder="Agrega cualquier nota o comentario sobre esta carga..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Resumen de la Carga</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Usuario Responsable</p>
              <p className="text-lg font-semibold text-foreground">{user?.nombreCompleto || 'Usuario'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Registro</p>
              <p className="text-lg font-semibold text-foreground">{fechaActual}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tipo de Carga Seleccionada</p>
              <p className="text-lg font-semibold text-foreground">
                {tiposCarga.find((t) => String(t.id) === tipoCarga)?.nombre || 'No seleccionado'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Archivo Seleccionado</p>
              <p className="text-lg font-semibold text-foreground">{archivo?.name || 'No seleccionado'}</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Link href="/module2/inbox">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={!tipoCarga || !nombreCarga || !archivo || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              'Iniciar Proceso de Carga'
            )}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
