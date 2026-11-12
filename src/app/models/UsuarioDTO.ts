export interface UsuarioDTO {
  idUsuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rolId: number;
  estado: string;
  fechaRegistro: string;
}

export interface UsuarioFormularioDTO {
  nombre: string;
  apellido: string;
  correo: string;
  rolId: number;
  estado: string;
  password?: string;
}

export interface RolUsuarioDTO {
  idRol: number;
  nombre: string;
}
