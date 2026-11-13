export class RegistroDTO {
  nombre: string = '';
  apellido: string = '';
  correo: string = '';
  password: string = '';
}
export class LoginDTO {
  token: string = '';
  correo: string = '';
  idUsuario: number = 0;
}
