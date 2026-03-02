export type MessageRole = "ai" | "user";

export interface Message {
    id: string;
    role: MessageRole;
    content: string;
    timestamp: Date;
}

export interface StepOption {
    label: string;
    value: string;
}

export interface Step {
    id: number;
    title: string;
    icon: string;
    description: string;
}

export type TravelData = {
    destination?: string;
    duration?: string;
    departureDate?: string;
    companions?: string;
    budget?: string;
    travelStyle?: string;
    pace?: string;
    accommodation?: string;
    interests?: string[];
    foodPreference?: string;
    transport?: string;
};
