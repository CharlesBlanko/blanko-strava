import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin vers le fichier de base de données
const DB_FILE_PATH = path.join(__dirname, '..', 'data', 'activities.json');

// Interface pour la structure de données
interface CommunalDatabase {
  clubId: string;
  activities: any[];
  lastUpdated: string;
}

// S'assurer que le répertoire data existe
function ensureDataDirectory(): void {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Charger les données depuis le fichier JSON
function loadDatabase(): CommunalDatabase {
  ensureDataDirectory();
  
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      
      // Enrichir les activités existantes avec les informations de l'athlète
      if (parsed.activities && parsed.activities.length > 0) {
        const hasIncompleteAthleteInfo = parsed.activities.some(activity => 
          !activity.athlete || !activity.athlete.firstname || !activity.athlete.lastname
        );
        
        /*if (hasIncompleteAthleteInfo) {
          console.log('Enriching existing activities with athlete information...');
          // Pour l'instant, on suppose que toutes les activités existantes sont de Charles
          parsed.activities = parsed.activities.map(activity => ({
            ...activity,
            athlete: {
              ...activity.athlete,
              firstname: activity.athlete?.firstname || 'Charles',
              lastname: activity.athlete?.lastname || 'R.',
              username: activity.athlete?.username || 'charles_r',
              profile_medium: activity.athlete?.profile_medium && activity.athlete.profile_medium.startsWith('http') 
                ? activity.athlete.profile_medium 
                : `https://ui-avatars.com/api/?name=${encodeURIComponent((activity.athlete?.firstname || 'Charles') + '+' + (activity.athlete?.lastname || 'R.'))}&background=fc4c02&color=fff&size=128`
            }
          }));
          
          // Sauvegarder les données enrichies
          saveDatabase(parsed);
        }*/
      }
      
      console.log('Database loaded from file:', parsed.activities?.length || 0, 'activities');
      return parsed;
    }
  } catch (error) {
    console.error('Error loading database:', error);
  }
  
  // Base de données vide par défaut
  const defaultDb: CommunalDatabase = {
    clubId: import.meta.env.STRAVA_CLUB_ID || '1452985',
    activities: [],
    lastUpdated: new Date().toISOString()
  };
  
  saveDatabase(defaultDb);
  return defaultDb;
}

// Sauvegarder les données dans le fichier JSON
function saveDatabase(db: CommunalDatabase): void {
  try {
    ensureDataDirectory();
    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2));
    console.log('Database saved:', db.activities.length, 'activities');
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

export function getCommunalActivities(clubId: string): any[] {
  const db = loadDatabase();
  return db.activities || [];
}

export function storeCommunalActivities(clubId: string, activities: any[]): void {
  const db: CommunalDatabase = {
    clubId,
    activities,
    lastUpdated: new Date().toISOString()
  };
  saveDatabase(db);
}

export function addActivitiesToCommunal(clubId: string, newActivities: any[]): void {
  const db = loadDatabase();
  const existing = db.activities || [];
  const combined = [...existing, ...newActivities];
  
  // Dédoublonner par ID d'activité
  const uniqueActivities = combined.filter((activity, index, arr) => 
    index === arr.findIndex(a => a.id === activity.id)
  );
  
  db.activities = uniqueActivities;
  saveDatabase(db);
}

export function hasNewActivitiesInCommunal(clubId: string, newActivities: any[]): boolean {
  const db = loadDatabase();
  const existing = db.activities || [];
  const existingIds = new Set(existing.map(a => a.id));
  const newIds = new Set(newActivities.map(a => a.id));
  
  // Vérifier s'il y a de nouveaux IDs
  for (const id of newIds) {
    if (!existingIds.has(id)) {
      return true;
    }
  }
  
  return false;
}

export function getDatabaseInfo(): { activitiesCount: number; lastUpdated: string; fileSize: string } {
  ensureDataDirectory();
  
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const stats = fs.statSync(DB_FILE_PATH);
      const db = loadDatabase();
      return {
        activitiesCount: db.activities?.length || 0,
        lastUpdated: db.lastUpdated || 'Unknown',
        fileSize: `${(stats.size / 1024).toFixed(2)} KB`
      };
    }
  } catch (error) {
    console.error('Error getting database info:', error);
  }
  
  return {
    activitiesCount: 0,
    lastUpdated: 'Never',
    fileSize: '0 KB'
  };
}

export function exportDatabase(): string {
  const db = loadDatabase();
  return JSON.stringify(db, null, 2);
}

export function clearDatabase(clubId: string): void {
  const db: CommunalDatabase = {
    clubId,
    activities: [],
    lastUpdated: new Date().toISOString()
  };
  saveDatabase(db);
  console.log('Database cleared for club:', clubId);
}

// Garder les anciennes fonctions pour compatibilité
export function getStoredActivities(memberId: string): any[] {
  return getCommunalActivities(import.meta.env.STRAVA_CLUB_ID || '1452985');
}

export function addActivities(memberId: string, newActivities: any[]): void {
  addActivitiesToCommunal(import.meta.env.STRAVA_CLUB_ID || '1452985', newActivities);
}

export function getAllStoredActivities(): any[] {
  return getCommunalActivities(import.meta.env.STRAVA_CLUB_ID || '1452985');
}
