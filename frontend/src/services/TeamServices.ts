import {BASE_API_URL} from "@/config/app-query-client.ts"

export interface Team {
    id: number
    teamName: string
    leader: string
    memberEmails: string[]
}

export interface TeamCreateDTO {
    name: string
    leader: string
    memberEmails: string[]
}

export async function createTeam(data: { name: string; leader: string; memberEmails: string[] }, token: string) {
    const response = await fetch(`${BASE_API_URL}/game/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            name: data.name,
            leader: data.leader,
            memberEmails: data.memberEmails,
        }),
    })
    if (!response.ok) {
        let errorMsg = "Error creating team: Maybe the team name is already taken or the member emails are invalid"
        try {
            const errorData = await response.json()
            if (errorData && errorData.message) errorMsg = errorData.message
        } catch {
            throw new Error(errorMsg)
        }
    }
    return await response.json()
}

export async function getMyLedTeams(leaderEmail: string, token: string | null): Promise<Team[]> {
    const encodedEmail = encodeURIComponent(leaderEmail);
    const leaderTeamsResponse = await fetch(`${BASE_API_URL}/game/my-led-teams/${encodedEmail}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    const teams = await leaderTeamsResponse.json();
    const allTeams: Team[] = [...teams]
    allTeams.filter((team, index, self) => index === self.findIndex((t) => t.id === team.id))
    return allTeams
}

async function getTeamsByEmail(leaderEmail: string) {
    const token = localStorage.getItem("token")
    const memberTeamsResponse = await fetch(`${BASE_API_URL}/game/my-teams`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    let memberTeams: Team[] = []
    let leaderTeams: Team[] = []

    if (memberTeamsResponse.ok) {
        memberTeams = await memberTeamsResponse.json()
    }

    leaderTeams = await getMyLedTeams(leaderEmail, token)

    const allTeams = [...memberTeams, ...leaderTeams]
    const uniqueTeams = allTeams.filter((team, index, self) => index === self.findIndex((t) => t.id === team.id))

    return uniqueTeams
}

export async function getMyTeams(): Promise<Team[]> {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")
    try {
        const leaderEmail = await fetch(`${BASE_API_URL}/users/get-email`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        return await getTeamsByEmail(await leaderEmail.text());
    } catch (error) {
        const response = await fetch(`${BASE_API_URL}/game/my-teams`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            throw new Error(`Error fetching teams: ${response.status}`)
        }

        return response.json()
    }
}

export async function deleteTeam(id: number): Promise<boolean> {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    const response = await fetch(`${BASE_API_URL}/game/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    return response.ok
}

export async function updateTeam(id: number, data: TeamCreateDTO): Promise<Team | null> {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    const response = await fetch(`${BASE_API_URL}/game/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        return null
    }

    return response.json()
}
