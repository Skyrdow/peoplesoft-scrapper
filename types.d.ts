declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    url: string;
    usuario: string;
    password: string;
  }
}

export type Dato = {
  rut: string;
  nombre: string;
  fecha_nacimiento: string;
}
