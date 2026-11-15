export class UbicacionDTO {
  idUbicacion: number = 0;
  campus: string = '';
  edificio: string = '';
  piso: number | null = null;
  zona: string | null = null;
  tipo: string = '';
  latitud: number | null = null;
  longitud: number | null = null;
}
