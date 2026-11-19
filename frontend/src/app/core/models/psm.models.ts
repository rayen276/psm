export const ROLE_ADMIN = 'ADMIN';
export const ROLE_COLLABORATEUR = 'COLLABORATEUR';

export interface UserDto {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  tel?: string;
  roles: string[];
}

export interface AuthResponse {
  token: string;
  user: UserDto;
}

export interface RegisterPayload {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  tel?: string;
}

export interface UserUpdatePayload {
  nom: string;
  prenom: string;
  tel?: string;
  roles: string[];
}

export interface Client {
  id?: number;
  nom: string;
  tel?: string;
  email?: string;
  adresse?: string;
  nbProjets?: number;
}

export interface Projet {
  id?: number;
  libelle: string;
  budget: number;
  duree: number;
  description?: string;
  clientId: number;
  clientNom?: string;
}

export interface ClientStat {
  clientNom: string;
  nbProjets: number;
  budget: number;
}

export interface Stats {
  totalClients: number;
  totalProjets: number;
  budgetTotal: number;
  budgetMoyen: number;
  topClients: ClientStat[];
}
