export interface Ishikawa {
  id?: number;
  efeitoPrincipal: string;
  metodo?: string;
  maoDeObra?: string;
  material?: string;
  medida?: string;
  meioAmbiente?: string;
  maquina?: string;
}

export interface Plano5w3h {
  id?: number;
  oQue: string;
  porQue: string;
  quem: string;
  onde: string;
  quando: string;
  como: string;
  quantoCusta?: number;
  comoMedir?: string;
}

export interface Pdca {
  id?: number;
  planejar: string;
  fazer: string;
  checar: string;
  agir: string;
}

export interface MelhoriaQualidade {
  revisaoIndividualId: number;
  ishikawa?: Ishikawa;
  planos5w3h: Plano5w3h[];
  pdca?: Pdca;
}
