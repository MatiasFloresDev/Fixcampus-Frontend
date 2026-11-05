export interface RegistroDTO {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
}

export interface LoginDTO {
  token: string;
  correo: string;
  idUsuario: number;
}
