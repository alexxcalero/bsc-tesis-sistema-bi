const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface ApiError {
  message: string;
  status: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  expiresIn: number;
  usuario: Usuario;
}

export interface Usuario {
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

export interface Rol {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  permisos: Permiso[];
}

export interface Permiso {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('bi_token');
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Error ${response.status}: ${response.statusText}`;
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // ignore
    }
    throw { message, status: response.status } as ApiError;
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return handleResponse<T>(response);
}

export async function apiFetchBlob(
  endpoint: string,
  options: RequestInit = {}
): Promise<Blob> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Error ${response.status}: ${response.statusText}`;
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // ignore
    }
    throw { message, status: response.status } as ApiError;
  }

  return response.blob();
}

export async function apiUploadFile<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  return handleResponse<T>(response);
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  me: () => apiFetch<Usuario>('/auth/me'),
};

export const dashboardApi = {
  getResumen: () => apiFetch<any>('/dashboard/resumen'),
};

export const campaniasApi = {
  listar: (params?: Record<string, string>) =>
    apiFetch<any>(`/campanias?${new URLSearchParams(params).toString()}`),
  obtener: (id: number | string) => apiFetch<any>(`/campanias/${id}`),
  listarOfertas: (id: number | string, params?: Record<string, string>) =>
    apiFetch<any>(`/campanias/${id}/ofertas?${new URLSearchParams(params).toString()}`),
  recalcularMetricas: (id: number | string) =>
    apiFetch<any>(`/campanias/${id}/recalcular-metricas`, { method: 'POST' }),
};

export const clientesApi = {
  listar: (params?: Record<string, string>) =>
    apiFetch<any>(`/clientes?${new URLSearchParams(params).toString()}`),
  obtener: (id: number | string) => apiFetch<any>(`/clientes/${id}`),
  detalle360: (id: number | string) => apiFetch<any>(`/clientes/${id}/detalle-360`),
};

export const catalogosApi = {
  listarProductos: () => apiFetch<any>('/catalogos/productos'),
  listarSegmentos: () => apiFetch<any>('/catalogos/segmentos'),
  listarTiposCliente: () => apiFetch<any>('/catalogos/tipos-cliente'),
  listarZonas: () => apiFetch<any>('/catalogos/zonas'),
  listarAgencias: () => apiFetch<any>('/catalogos/agencias'),
  listarPeriodos: () => apiFetch<any>('/catalogos/periodos'),
  listarTiposCarga: () => apiFetch<any>('/catalogos/tipos-carga'),
  listarEstadosCarga: () => apiFetch<any>('/catalogos/estados-carga'),
};

export const cargasApi = {
  listar: (params?: Record<string, string>) =>
    apiFetch<any>(`/cargas?${new URLSearchParams(params).toString()}`),
  obtener: (id: number | string) => apiFetch<any>(`/cargas/${id}`),
  registrar: (formData: FormData) => apiUploadFile<any>('/cargas', formData),
  validar: (id: number | string) =>
    apiFetch<any>(`/cargas/${id}/validar`, { method: 'POST' }),
  publicar: (id: number | string) =>
    apiFetch<any>(`/cargas/${id}/publicar`, { method: 'POST' }),
  listarErrores: (id: number | string, params?: Record<string, string>) =>
    apiFetch<any>(`/cargas/${id}/errores?${new URLSearchParams(params).toString()}`),
  listarDetalles: (id: number | string, params?: Record<string, string>) =>
    apiFetch<any>(`/cargas/${id}/detalles?${new URLSearchParams(params).toString()}`),
};

export const reportesApi = {
  listar: () => apiFetch<any>('/reportes'),
  generar: (id: string, filtros?: Record<string, string>) =>
    apiFetchBlob(`/reportes/${id}/generar`, {
      method: 'POST',
      body: JSON.stringify({ filtros: filtros || {} }),
    }),
};
