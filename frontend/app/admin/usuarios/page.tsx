'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { usuariosApi, rolesApi } from '@/lib/api';
import { DataTablePagination } from '@/components/bi/data-table-pagination';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Pencil,
  Lock,
  Power,
  PowerOff,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface Rol {
  id: number;
  codigo: string;
  nombre: string;
}

interface Usuario {
  id: number;
  username: string;
  primerNombre: string;
  segundoNombre?: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  correo: string;
  estado: boolean;
  nombreCompleto: string;
  rol: Rol;
}

interface PaginatedResponse {
  content: Usuario[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

const emptyForm = {
  username: '',
  password: '',
  primerNombre: '',
  segundoNombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  correo: '',
  rolId: '',
};

export default function UsuariosAdminPage() {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('USUARIOS_EDITAR');
  const canCreate = hasPermission('USUARIOS_CREAR');

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [rolFilter, setRolFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState<Usuario | null>(null);
  const [passwordValue, setPasswordValue] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    loadRoles();
    loadUsuarios(1);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      loadUsuarios(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const loadRoles = async () => {
    try {
      const data = await rolesApi.listar();
      setRoles(data);
    } catch (err: any) {
      console.error('Error cargando roles', err);
    }
  };

  const loadUsuarios = async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError('');
      const params: Record<string, string> = {
        page: String(page - 1),
        size: String(pageSize),
      };
      if (searchTerm) params.nombre = searchTerm;
      if (rolFilter) params.rolId = rolFilter;
      if (estadoFilter) params.estado = estadoFilter;

      const data: PaginatedResponse = await usuariosApi.listar(params);
      setUsuarios(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalElements || 0);
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (user: Usuario) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      primerNombre: user.primerNombre,
      segundoNombre: user.segundoNombre || '',
      apellidoPaterno: user.apellidoPaterno,
      apellidoMaterno: user.apellidoMaterno || '',
      correo: user.correo,
      rolId: String(user.rol.id),
    });
    setIsModalOpen(true);
  };

  const openPasswordModal = (user: Usuario) => {
    setPasswordUser(user);
    setPasswordValue('');
    setIsPasswordModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.rolId) {
      toast.error('Debe seleccionar un rol');
      return;
    }
    if (!editingUser && formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        username: formData.username,
        primerNombre: formData.primerNombre,
        segundoNombre: formData.segundoNombre || undefined,
        apellidoPaterno: formData.apellidoPaterno,
        apellidoMaterno: formData.apellidoMaterno || undefined,
        correo: formData.correo,
        rolId: Number(formData.rolId),
        ...(editingUser ? {} : { password: formData.password }),
      };

      if (editingUser) {
        await usuariosApi.actualizar(editingUser.id, payload);
        toast.success('Usuario actualizado correctamente');
      } else {
        await usuariosApi.crear(payload);
        toast.success('Usuario creado correctamente');
      }
      setIsModalOpen(false);
      loadUsuarios();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEstado = async (user: Usuario) => {
    const nuevoEstado = !user.estado;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    if (!confirm(`¿Está seguro de ${accion} al usuario ${user.username}?`)) return;

    try {
      await usuariosApi.cambiarEstado(user.id, nuevoEstado);
      toast.success(`Usuario ${accion}do correctamente`);
      loadUsuarios();
    } catch (err: any) {
      toast.error(err.message || `Error al ${accion} usuario`);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordValue.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    try {
      setSavingPassword(true);
      await usuariosApi.cambiarPassword(passwordUser!.id, { password: passwordValue });
      toast.success('Contraseña actualizada correctamente');
      setIsPasswordModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al cambiar contraseña');
    } finally {
      setSavingPassword(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setRolFilter('');
    setEstadoFilter('');
    setCurrentPage(1);
    loadUsuarios(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadUsuarios(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    loadUsuarios(1);
  };

  const handleRolFilterChange = (val: string) => {
    setRolFilter(val === 'all' ? '' : val);
    setCurrentPage(1);
    loadUsuarios(1);
  };

  const handleEstadoFilterChange = (val: string) => {
    setEstadoFilter(val === 'all' ? '' : val);
    setCurrentPage(1);
    loadUsuarios(1);
  };

  if (loading && usuarios.length === 0) {
    return (
      <MainLayout breadcrumbs={[{ label: 'Administración', href: '/admin' }, { label: 'Gestión de Usuarios' }]}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout breadcrumbs={[{ label: 'Administración', href: '/admin' }, { label: 'Gestión de Usuarios' }]}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
            <p className="text-muted-foreground mt-1">Administra los usuarios del sistema y sus roles</p>
          </div>
          {canCreate && (
            <Button onClick={openCreateModal} className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Usuario
            </Button>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-lg border bg-red-50 border-red-200 text-red-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nombre o username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Rol</label>
              <Select value={rolFilter || 'all'} onValueChange={handleRolFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {roles.map((rol) => (
                    <SelectItem key={rol.id} value={String(rol.id)}>{rol.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Estado</label>
              <Select value={estadoFilter || 'all'} onValueChange={handleEstadoFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={resetFilters} className="w-full md:w-auto">
                Limpiar filtros
              </Button>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/30">
                <tr className="text-muted-foreground">
                  <th className="text-left py-3 px-4 font-medium">Usuario</th>
                  <th className="text-left py-3 px-4 font-medium">Nombre Completo</th>
                  <th className="text-left py-3 px-4 font-medium">Correo</th>
                  <th className="text-left py-3 px-4 font-medium">Rol</th>
                  <th className="text-center py-3 px-4 font-medium">Estado</th>
                  <th className="text-center py-3 px-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length > 0 ? (
                  usuarios.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-secondary/30">
                      <td className="py-3 px-4 font-medium">{user.username}</td>
                      <td className="py-3 px-4">{user.nombreCompleto}</td>
                      <td className="py-3 px-4 text-muted-foreground">{user.correo}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{user.rol.nombre}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {user.estado ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">Inactivo</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {canEdit && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => openEditModal(user)} title="Editar">
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => openPasswordModal(user)} title="Cambiar contraseña">
                                <Lock className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleEstado(user)}
                                title={user.estado ? 'Desactivar' : 'Activar'}
                              >
                                {user.estado ? <PowerOff className="w-4 h-4 text-red-600" /> : <Power className="w-4 h-4 text-green-600" />}
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 px-4 text-center text-muted-foreground">
                      No se encontraron usuarios
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <DataTablePagination
            page={currentPage}
            pageCount={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </Card>

        {/* Modal Crear/Editar */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Modifica los datos del usuario seleccionado.' : 'Completa los datos para crear un nuevo usuario.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input id="username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
                </div>
                {!editingUser && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña *</Label>
                    <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={6} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="primerNombre">Primer Nombre *</Label>
                  <Input id="primerNombre" value={formData.primerNombre} onChange={(e) => setFormData({ ...formData, primerNombre: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="segundoNombre">Segundo Nombre</Label>
                  <Input id="segundoNombre" value={formData.segundoNombre} onChange={(e) => setFormData({ ...formData, segundoNombre: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidoPaterno">Apellido Paterno *</Label>
                  <Input id="apellidoPaterno" value={formData.apellidoPaterno} onChange={(e) => setFormData({ ...formData, apellidoPaterno: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidoMaterno">Apellido Materno</Label>
                  <Input id="apellidoMaterno" value={formData.apellidoMaterno} onChange={(e) => setFormData({ ...formData, apellidoMaterno: e.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="correo">Correo *</Label>
                  <Input id="correo" type="email" value={formData.correo} onChange={(e) => setFormData({ ...formData, correo: e.target.value })} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="rol">Rol *</Label>
                  <Select value={formData.rolId} onValueChange={(val) => setFormData({ ...formData, rolId: val })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((rol) => (
                        <SelectItem key={rol.id} value={String(rol.id)}>{rol.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {saving ? 'Guardando...' : 'Guardar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Cambiar Contraseña */}
        <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cambiar Contraseña</DialogTitle>
              <DialogDescription>
                Ingresa la nueva contraseña para {passwordUser?.username}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={savingPassword}>
                  {savingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {savingPassword ? 'Actualizando...' : 'Actualizar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
