export interface Iliterals {
    [key: string]: string;
}

export interface IUserData {
    sessions: IUserSession[];
    initDate: Date;
    userId: string;
    userToken: string;
}

export interface IUserSession {
    date: Date;
    steps: number;
    activityType?: string;
}

export interface IUbicacion {
    id: number,
    ubicacion: string,
    distancia_km: number,
    logro: string,
    distancia_millas: number
}