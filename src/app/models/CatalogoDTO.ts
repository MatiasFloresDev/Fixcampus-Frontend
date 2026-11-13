export type CampoCatalogo =
  | 'nombre'
  | 'descripcion'
  | 'campus'
  | 'edificio'
  | 'piso'
  | 'zona'
  | 'tipo'
  | 'nivelAcceso'
  | 'latitud'
  | 'longitud';

export type DatosCatalogo = Partial<Record<CampoCatalogo, string | number | null>>;

export class RegistroCatalogoDTO {
  idCategoria?: number = 0;
  idUbicacion?: number = 0;
  idRol?: number = 0;
  nombre?: string | number | null = null;
  descripcion?: string | number | null = null;
  campus?: string | number | null = null;
  edificio?: string | number | null = null;
  piso?: string | number | null = null;
  zona?: string | number | null = null;
  tipo?: string | number | null = null;
  nivelAcceso?: string | number | null = null;
  latitud?: string | number | null = null;
  longitud?: string | number | null = null;
}

interface CampoFormulario {
  clave: CampoCatalogo;
  etiqueta: string;
  obligatorio?: boolean;
  longitud?: number;
  minimo?: number;
  rango?: readonly [number, number];
  entero?: boolean;
}

export interface DefinicionCatalogo {
  titulo: string;
  singular: string;
  recurso: string;
  id: 'idCategoria' | 'idUbicacion' | 'idRol';
  campos: CampoFormulario[];
  columnas: CampoCatalogo[];
}

export const catalogos = {
  categorias: {
    titulo: 'Categorías',
    singular: 'categoría',
    recurso: 'categories',
    id: 'idCategoria',
    campos: [
      { clave: 'nombre', etiqueta: 'Nombre', obligatorio: true, minimo: 3, longitud: 100 },
      { clave: 'descripcion', etiqueta: 'Descripción', obligatorio: true, longitud: 255 },
    ],
    columnas: ['nombre', 'descripcion'],
  },
  ubicaciones: {
    titulo: 'Ubicaciones',
    singular: 'ubicación',
    recurso: 'locations',
    id: 'idUbicacion',
    campos: [
      { clave: 'campus', etiqueta: 'Campus', obligatorio: true, longitud: 100 },
      { clave: 'edificio', etiqueta: 'Edificio', obligatorio: true, longitud: 100 },
      { clave: 'piso', etiqueta: 'Piso', rango: [-2147483648, 2147483647], entero: true },
      { clave: 'zona', etiqueta: 'Zona', longitud: 150 },
      { clave: 'tipo', etiqueta: 'Tipo', obligatorio: true, longitud: 50 },
      { clave: 'latitud', etiqueta: 'Latitud', rango: [-90, 90] },
      { clave: 'longitud', etiqueta: 'Longitud', rango: [-180, 180] },
    ],
    columnas: ['campus', 'edificio', 'piso', 'zona', 'tipo'],
  },
  roles: {
    titulo: 'Roles',
    singular: 'rol',
    recurso: 'roles',
    id: 'idRol',
    campos: [
      { clave: 'nombre', etiqueta: 'Nombre', obligatorio: true, longitud: 50 },
      { clave: 'nivelAcceso', etiqueta: 'Nivel de acceso', obligatorio: true, longitud: 50 },
      { clave: 'descripcion', etiqueta: 'Descripción', longitud: 255 },
    ],
    columnas: ['nombre', 'nivelAcceso', 'descripcion'],
  },
} satisfies Record<string, DefinicionCatalogo>;
