declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    url: string;
    usuario: string;
    password: string;
  }
}

export type Datos_personales = {
  rut: string;
  nombre_1: string;
  nombre_2: string;
  apellido_1: string;
  apellido_2: string;
  fecha_nacimiento: string;
  lugar_nacimiento: string;
  pais_nacimiento: string;
  estado_civil: string;
  direccion: string;
  villa: string;
  comuna: string;
  numero: string;
  correo: string;
};
export type Datos_contrato = {
  tipo: string;
  estado: string;
  inicio: string;
  fin: string;
  motivo: string;
  facultad: string;
  ubicacion: string;
};
