export class UsuarioDTO {
  idUsuario: number = 0;
  nombre: string = '';
  apellido: string = '';
  correo: string = '';
  rolId: number = 0;
  estado: string = '';
  fechaRegistro: string = '';
}
export class UsuarioFormularioDTO {
  nombre: string = '';
  apellido: string = '';
  correo: string = '';
  rolId: number = 0;
  estado: string = '';
  password?: string = '';
}
export class RolUsuarioDTO {
  idRol: number = 0;
  nombre: string = '';
}
