import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { UniverseGenre, LocationType, RelationshipType, RelationType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const GENRE_LABELS: Record<UniverseGenre, string> = {
  fantasy: 'Fantasia',
  dark_fantasy: 'Fantasia Sombria',
  sci_fi: 'Ficção Científica',
  post_apocalyptic: 'Pós-Apocalíptico',
  steampunk: 'Steampunk',
  horror: 'Terror',
  mythology: 'Mitologia',
  historical: 'Histórico',
  other: 'Outro',
}

export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  kingdom: 'Reino',
  city: 'Cidade',
  village: 'Vila',
  ruin: 'Ruína',
  temple: 'Templo',
  fortress: 'Fortaleza',
  region: 'Região',
  dungeon: 'Masmorra',
  other: 'Outro',
}

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  father: 'Pai',
  mother: 'Mãe',
  child: 'Filho/a',
  sibling: 'Irmão/ã',
  spouse: 'Cônjuge',
  ancestor: 'Ancestral',
  descendant: 'Descendente',
}

export const RELATION_TYPE_LABELS: Record<RelationType, string> = {
  allied: 'Aliado',
  enemy: 'Inimigo',
  neutral: 'Neutro',
  serves: 'Serve',
  controls: 'Controla',
  at_war: 'Em guerra',
  trade: 'Parceiro comercial',
  worships: 'Venera',
  other: 'Outro',
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + '…' : str
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
