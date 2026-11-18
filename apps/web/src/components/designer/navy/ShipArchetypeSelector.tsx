'use client';

import { Card, CardHeader, CardTitle, CardContent, Badge, cn } from '@generalstaff/ui-components';
import type { ShipType, HullType, ShipModule, ShipModuleType, ShipModuleSlot } from '@generalstaff/calculation-engine';
import { Zap, Target, Shield, Sparkles, Anchor } from 'lucide-react';

export interface ArchetypeTemplate {
  id: string;
  name: string;
  type: ShipType;
  description: string;
  year: number;
  hull: HullType;
  modules: ShipModule[];
  tags: string[];
  icon: React.ReactNode;
}

const ARCHETYPE_TEMPLATES: ArchetypeTemplate[] = [
  // Destroyers
  {
    id: 'destroyer_ww2',
    name: 'WWII Fleet Destroyer',
    type: 'destroyer',
    description: 'Standard WWII destroyer with dual-purpose guns and torpedoes',
    year: 1942,
    hull: 'destroyer_hull',
    modules: [
      { id: 'main_battery', type: 'main_battery' as ShipModuleType, slot: 'main_battery' as ShipModuleSlot, stats: { attack: 40, defense: 0, range: 15, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 200, weight: 1000 } },
      { id: 'torpedoes', type: 'torpedo_tubes' as ShipModuleType, slot: 'torpedo' as ShipModuleSlot, stats: { attack: 60, defense: 0, range: 8, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.85, cost: 150, weight: 500 } },
      { id: 'aa_guns', type: 'anti_air_battery' as ShipModuleType, slot: 'anti_air' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 5, accuracy: 0, piercing: 0, aaAttack: 40, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 100, weight: 300 } },
      { id: 'fire_control', type: 'fire_control' as ShipModuleType, slot: 'fire_control' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 5, accuracy: 30, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.95, cost: 150, weight: 200 } },
    ],
    tags: ['WWII', 'Dual-Purpose', 'Torpedoes', 'Escort'],
    icon: <Anchor className="h-5 w-5" />,
  },
  {
    id: 'destroyer_modern',
    name: 'Modern Guided Missile Destroyer',
    type: 'destroyer',
    description: 'Aegis-equipped destroyer with VLS and advanced sensors',
    year: 1990,
    hull: 'destroyer_hull',
    modules: [
      { id: 'vls', type: 'main_battery' as ShipModuleType, slot: 'main_battery' as ShipModuleSlot, stats: { attack: 80, defense: 0, range: 100, accuracy: 80, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.95, cost: 800, weight: 2000 } },
      { id: 'aegis_radar', type: 'radar' as ShipModuleType, slot: 'sensors' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 200, accuracy: 0, piercing: 0, aaAttack: 50, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.95, cost: 1000, weight: 500 } },
      { id: 'ciws', type: 'anti_air_battery' as ShipModuleType, slot: 'anti_air' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 3, accuracy: 0, piercing: 0, aaAttack: 100, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 200, weight: 200 } },
      { id: 'helicopter', type: 'air_wing' as ShipModuleType, slot: 'aviation' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 0, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 40, subDetection: 60, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 2, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 300, weight: 1000 } },
    ],
    tags: ['Modern', 'Aegis', 'VLS', 'Helicopter', 'AAW'],
    icon: <Sparkles className="h-5 w-5" />,
  },

  // Cruisers
  {
    id: 'light_cruiser_ww2',
    name: 'WWII Light Cruiser',
    type: 'light_cruiser',
    description: 'Fast cruiser for screening and trade protection',
    year: 1941,
    hull: 'cruiser_hull',
    modules: [
      { id: 'main_battery', type: 'main_battery' as ShipModuleType, slot: 'main_battery' as ShipModuleSlot, stats: { attack: 50, defense: 0, range: 20, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 400, weight: 2000 } },
      { id: 'secondary', type: 'secondary_battery' as ShipModuleType, slot: 'secondary_battery' as ShipModuleSlot, stats: { attack: 30, defense: 0, range: 12, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 200, weight: 1000 } },
      { id: 'torpedoes', type: 'torpedo_tubes' as ShipModuleType, slot: 'torpedo' as ShipModuleSlot, stats: { attack: 40, defense: 0, range: 10, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.85, cost: 150, weight: 500 } },
      { id: 'aa_guns', type: 'anti_air_battery' as ShipModuleType, slot: 'anti_air' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 6, accuracy: 0, piercing: 0, aaAttack: 50, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 150, weight: 400 } },
    ],
    tags: ['WWII', 'Screening', 'Trade Protection'],
    icon: <Anchor className="h-5 w-5" />,
  },
  {
    id: 'heavy_cruiser_ww2',
    name: 'WWII Heavy Cruiser',
    type: 'heavy_cruiser',
    description: 'Treaty cruiser with 8-inch guns',
    year: 1938,
    hull: 'cruiser_hull',
    modules: [
      { id: 'main_battery', type: 'main_battery' as ShipModuleType, slot: 'main_battery' as ShipModuleSlot, stats: { attack: 80, defense: 0, range: 25, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 600, weight: 3000 } },
      { id: 'secondary', type: 'secondary_battery' as ShipModuleType, slot: 'secondary_battery' as ShipModuleSlot, stats: { attack: 40, defense: 0, range: 15, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 250, weight: 1200 } },
      { id: 'torpedoes', type: 'torpedo_tubes' as ShipModuleType, slot: 'torpedo' as ShipModuleSlot, stats: { attack: 50, defense: 0, range: 10, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.85, cost: 150, weight: 500 } },
    ],
    tags: ['WWII', 'Treaty Cruiser', '8-inch Guns'],
    icon: <Target className="h-5 w-5" />,
  },

  // Battlecruisers
  {
    id: 'battlecruiser_ww2',
    name: 'WWII Battlecruiser',
    type: 'battlecruiser',
    description: 'Fast capital ship with battleship guns',
    year: 1940,
    hull: 'battlecruiser_hull',
    modules: [
      { id: 'main_battery', type: 'main_battery' as ShipModuleType, slot: 'main_battery' as ShipModuleSlot, stats: { attack: 120, defense: 0, range: 30, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.85, cost: 1000, weight: 5000 } },
      { id: 'secondary', type: 'secondary_battery' as ShipModuleType, slot: 'secondary_battery' as ShipModuleSlot, stats: { attack: 50, defense: 0, range: 18, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 300, weight: 1500 } },
      { id: 'aa_guns', type: 'anti_air_battery' as ShipModuleType, slot: 'anti_air' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 8, accuracy: 0, piercing: 0, aaAttack: 80, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 300, weight: 800 } },
    ],
    tags: ['WWII', 'Fast Capital Ship', 'Battleship Guns'],
    icon: <Zap className="h-5 w-5" />,
  },

  // Battleships
  {
    id: 'battleship_ww2',
    name: 'WWII Fast Battleship',
    type: 'battleship',
    description: 'Fast battleship with heavy armor and 16-inch guns',
    year: 1942,
    hull: 'battleship_hull',
    modules: [
      { id: 'main_battery', type: 'main_battery' as ShipModuleType, slot: 'main_battery' as ShipModuleSlot, stats: { attack: 180, defense: 0, range: 35, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.85, cost: 2000, weight: 8000 } },
      { id: 'secondary', type: 'secondary_battery' as ShipModuleType, slot: 'secondary_battery' as ShipModuleSlot, stats: { attack: 60, defense: 0, range: 20, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 400, weight: 2000 } },
      { id: 'aa_guns', type: 'anti_air_battery' as ShipModuleType, slot: 'anti_air' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 10, accuracy: 0, piercing: 0, aaAttack: 120, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 500, weight: 1200 } },
      { id: 'armor_belt', type: 'armor_belt' as ShipModuleType, slot: 'armor' as ShipModuleSlot, stats: { attack: 0, defense: 30, range: 0, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 150, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.95, cost: 500, weight: 3000 } },
    ],
    tags: ['WWII', 'Fast Battleship', 'Heavy Armor', '16-inch Guns'],
    icon: <Shield className="h-5 w-5" />,
  },
  {
    id: 'super_battleship',
    name: 'Super Battleship',
    type: 'super_battleship',
    description: 'Ultimate capital ship with maximum firepower and armor',
    year: 1945,
    hull: 'super_battleship_hull',
    modules: [
      { id: 'main_battery', type: 'main_battery' as ShipModuleType, slot: 'main_battery' as ShipModuleSlot, stats: { attack: 250, defense: 0, range: 40, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.8, cost: 3000, weight: 12000 } },
      { id: 'secondary', type: 'secondary_battery' as ShipModuleType, slot: 'secondary_battery' as ShipModuleSlot, stats: { attack: 80, defense: 0, range: 22, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 600, weight: 3000 } },
      { id: 'aa_guns', type: 'anti_air_battery' as ShipModuleType, slot: 'anti_air' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 12, accuracy: 0, piercing: 0, aaAttack: 200, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 800, weight: 2000 } },
      { id: 'armor_belt', type: 'armor_belt' as ShipModuleType, slot: 'armor' as ShipModuleSlot, stats: { attack: 0, defense: 50, range: 0, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 250, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.95, cost: 1000, weight: 5000 } },
    ],
    tags: ['Ultimate', 'Maximum Firepower', 'Maximum Armor'],
    icon: <Sparkles className="h-5 w-5" />,
  },

  // Carriers
  {
    id: 'carrier_ww2',
    name: 'WWII Fleet Carrier',
    type: 'carrier',
    description: 'Large fleet carrier with full air wing',
    year: 1942,
    hull: 'carrier_hull',
    modules: [
      { id: 'air_wing', type: 'air_wing' as ShipModuleType, slot: 'aviation' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 0, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 90, airAttack: 100, airDefense: 80, airAgility: 70, airRange: 800, airNavalAttack: 120, reliability: 0.9, cost: 2000, weight: 5000 } },
      { id: 'aa_guns', type: 'anti_air_battery' as ShipModuleType, slot: 'anti_air' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 8, accuracy: 0, piercing: 0, aaAttack: 150, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 600, weight: 1500 } },
      { id: 'radar', type: 'radar' as ShipModuleType, slot: 'sensors' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 100, accuracy: 0, piercing: 0, aaAttack: 30, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.95, cost: 400, weight: 300 } },
      { id: 'armor_deck', type: 'deck_armor' as ShipModuleType, slot: 'protection' as ShipModuleSlot, stats: { attack: 0, defense: 20, range: 0, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 30, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.95, cost: 500, weight: 2000 } },
    ],
    tags: ['WWII', 'Fleet Carrier', 'Large Air Wing'],
    icon: <Anchor className="h-5 w-5" />,
  },
  {
    id: 'light_carrier',
    name: 'Light Carrier',
    type: 'light_carrier',
    description: 'Smaller carrier for convoy escort and fleet support',
    year: 1943,
    hull: 'carrier_hull',
    modules: [
      { id: 'air_wing', type: 'air_wing' as ShipModuleType, slot: 'aviation' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 0, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 35, airAttack: 60, airDefense: 50, airAgility: 60, airRange: 600, airNavalAttack: 80, reliability: 0.9, cost: 1000, weight: 2000 } },
      { id: 'aa_guns', type: 'anti_air_battery' as ShipModuleType, slot: 'anti_air' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 6, accuracy: 0, piercing: 0, aaAttack: 80, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 300, weight: 800 } },
    ],
    tags: ['WWII', 'Light Carrier', 'Escort'],
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: 'carrier_modern',
    name: 'Modern Supercarrier',
    type: 'carrier',
    description: 'Nuclear-powered supercarrier with advanced air wing',
    year: 1985,
    hull: 'carrier_hull',
    modules: [
      { id: 'air_wing', type: 'air_wing' as ShipModuleType, slot: 'aviation' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 0, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 90, airAttack: 180, airDefense: 150, airAgility: 120, airRange: 1500, airNavalAttack: 200, reliability: 0.95, cost: 5000, weight: 8000 } },
      { id: 'aesa_radar', type: 'radar' as ShipModuleType, slot: 'sensors' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 300, accuracy: 0, piercing: 0, aaAttack: 100, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.95, cost: 2000, weight: 500 } },
      { id: 'ciws', type: 'anti_air_battery' as ShipModuleType, slot: 'anti_air' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 3, accuracy: 0, piercing: 0, aaAttack: 200, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 500, weight: 400 } },
      { id: 'catapult', type: 'catapult' as ShipModuleType, slot: 'aviation' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 0, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.95, cost: 1000, weight: 2000 } },
    ],
    tags: ['Modern', 'Nuclear', 'Supercarrier', 'Advanced Air Wing'],
    icon: <Sparkles className="h-5 w-5" />,
  },

  // Submarines
  {
    id: 'submarine_ww2',
    name: 'WWII Fleet Submarine',
    type: 'submarine',
    description: 'Long-range diesel-electric attack submarine',
    year: 1942,
    hull: 'submarine_hull',
    modules: [
      { id: 'torpedoes', type: 'torpedo_tubes' as ShipModuleType, slot: 'torpedo' as ShipModuleSlot, stats: { attack: 80, defense: 0, range: 10, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 400, weight: 1000 } },
      { id: 'deck_gun', type: 'main_battery' as ShipModuleType, slot: 'main_battery' as ShipModuleSlot, stats: { attack: 20, defense: 0, range: 12, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 100, weight: 200 } },
      { id: 'sonar', type: 'sonar' as ShipModuleType, slot: 'sensors' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 0, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 30, subDetection: 80, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.95, cost: 300, weight: 200 } },
    ],
    tags: ['WWII', 'Diesel-Electric', 'Long Range'],
    icon: <Anchor className="h-5 w-5" />,
  },
  {
    id: 'nuclear_sub',
    name: 'Nuclear Attack Submarine',
    type: 'nuclear_submarine',
    description: 'Nuclear-powered fast attack submarine',
    year: 1965,
    hull: 'nuclear_submarine_hull',
    modules: [
      { id: 'torpedoes', type: 'torpedo_tubes' as ShipModuleType, slot: 'torpedo' as ShipModuleSlot, stats: { attack: 120, defense: 0, range: 30, accuracy: 60, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.95, cost: 800, weight: 1500 } },
      { id: 'sonar', type: 'sonar' as ShipModuleType, slot: 'sensors' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 0, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 80, subDetection: 150, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.95, cost: 1000, weight: 500 } },
      { id: 'missile_tubes', type: 'special' as ShipModuleType, slot: 'special' as ShipModuleSlot, stats: { attack: 150, defense: 0, range: 2000, accuracy: 80, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 2000, weight: 3000 } },
    ],
    tags: ['Cold War', 'Nuclear', 'Fast', 'Unlimited Range'],
    icon: <Zap className="h-5 w-5" />,
  },
  {
    id: 'ballistic_sub',
    name: 'Ballistic Missile Submarine',
    type: 'nuclear_submarine',
    description: 'Nuclear-powered ballistic missile submarine (SSBN)',
    year: 1970,
    hull: 'nuclear_submarine_hull',
    modules: [
      { id: 'icbm_tubes', type: 'special' as ShipModuleType, slot: 'special' as ShipModuleSlot, stats: { attack: 500, defense: 0, range: 8000, accuracy: 50, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.95, cost: 5000, weight: 10000 } },
      { id: 'sonar', type: 'sonar' as ShipModuleType, slot: 'sensors' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 0, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 50, subDetection: 100, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.95, cost: 800, weight: 400 } },
    ],
    tags: ['Cold War', 'SSBN', 'Strategic Deterrent', 'ICBM'],
    icon: <Target className="h-5 w-5" />,
  },

  // Frigates/Corvettes
  {
    id: 'frigate_modern',
    name: 'Modern Frigate',
    type: 'frigate',
    description: 'Modern multi-mission frigate with helicopter',
    year: 1990,
    hull: 'frigate_hull',
    modules: [
      { id: 'main_gun', type: 'main_battery' as ShipModuleType, slot: 'main_battery' as ShipModuleSlot, stats: { attack: 60, defense: 0, range: 20, accuracy: 70, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.95, cost: 500, weight: 1500 } },
      { id: 'vls', type: 'main_battery' as ShipModuleType, slot: 'main_battery' as ShipModuleSlot, stats: { attack: 70, defense: 0, range: 80, accuracy: 80, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.95, cost: 800, weight: 2000 } },
      { id: 'helicopter', type: 'air_wing' as ShipModuleType, slot: 'aviation' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 0, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 50, subDetection: 80, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 1, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 300, weight: 500 } },
      { id: 'aa_missiles', type: 'anti_air_battery' as ShipModuleType, slot: 'anti_air' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 50, accuracy: 0, piercing: 0, aaAttack: 100, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.95, cost: 400, weight: 500 } },
    ],
    tags: ['Modern', 'Multi-mission', 'Helicopter', 'VLS'],
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    id: 'corvette_modern',
    name: 'Modern Corvette',
    type: 'corvette',
    description: 'Small but capable patrol corvette',
    year: 2000,
    hull: 'corvette_hull',
    modules: [
      { id: 'main_gun', type: 'main_battery' as ShipModuleType, slot: 'main_battery' as ShipModuleSlot, stats: { attack: 40, defense: 0, range: 15, accuracy: 60, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.95, cost: 300, weight: 800 } },
      { id: 'aa_missiles', type: 'anti_air_battery' as ShipModuleType, slot: 'anti_air' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 30, accuracy: 0, piercing: 0, aaAttack: 60, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.95, cost: 250, weight: 300 } },
      { id: 'torpedoes', type: 'torpedo_tubes' as ShipModuleType, slot: 'torpedo' as ShipModuleSlot, stats: { attack: 40, defense: 0, range: 15, accuracy: 50, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 200, weight: 400 } },
    ],
    tags: ['Modern', 'Patrol', 'Compact'],
    icon: <Anchor className="h-5 w-5" />,
  },

  // Amphibious
  {
    id: 'amphibious_assault',
    name: 'Amphibious Assault Ship',
    type: 'amphibious_assault',
    description: 'Helicopter carrier for marine expeditionary units',
    year: 1985,
    hull: 'carrier_hull',
    modules: [
      { id: 'helicopter_wing', type: 'air_wing' as ShipModuleType, slot: 'aviation' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 0, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 30, airAttack: 40, airDefense: 30, airAgility: 50, airRange: 400, airNavalAttack: 20, reliability: 0.9, cost: 1500, weight: 3000 } },
      { id: 'well_deck', type: 'special' as ShipModuleType, slot: 'special' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 0, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.95, cost: 800, weight: 2000 } },
      { id: 'aa_defense', type: 'anti_air_battery' as ShipModuleType, slot: 'anti_air' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 10, accuracy: 0, piercing: 0, aaAttack: 80, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 400, weight: 800 } },
    ],
    tags: ['Modern', 'Amphibious', 'Marines', 'Helicopter Carrier'],
    icon: <Target className="h-5 w-5" />,
  },
];

