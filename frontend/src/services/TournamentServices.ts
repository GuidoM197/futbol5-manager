import { BASE_API_URL } from "@/config/app-query-client.ts"
import type { Tournament, TournamentCreateDTO, TournamentStatus, TournamentFormat } from "@/models/Tournament.ts"

export async function createTournament(data: TournamentCreateDTO, token: string): Promise<Tournament> {
    const response = await fetch(`${BASE_API_URL}/tournaments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        let errorMsg = "Error creating tournament"
        if (response.status === 409) {
            errorMsg = "A tournament with this name already exists"
        } else if (response.status === 400) {
            errorMsg = "Invalid tournament data"
        }
        try {
            const errorData = await response.json()
            if (errorData && errorData.message) errorMsg = errorData.message
        } catch {}
        throw new Error(errorMsg)
    }

    return response.json()
}

export async function getMyTournaments(): Promise<Tournament[]> {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    const response = await fetch(`${BASE_API_URL}/tournaments/my-tournaments`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error(`Error fetching tournaments: ${response.status}`)
    }

    return response.json()
}

export async function getAllTournaments(): Promise<Tournament[]> {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    const response = await fetch(`${BASE_API_URL}/tournaments`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error(`Error fetching tournaments: ${response.status}`)
    }

    return response.json()
}

export async function searchTournaments(
    name?: string,
    format?: TournamentFormat,
    status?: TournamentStatus,
    startDate?: string,
): Promise<Tournament[]> {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    const params = new URLSearchParams()
    if (name && name.trim()) params.append("name", name.trim())
    if (format) params.append("format", format)
    if (status) params.append("status", status)
    if (startDate) params.append("startDate", startDate)

    const queryString = params.toString()
    const url = `${BASE_API_URL}/tournaments/search${queryString ? `?${queryString}` : ""}`

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error(`Error searching tournaments: ${response.status}`)
    }

    return response.json()
}

export async function getTournamentById(id: number): Promise<Tournament> {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    const response = await fetch(`${BASE_API_URL}/tournaments/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("Tournament not found")
        }
        throw new Error(`Error fetching tournament: ${response.status}`)
    }

    return response.json()
}

export async function updateTournament(id: number, data: TournamentCreateDTO): Promise<Tournament> {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    const response = await fetch(`${BASE_API_URL}/tournaments/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        let errorMsg = "Error updating tournament"
        if (response.status === 403) {
            errorMsg = "You don't have permission to update this tournament"
        } else if (response.status === 409) {
            errorMsg = "A tournament with this name already exists or tournament cannot be edited"
        }
        throw new Error(errorMsg)
    }

    return response.json()
}

export async function deleteTournament(id: number): Promise<boolean> {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    const response = await fetch(`${BASE_API_URL}/tournaments/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok && response.status !== 403) {
        throw new Error(`Error deleting tournament: ${response.status}`)
    }

    return response.ok
}

export async function updateTournamentStatus(id: number, status: TournamentStatus): Promise<Tournament> {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    const response = await fetch(`${BASE_API_URL}/tournaments/${id}/status`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
    })

    if (!response.ok) {
        let errorMsg = "Error updating tournament status"
        if (response.status === 403) {
            errorMsg = "You don't have permission to update this tournament status"
        } else if (response.status === 404) {
            errorMsg = "Tournament not found"
        }
        throw new Error(errorMsg)
    }

    return response.json()
}

export async function getTournamentsByStatus(status: TournamentStatus): Promise<Tournament[]> {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    const response = await fetch(`${BASE_API_URL}/tournaments/status/${status}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error(`Error fetching tournaments by status: ${response.status}`)
    }

    return response.json()
}
