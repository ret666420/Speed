export interface RewardItem {
    achievement_id: string;
    name: string;
    description: string;
    reward_monedas: number;
    achieved: boolean;
    unlocked_at?: string;
    claimed_at?: string;
}

export interface ClaimResponse {
    success: boolean;
    message: string;
    new_balance: number;
}