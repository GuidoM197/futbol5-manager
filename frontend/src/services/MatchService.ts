import { BASE_API_URL } from "@/config/app-query-client"

export interface Match {
    id: number
    fieldName: string
    fieldLocation: string
    startTime: string
    endTime: string
    type: string
    confirmed: boolean
    firstTeam: {
        id: number
        teamName: string
        leader: string
        memberEmails: string[]
    }
    secondTeam: {
        id: number
        teamName: string
        leader: string
        memberEmails: string[]
    }
    firstTeamMissing?: number
    secondTeamMissing?: number
    reservation?: {
        id: number
        date: string
        startTime: number
        endTime: number
        soccerField: {
            id: number
            name: string
            location: string
            grassType: string
        }
    }
}

export interface MatchCreateDTO {
    type: string
    firstTeam: string[]
    secondTeam: string[]
}

export async function getAllPublicMatches(
    page = 0,
    size = 10,
): Promise<{
    content: Match[]
    totalElements: number
    totalPages: number
    number: number
    size: number
}> {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    const response = await fetch(`${BASE_API_URL}/game/public?page=${page}&size=${size}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        if (response.status === 403) {
            throw new Error("You do not have permission to view public matches")
        }
        throw new Error(`Error fetching public matches: ${response.status}`)
    }

    return response.json()
}

export async function joinMatch(matchId: number): Promise<Match> {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    const numericMatchId = typeof matchId === "string" ? Number.parseInt(matchId, 10) : matchId
    if (isNaN(numericMatchId) || numericMatchId <= 0) {
        throw new Error("Invalid match ID provided")
    }

    const response = await fetch(`${BASE_API_URL}/game/join/${numericMatchId}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    })

    if (!response.ok) {
        let errorMsg = "Error joining match"
        try {
            const errorData = await response.text()
            if (response.status === 401) {
                errorMsg = "User not authenticated"
            } else if (response.status === 400) {
                errorMsg = errorData || "Invalid request to join match"
            } else if (response.status === 403) {
                errorMsg = "You do not have permission to join this match"
            }
        } catch {
            if (response.status === 401) {
                errorMsg = "User not authenticated"
            } else if (response.status === 400) {
                errorMsg = "Invalid request to join match"
            } else if (response.status === 403) {
                errorMsg = "You do not have permission to join this match"
            }
        }
        throw new Error(errorMsg)
    }

    return response.json()
}

export async function leaveMatch(matchId: number): Promise<Match> {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    const numericMatchId = typeof matchId === "string" ? Number.parseInt(matchId, 10) : matchId
    if (isNaN(numericMatchId) || numericMatchId <= 0) {
        throw new Error("Invalid match ID provided")
    }

    const response = await fetch(`${BASE_API_URL}/game/leave/${numericMatchId}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    })

    if (!response.ok) {
        let errorMsg = "Error leaving match"
        try {
            const errorData = await response.text()
            if (response.status === 401) {
                errorMsg = "User not authenticated"
            } else if (response.status === 400) {
                errorMsg = errorData || "Invalid request to leave match"
            } else if (response.status === 403) {
                errorMsg = "You do not have permission to leave this match"
            }
        } catch {
            if (response.status === 401) {
                errorMsg = "User not authenticated"
            } else if (response.status === 400) {
                errorMsg = "Invalid request to leave match"
            } else if (response.status === 403) {
                errorMsg = "You do not have permission to leave this match"
            }
        }
        throw new Error(errorMsg)
    }

    return response.json()
}

export async function createPublicMatch(data: MatchCreateDTO): Promise<Match> {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    const response = await fetch(`${BASE_API_URL}/game`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        let errorMsg = "Error creating match"
        try {
            const errorData = await response.json()
            if (errorData?.message) {
                errorMsg = errorData.message
            }
        } catch {
            /**/
        }
        throw new Error(errorMsg)
    }

    return response.json()
}

export async function confirmParticipation(matchId: number): Promise<Match> {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    const numericMatchId = typeof matchId === "string" ? Number.parseInt(matchId, 10) : matchId
    if (isNaN(numericMatchId) || numericMatchId <= 0) {
        throw new Error("Invalid match ID provided")
    }

    const response = await fetch(`${BASE_API_URL}/game/confirm/${numericMatchId}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    })

    if (!response.ok) {
        let errorMsg = "Error confirming participation"
        try {
            const errorData = await response.text()
            if (response.status === 401) {
                errorMsg = "User not authenticated"
            } else if (response.status === 400) {
                errorMsg = errorData || "Invalid request to confirm participation"
            } else if (response.status === 403) {
                errorMsg = "You do not have permission to confirm participation"
            }
        } catch {
            /**/
        }
        throw new Error(errorMsg)
    }

    return response.json()
}
