export interface Tournament {
    id: number
    name: string
    startDate: string
    endDate?: string
    format: TournamentFormat
    maxTeams: number
    organizerEmail: string
    status: TournamentStatus
    description?: string
    prizes?: string
    registrationCost?: number
    createdAt: string
    updatedAt: string
}

export interface TournamentCreateDTO {
    name: string
    startDate: string
    format: TournamentFormat
    maxTeams: number
    endDate?: string
    description?: string
    prizes?: string
    registrationCost?: number
}

export enum TournamentFormat {
    SINGLE_ELIMINATION = "SINGLE_ELIMINATION",
    GROUP_STAGE_THEN_ELIMINATION = "GROUP_STAGE_THEN_ELIMINATION",
    ROUND_ROBIN = "ROUND_ROBIN"
}

export enum TournamentStatus {
    OPEN_FOR_REGISTRATION = "OPEN_FOR_REGISTRATION",
    REGISTRATION_CLOSED = "REGISTRATION_CLOSED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}

export const TournamentFormatLabels: Record<TournamentFormat, string> = {
    [TournamentFormat.SINGLE_ELIMINATION]: "Eliminación Directa",
    [TournamentFormat.GROUP_STAGE_THEN_ELIMINATION]: "Fase de Grupos y luego Eliminación",
    [TournamentFormat.ROUND_ROBIN]: "Liga Todos contra Todos"
}

export const TournamentStatusLabels: Record<TournamentStatus, string> = {
    [TournamentStatus.OPEN_FOR_REGISTRATION]: "Abierto para Inscripción",
    [TournamentStatus.REGISTRATION_CLOSED]: "Inscripciones Cerradas",
    [TournamentStatus.IN_PROGRESS]: "En Progreso",
    [TournamentStatus.COMPLETED]: "Completado",
    [TournamentStatus.CANCELLED]: "Cancelado"
} 