interface ShipArchetypeSelectorProps {
  selectedType?: ShipType;
  onSelect: (template: ArchetypeTemplate) => void;
  currentDesign?: Partial<ArchetypeTemplate>;
}

export function ShipArchetypeSelector({ selectedType, onSelect, currentDesign }: ShipArchetypeSelectorProps) {
  const filteredTemplates = selectedType
    ? ARCHETYPE_TEMPLATES.filter(t => t.type === selectedType)
    : ARCHETYPE_TEMPLATES;

  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    const key = template.type;
    if (!acc[key]) acc[key] = { type: template.type, templates: [] };
    acc[key].templates.push(template);
    return acc;
  }, {} as Record<string, { type: ShipType; templates: ArchetypeTemplate[] }>);

  const isCurrent = (template: ArchetypeTemplate) => {
    if (!currentDesign) return false;
    return (
      currentDesign.hull === template.hull &&
      currentDesign.type === template.type
    );
  };

  const typeLabels: Record<ShipType, string> = {
    destroyer: 'Destroyers',
    light_cruiser: 'Light Cruisers',
    heavy_cruiser: 'Heavy Cruisers',
    battlecruiser: 'Battlecruisers',
    battleship: 'Battleships',
    super_battleship: 'Super Battleships',
    carrier: 'Fleet Carriers',
    light_carrier: 'Light Carriers',
    escort_carrier: 'Escort Carriers',
    submarine: 'Submarines',
    nuclear_submarine: 'Nuclear Submarines',
    frigate: 'Frigates',
    corvette: 'Corvettes',
    amphibious_assault: 'Amphibious Assault',
    minelayer: 'Minelayers',
    minesweeper: 'Minesweepers',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          Archetype Templates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 max-h-[600px] overflow-y-auto">
          {(Object.values(groupedTemplates)).map(group => {
            const templates = group.templates;
            if (!templates || templates.length === 0) return null;

            return (
              <div key={group.type} className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <span>{typeLabels[group.type] || group.type}</span>
                  <Badge variant="secondary" className="ml-2">{templates.length}</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => onSelect(template)}
                      className={cn(
                        'relative p-3 text-left border rounded-lg transition-all text-sm',
                        'hover:border-primary/50 hover:shadow-md',
                        isCurrent(template)
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border bg-background hover:bg-muted/50'
                      )}
                    >
                      {isCurrent(template) && (
                        <div className="absolute -top-2 -right-2">
                          <Badge variant="success" className="text-xs">Current</Badge>
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary flex-shrink-0">
                          {template.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {template.name}
                            </h4>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {template.year}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                            {template.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {template.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground space-y-1">
                        <div className="flex gap-4">
                          <span>Hull: <span className="font-medium text-gray-900 dark:text-gray-100">{template.hull.replace(/_/g, ' ')}</span></span>
                        </div>
                        <div className="flex gap-4">
                          <span>Modules: <span className="font-medium text-gray-900 dark:text-gray-100">{template.modules.length}</span></span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No templates available for this type.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}