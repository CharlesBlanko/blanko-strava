import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemins vers les fichiers
const ATHLETES_DB_PATH = path.join(__dirname, '..', 'data', 'athletes.json');
const ACTIVITIES_DB_PATH = path.join(__dirname, '..', 'data', 'activities.json');

// Interface pour un athlète
interface Athlete {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  profile_medium: string;
}

// Interface pour une activité optimisée
interface OptimizedActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  kilojoules: number;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  athlete_id: number; // Référence à l'athlète
}

// Interface pour la structure de données
interface OptimizedDatabase {
  clubId: string;
  activities: OptimizedActivity[];
  lastUpdated: string;
}

// Interface pour la base d'athlètes
interface AthletesDatabase {
  athletes: Athlete[];
  lastUpdated: string;
}

// S'assurer que le répertoire data existe
function ensureDataDirectory(): void {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Charger la base d'athlètes
function loadAthletes(): AthletesDatabase {
  ensureDataDirectory();
  
  try {
    if (fs.existsSync(ATHLETES_DB_PATH)) {
      const data = fs.readFileSync(ATHLETES_DB_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      console.log('Athletes database loaded:', parsed.athletes?.length || 0, 'athletes');
      return parsed;
    }
  } catch (error) {
    console.error('Error loading athletes database:', error);
  }
  
  // Base vide par défaut
  const defaultDb: AthletesDatabase = {
    athletes: [],
    lastUpdated: new Date().toISOString()
  };
  
  saveAthletes(defaultDb);
  return defaultDb;
}

// Sauvegarder la base d'athlètes
function saveAthletes(db: AthletesDatabase): void {
  try {
    ensureDataDirectory();
    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(ATHLETES_DB_PATH, JSON.stringify(db, null, 2));
    console.log('Athletes database saved:', db.athletes.length, 'athletes');
  } catch (error) {
    console.error('Error saving athletes database:', error);
  }
}

// Charger les données optimisées
function loadOptimizedDatabase(): OptimizedDatabase {
  ensureDataDirectory();
  
  try {
    if (fs.existsSync(ACTIVITIES_DB_PATH)) {
      const data = fs.readFileSync(ACTIVITIES_DB_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      console.log('Optimized database loaded:', parsed.activities?.length || 0, 'activities');
      return parsed;
    }
  } catch (error) {
    console.error('Error loading optimized database:', error);
  }
  
  // Base vide par défaut
  const defaultDb: OptimizedDatabase = {
    clubId: import.meta.env.STRAVA_CLUB_ID || '1452985',
    activities: [],
    lastUpdated: new Date().toISOString()
  };
  
  saveOptimizedDatabase(defaultDb);
  return defaultDb;
}

// Sauvegarder les données optimisées
function saveOptimizedDatabase(db: OptimizedDatabase): void {
  try {
    ensureDataDirectory();
    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(ACTIVITIES_DB_PATH, JSON.stringify(db, null, 2));
    console.log('Optimized database saved:', db.activities.length, 'activities');
  } catch (error) {
    console.error('Error saving optimized database:', error);
  }
}

// Ajouter ou mettre à jour un athlète
function addOrUpdateAthlete(athlete: Athlete): void {
  const db = loadAthletes();
  const existingIndex = db.athletes.findIndex(a => a.id === athlete.id);
  
  if (existingIndex >= 0) {
    db.athletes[existingIndex] = athlete;
  } else {
    db.athletes.push(athlete);
  }
  
  saveAthletes(db);
}

// Fonctions publiques
export function getCommunalActivities(clubId: string): OptimizedActivity[] {
  const db = loadOptimizedDatabase();
  console.log('Loading optimized activities:', db.activities?.length || 0, 'activities');
  return db.activities || [];
}

export function addActivitiesToCommunal(clubId: string, newActivities: any[]): void {
  console.log('=== addActivitiesToCommunal called ===');
  console.log('New activities to add:', newActivities.length);
  
  const db = loadOptimizedDatabase();
  const athletesDb = loadAthletes();
  const existing = db.activities || [];
  
  console.log('Existing activities:', existing.length);
  console.log('Existing athletes:', athletesDb.athletes.length);
  
  // Traiter les nouvelles activités
  const optimizedNewActivities = newActivities.map(activity => {
    console.log('Processing activity:', activity.id, activity.name);
    
    // Ajouter l'athlète à la base
    if (activity.athlete) {
      const athlete: Athlete = {
        id: activity.athlete.id,
        firstname: activity.athlete.firstname,
        lastname: activity.athlete.lastname,
        username: activity.athlete.username || `${activity.athlete.firstname.toLowerCase()}_${activity.athlete.lastname.toLowerCase()}`,
        profile_medium: activity.athlete.profile_medium && activity.athlete.profile_medium.startsWith('http') 
          ? activity.athlete.profile_medium 
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(activity.athlete.firstname + '+' + activity.athlete.lastname)}&background=fc4c02&color=fff&size=128`
      };
      
      addOrUpdateAthlete(athlete);
    }
    
    return {
      id: activity.id,
      name: activity.name || 'Sans nom',
      distance: activity.distance || 0,
      moving_time: activity.moving_time || 0,
      elapsed_time: activity.elapsed_time || 0,
      total_elevation_gain: activity.total_elevation_gain || 0,
      kilojoules: activity.kilojoules || 0,
      type: activity.type || 'Unknown',
      sport_type: activity.sport_type || 'Unknown',
      start_date: activity.start_date || '',
      start_date_local: activity.start_date_local || '',
      athlete_id: activity.athlete?.id || 0
    };
  });
  
  const combined = [...existing, ...optimizedNewActivities];
  
  // Dédoublonner par ID d'activité
  const uniqueActivities = combined.filter((activity, index, arr) => 
    index === arr.findIndex(a => a.id === activity.id)
  );
  
  console.log('Unique activities after deduplication:', uniqueActivities.length);
  
  db.activities = uniqueActivities;
  saveOptimizedDatabase(db);
  
  console.log('=== addActivitiesToCommunal completed ===');
}

export function getAthletes(): Athlete[] {
  const db = loadAthletes();
  return db.athletes || [];
}

export function getAthleteById(athleteId: number): Athlete | null {
  const athletes = getAthletes();
  return athletes.find(a => a.id === athleteId) || null;
}

// Fonctions de compatibilité
export function getDatabaseInfo(): { activitiesCount: number; athletesCount: number; lastUpdated: string; fileSize: string } {
  ensureDataDirectory();
  
  try {
    const activitiesStats = fs.existsSync(ACTIVITIES_DB_PATH) 
      ? fs.statSync(ACTIVITIES_DB_PATH) 
      : { size: 0 };
    
    const athletesStats = fs.existsSync(ATHLETES_DB_PATH) 
      ? fs.statSync(ATHLETES_DB_PATH) 
      : { size: 0 };
    
    const db = loadOptimizedDatabase();
    const athletesDb = loadAthletes();
    
    return {
      activitiesCount: db.activities?.length || 0,
      athletesCount: athletesDb.athletes?.length || 0,
      lastUpdated: db.lastUpdated || 'Unknown',
      fileSize: `${((activitiesStats.size + athletesStats.size) / 1024).toFixed(2)} KB`
    };
  } catch (error) {
    console.error('Error getting database info:', error);
  }
  
  return {
    activitiesCount: 0,
    athletesCount: 0,
    lastUpdated: 'Never',
    fileSize: '0 KB'
  };
}

export function clearDatabase(clubId: string): void {
  const activitiesDb: OptimizedDatabase = {
    clubId,
    activities: [],
    lastUpdated: new Date().toISOString()
  };
  const athletesDb: AthletesDatabase = {
    athletes: [],
    lastUpdated: new Date().toISOString()
  };
  
  saveOptimizedDatabase(activitiesDb);
  saveAthletes(athletesDb);
  console.log('Databases cleared for club:', clubId);
}
