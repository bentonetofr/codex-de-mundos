export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  email: string
  username: string | null
  avatar_url: string | null
  created_at: string
}

// ─── Universe ───────────────────────────────────────────────────────────────

export type UniverseGenre =
  | 'fantasy'
  | 'dark_fantasy'
  | 'sci_fi'
  | 'post_apocalyptic'
  | 'steampunk'
  | 'horror'
  | 'mythology'
  | 'historical'
  | 'other'

export interface Universe {
  id: string
  user_id: string
  name: string
  description: string | null
  genre: UniverseGenre
  cover_url: string | null
  created_at: string
  updated_at: string
  // computed
  _counts?: {
    characters: number
    locations: number
    factions: number
    events: number
    creatures: number
    religions: number
  }
}

// ─── Character ──────────────────────────────────────────────────────────────

export interface Character {
  id: string
  universe_id: string
  name: string
  title: string | null
  race: string | null
  origin: string | null
  description: string | null
  personality: string | null
  goals: string | null
  allies: string | null
  enemies: string | null
  faction_id: string | null
  image_url: string | null
  created_at: string
  updated_at: string
  // joined
  faction?: Faction | null
}

// ─── Location ───────────────────────────────────────────────────────────────

export type LocationType =
  | 'kingdom'
  | 'city'
  | 'village'
  | 'ruin'
  | 'temple'
  | 'fortress'
  | 'region'
  | 'dungeon'
  | 'other'

export interface Location {
  id: string
  universe_id: string
  name: string
  type: LocationType
  description: string | null
  culture: string | null
  ruler: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

// ─── Faction ─────────────────────────────────────────────────────────────────

export interface Faction {
  id: string
  universe_id: string
  name: string
  type: string | null
  ideology: string | null
  leader: string | null
  allies: string | null
  enemies: string | null
  description: string | null
  symbol_url: string | null
  created_at: string
  updated_at: string
}

// ─── Event ───────────────────────────────────────────────────────────────────

export interface HistoricalEvent {
  id: string
  universe_id: string
  title: string
  fictional_date: string | null
  sort_order: number
  description: string | null
  characters_involved: string[] | null
  locations_involved: string[] | null
  factions_involved: string[] | null
  created_at: string
  updated_at: string
}

// ─── Creature ─────────────────────────────────────────────────────────────────

export interface Creature {
  id: string
  universe_id: string
  name: string
  type: string | null
  description: string | null
  abilities: string | null
  habitat: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

// ─── Religion ─────────────────────────────────────────────────────────────────

export interface Religion {
  id: string
  universe_id: string
  name: string
  deity: string | null
  dogma: string | null
  description: string | null
  rituals: string | null
  symbol_url: string | null
  created_at: string
  updated_at: string
}

// ─── War ──────────────────────────────────────────────────────────────────────

export interface War {
  id: string
  universe_id: string
  name: string
  start_date: string | null
  end_date: string | null
  description: string | null
  factions_involved: string[] | null
  outcome: string | null
  created_at: string
  updated_at: string
}

// ─── Lineage ──────────────────────────────────────────────────────────────────

export type RelationshipType = 'father' | 'mother' | 'child' | 'sibling' | 'spouse' | 'ancestor' | 'descendant'

export interface Lineage {
  id: string
  universe_id: string
  character_id: string
  related_character_id: string
  relationship: RelationshipType
  created_at: string
  // joined
  character?: Character
  related_character?: Character
}

// ─── Relation ─────────────────────────────────────────────────────────────────

export type EntityType = 'character' | 'faction' | 'location'
export type RelationType = 'allied' | 'enemy' | 'neutral' | 'serves' | 'controls' | 'at_war' | 'trade' | 'worships' | 'other'

export interface Relation {
  id: string
  universe_id: string
  entity_a_type: EntityType
  entity_a_id: string
  entity_b_type: EntityType
  entity_b_id: string
  relation_type: RelationType
  description: string | null
  created_at: string
}

// ─── Map Point ────────────────────────────────────────────────────────────────

export interface MapPoint {
  id: string
  universe_id: string
  location_id: string | null
  label: string
  x_percent: number
  y_percent: number
  created_at: string
  // joined
  location?: Location | null
}

// ─── Lore Note ────────────────────────────────────────────────────────────────

export interface LoreNote {
  id: string
  universe_id: string
  title: string
  content: string
  tags: string[] | null
  created_at: string
  updated_at: string
}

// ─── UI ───────────────────────────────────────────────────────────────────────

export interface NavItem {
  label: string
  href: string
  icon: string
}

export interface StatsCardData {
  label: string
  count: number
  icon: React.ReactNode
  href: string
}
