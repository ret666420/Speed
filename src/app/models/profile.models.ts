export interface UserProfile {
    username: string;
    created_at: string;
    display_name: string;
    monedas: number;
    races_played: number;
    level: number;
    garage_value: number;
    total_cars: number;
    total_cars_available: number;
    maps_completed: number;
}

export interface CarItem {
    car_id: string;
    name: string;
    cost_to_unlock: number;
    base_motor: number;
    base_durabilidad: number;
    base_aceleracion: number;
    unlocked: boolean;
    level_motor: number;
    level_durabilidad: number;
    img?: string;
    class?: string;
    speed?: number;
}

export interface TrophyItem {
    achievement_id: string;
    name: string;
    description: string;
    reward_monedas: number;
    achieved: boolean;
    unlocked_at?: string;
    iconName?: string;
    colorClass?: string;
}

export interface RecordItem {
    score_id: string;
    map_name: string;
    high_score: number;

    rank?: string;
    date?: string;
    time?: string;
}

export interface ProfileResponse {
    user: UserProfile;
    garage: CarItem[];
    trophies: TrophyItem[];
    records: RecordItem[];
}