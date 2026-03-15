export interface AthleteStats {
  athleteId: number;
  name: string;
  weekly: {
    distance: number;
    movingTime: number;
    calories: number;
    elevationGain: number;
  };
  monthly: {
    distance: number;
    movingTime: number;
    calories: number;
    elevationGain: number;
  };
  yearly: {
    distance: number;
    movingTime: number;
    calories: number;
    elevationGain: number;
  };
  allTime: {
    distance: number;
    movingTime: number;
    calories: number;
    elevationGain: number;
  };
}

export interface GroupStats {
  weekly: {
    distance: number;
    movingTime: number;
    calories: number;
    elevationGain: number;
    memberCount: number;
  };
  monthly: {
    distance: number;
    movingTime: number;
    calories: number;
    elevationGain: number;
    memberCount: number;
  };
  yearly: {
    distance: number;
    movingTime: number;
    calories: number;
    elevationGain: number;
    memberCount: number;
  };
  allTime: {
    distance: number;
    movingTime: number;
    calories: number;
    elevationGain: number;
    memberCount: number;
  };
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters.toFixed(0)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

export function formatElevation(meters: number): string {
  return `${meters.toFixed(0)} m`;
}

export function getDateRanges() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  return {
    weekStart,
    monthStart,
    yearStart
  };
}

export function calculateStats(activities: any[], athleteName: string): AthleteStats {
  // Vérifier si les activités ont des dates
  const hasDates = activities.length > 0 && activities[0].start_date;
  
  if (hasDates) {
    const { weekStart, monthStart, yearStart } = getDateRanges();
    
    // Filtrer par nom pour les activités du club
    const weekly = activities.filter(a => 
      new Date(a.start_date) >= weekStart && `${a.athlete.firstname} ${a.athlete.lastname}` === athleteName
    );
    const monthly = activities.filter(a => 
      new Date(a.start_date) >= monthStart && `${a.athlete.firstname} ${a.athlete.lastname}` === athleteName
    );
    const yearly = activities.filter(a => 
      new Date(a.start_date) >= yearStart && `${a.athlete.firstname} ${a.athlete.lastname}` === athleteName
    );
    const allTime = activities.filter(a => `${a.athlete.firstname} ${a.athlete.lastname}` === athleteName);

    return {
      athleteId: 0,
      name: athleteName,
      weekly: sumActivities(weekly),
      monthly: sumActivities(monthly),
      yearly: sumActivities(yearly),
      allTime: sumActivities(allTime)
    };
  } else {
    // Pas de dates disponibles : filtrer par nom et utiliser toutes les activités
    const athleteActivities = activities.filter(a => `${a.athlete.firstname} ${a.athlete.lastname}` === athleteName);
    const stats = sumActivities(athleteActivities);
    
    return {
      athleteId: 0,
      name: athleteName,
      weekly: stats, // Mêmes stats pour toutes les périodes
      monthly: stats,
      yearly: stats,
      allTime: stats
    };
  }
}

export function calculateGroupStats(activities: any[]): GroupStats {
  const { weekStart, monthStart, yearStart } = getDateRanges();
  
  const weekly = activities.filter(a => new Date(a.start_date) >= weekStart);
  const monthly = activities.filter(a => new Date(a.start_date) >= monthStart);
  const yearly = activities.filter(a => new Date(a.start_date) >= yearStart);
  const allTime = activities;

  const getUniqueAthletes = (activities: any[]) => 
    new Set(activities.map(a => a.athlete.id)).size;

  return {
    weekly: {
      ...sumActivities(weekly),
      memberCount: getUniqueAthletes(weekly)
    },
    monthly: {
      ...sumActivities(monthly),
      memberCount: getUniqueAthletes(monthly)
    },
    yearly: {
      ...sumActivities(yearly),
      memberCount: getUniqueAthletes(yearly)
    },
    allTime: {
      ...sumActivities(allTime),
      memberCount: getUniqueAthletes(allTime)
    }
  };
}

function sumActivities(activities: any[]) {
  return {
    distance: activities.reduce((sum, a) => sum + (a.distance || 0), 0),
    movingTime: activities.reduce((sum, a) => sum + (a.moving_time || 0), 0),
    calories: activities.reduce((sum, a) => sum + (a.calories || 0), 0),
    elevationGain: activities.reduce((sum, a) => sum + (a.total_elevation_gain || 0), 0)
  };
}
