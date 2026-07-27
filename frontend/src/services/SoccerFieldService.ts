import { BASE_API_URL } from "@/config/app-query-client"

export interface SoccerField {
    id: number
    name: string
    location: string
    grassType: string
    administratorEmail: string
    startTime: number
    endTime: number
}

export interface SoccerFieldCreateDTO {
    name: string
    location: string
    grassType: string
    administratorEmail: string
    startTime: number
    endTime: number
}

export async function getMyFields(): Promise<SoccerField[]> {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    const response = await fetch(`${BASE_API_URL}/soccer-fields/my-fields`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error(`Error fetching fields: ${response.status}`)
    }

    return response.json()
}

export async function deleteField(id: number): Promise<boolean> {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    const response = await fetch(`${BASE_API_URL}/soccer-fields/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    return response.ok
}

export async function updateFieldAsAdmin(id: number, data: SoccerFieldCreateDTO): Promise<SoccerField | null> {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    const response = await fetch(`${BASE_API_URL}/soccer-fields/admin/${id}`, {
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

export async function updateFieldAsOwner(id: number, data: SoccerFieldCreateDTO): Promise<SoccerField | null> {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    const response = await fetch(`${BASE_API_URL}/soccer-fields/owner/${id}`, {
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