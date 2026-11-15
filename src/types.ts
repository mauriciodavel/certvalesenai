export type User = {
  id: number;
  email: string;
  name: string;
  role: "admin" | "viewer";
  mustChangePassword: boolean;
};
export type Summary = {
  average: number;
  approved: number;
  total: number;
  objects: Record<string, number>;
  matched?: number;
};
export type RecordItem = {
  candidateKey: string;
  matricula: string;
  prova: string;
  nome: string;
  genero: string | null;
  gerencia: string | null;
  coordenacao: string | null;
  turno: string | null;
  dataAplicacao: string | null;
  nota: number | null;
  resultado: string | null;
  objects: Record<string, number | null>;
  lider: string | null;
  cargo: string | null;
  idade: number | null;
  admissao: string | null;
  tempo: number | null;
  situacao: string | null;
  aplicador: string | null;
  difficulty: {
    facil: { points: number | null; percent: number | null };
    medio: { points: number | null; percent: number | null };
    dificil: { points: number | null; percent: number | null };
  };
  scenarios: {
    cenario1: number | null;
    cenario2: number | null;
    cenario3: number | null;
    cenario4: number | null;
  };
};
export type DashboardData = {
  theoretical: Summary & { objects: Record<string, number> };
  practical: Summary & { objects: Record<string, number> };
  records: { theoretical: RecordItem[]; practical: RecordItem[] };
  gap: {
    matched: number;
    average: number;
    approvedBoth: number;
    objects: Record<string, number>;
  };
  candidates: Array<{
    matricula: string;
    nome: string;
    genero: string;
    gerencia: string;
    turno: string;
    prova: string;
    teorica: number;
    pratica: number;
    gap: number;
    status: string;
  }>;
  filters: {
    gerencias: string[];
    turnos: string[];
    provas: string[];
    generos: string[];
    lideres: string[];
    cargos: string[];
  };
};
