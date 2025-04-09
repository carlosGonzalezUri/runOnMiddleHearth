export interface Iliterals {
    [key: string]: string;
}

export interface IUserData {
    sessions: IUserSession[];
    initDate: Date;
    userId?: string;
    userToken?: string;
}

export interface IUserSession {
    date: Date;
    steps: number;
    activityType?: string;
    meters: number;
}

export interface IUbicacion {
    id: number,
    ubicacion: string,
    distancia_km: number,
    logro: string,
    distancia_millas: number
}

export interface StravaActivity {
    resource_state: number;
    athlete: Athlete;
    name: string;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    total_elevation_gain: number;
    type: string;
    sport_type: string;
    workout_type: number;
    id: number;
    start_date: string;
    start_date_local: string;
    timezone: string;
    utc_offset: number;
    location_city: string | null;
    location_state: string | null;
    location_country: string | null;
    achievement_count: number;
    kudos_count: number;
    comment_count: number;
    athlete_count: number;
    photo_count: number;
    map: ActivityMap;
    trainer: boolean;
    commute: boolean;
    manual: boolean;
    private: boolean;
    visibility: string;
    flagged: boolean;
    gear_id: string | null;
    start_latlng: number[];
    end_latlng: number[];
    average_speed: number;
    max_speed: number;
    has_heartrate: boolean;
    heartrate_opt_out: boolean;
    display_hide_heartrate_option: boolean;
    upload_id: number | null;
    external_id: string | null;
    from_accepted_tag: boolean;
    pr_count: number;
    total_photo_count: number;
    has_kudoed: boolean;
  }
  
  export interface Athlete {
    id: number;
    resource_state: number;
  }
  
  export interface ActivityMap {
    id: string;
    summary_polyline: string;
    resource_state: number;
  }

  export interface WeekProgress {
    day: string;
    state: boolean | undefined;
    icono: 'check' | 'cross' | 'progress' | 'steps';
  }
  