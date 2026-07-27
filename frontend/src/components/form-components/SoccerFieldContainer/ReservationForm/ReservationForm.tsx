"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useToken } from "@/services/TokenContext"
import { Redirect } from "wouter"
import styles from "./ReservationForm.module.css"
import { SelectTeamComponent } from "@/components/form-components/SoccerFieldContainer/SelectTeamComponent/SelectTeamComponent.tsx"

export const ReservationForm = () => {
    const [tokenState] = useToken()
    const [fields, setFields] = useState<{ name: string }[]>([])
    const [fieldName, setFieldName] = useState("")
    const [day, setDay] = useState("")
    const [startHour, setStartHour] = useState<number | "">("")
    const [endHour, setEndHour] = useState<number | "">("")
    const [availableHours, setAvailableHours] = useState<number[]>([])
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [matchType, setMatchType] = useState("")
    const [showTeamCreation, setShowTeamCreation] = useState(false)
    const [team1, setTeam1] = useState(new Set<string>())
    const [team2, setTeam2] = useState(new Set<string>())
    const [shouldRedirect, setShouldRedirect] = useState(false)
    const MATCH_TYPES = ["PRIVATE", "PUBLIC"]

    useEffect(() => {
        if (tokenState.state !== "LOGGED_IN" || ("role" in tokenState && tokenState.role !== "USER")) {
            setShouldRedirect(true)
        }
    }, [tokenState])

    useEffect(() => {
        const fetchFields = async () => {
            try {
                const token = localStorage.getItem("token")
                const res = await fetch("http://localhost:30002/soccer-fields/search-by-location", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (res.ok) {
                    const data = await res.json()
                    setFields(data.content || [])
                }
            } catch (error) {
                console.error("Error fetching fields:", error)
            }
        }
        fetchFields()
    }, [])

    useEffect(() => {
        const fetchAvailableHours = async () => {
            if (fieldName && day) {
                const token = localStorage.getItem("token")
                const res = await fetch(
                    `http://localhost:30002/reservations/available-hours?fieldName=${fieldName}&day=${day}`,
                    { headers: { Authorization: `Bearer ${token}` } },
                )
                if (res.ok) {
                    const data = await res.json()
                    setAvailableHours(data)
                    setStartHour("")
                    setEndHour("")
                } else {
                    setAvailableHours([])
                }
            } else {
                setAvailableHours([])
            }
        }
        fetchAvailableHours()
    }, [fieldName, day])

    const handleMatchTypeChange = (value: string) => {
        setMatchType(value)
        if (value === "PRIVATE") {
            setShowTeamCreation(true)
        } else {
            setShowTeamCreation(false)
            setTeam1(new Set())
            setTeam2(new Set())
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage("")

        if (startHour === "" || endHour === "" || Number(startHour) >= Number(endHour)) {
            setMessage("The start time must be less than the end time.")
            return
        }

        if (matchType === "PRIVATE" && team1.size === 0 && team2.size === 0) {
            setMessage("You must configure teams for a private match.")
            setShowTeamCreation(true)
            return
        }

        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            let userEmail = ""
            if (tokenState.state === "LOGGED_IN" && "accessToken" in tokenState && tokenState.accessToken) {
                try {
                    userEmail = JSON.parse(atob(tokenState.accessToken.split(".")[1])).sub
                } catch (error) {
                    console.error("Error parsing token:", error)
                }
            }

            const body: any = {
                userEmail,
                fieldName,
                day,
                startHour,
                endHour,
                type: matchType,
            }
            console.log(team1)
            console.log(team2)

            if (matchType === "PRIVATE") {
                body.teamEmails1 = Array.from(team1)
                body.teamEmails2 = Array.from(team2)
            } else {
                body.teamEmails1 = []
                body.teamEmails2 = []
            }

            const res = await fetch("http://localhost:30002/reservations/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            })

            if (res.ok) {
                setMessage("Reservation created successfully!")
                setFieldName("")
                setDay("")
                setStartHour("")
                setEndHour("")
                setMatchType("")
                setTeam1(new Set())
                setTeam2(new Set())
                setShowTeamCreation(false)
                setAvailableHours([])
            } else {
                setMessage(
                    "Error, probably you are reserving a reserved time. Remember that the start hour must be less than the end hour and both must be between 9 and 17.",
                )
            }
        } catch (error) {
            setMessage("Network Error: " + (error as Error).message)
        } finally {
            setLoading(false)
        }
    }

    const handleTeamCreationConfirm = () => {
        setShowTeamCreation(false)
    }

    const handleTeamCreationCancel = () => {
        setShowTeamCreation(false)
        setTeam1(new Set())
        setTeam2(new Set())
        setLoading(false)
    }

    if (shouldRedirect) {
        return <Redirect to="/" />
    }

    return (
        <>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Soccer Field:</label>
                    <select value={fieldName} onChange={(e) => setFieldName(e.target.value)} required className={styles.select}>
                        <option value="">Select a soccer field</option>
                        {fields.map((f) => (
                            <option key={f.name} value={f.name}>
                                {f.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Day:</label>
                    <input
                        type="date"
                        value={day}
                        onChange={(e) => setDay(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        className={styles.dateInput}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Available hours:</label>
                    <select
                        value={startHour}
                        onChange={(e) => {
                            const start = Number(e.target.value)
                            setStartHour(start)
                            setEndHour(start + 1)
                        }}
                        required
                        className={styles.select}
                        disabled={!fieldName || !day || availableHours.length === 0}
                    >
                        <option value="">Selecciona un horario</option>
                        {availableHours.map((hour) => (
                            <option key={hour} value={hour}>
                                {hour}:00 - {hour + 1}:00
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Match Type:</label>
                    <select
                        value={matchType}
                        onChange={(e) => handleMatchTypeChange(e.target.value)}
                        required
                        className={styles.select}
                    >
                        <option value="">Select a Match Type</option>
                        {MATCH_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>

                {matchType === "PRIVATE" && (team1.size > 0 || team2.size > 0) && (
                    <div className={styles.inputGroup}>
                        <div className={styles.teamSummary}>
                            <h4>Teams Configured:</h4>
                            <div className={styles.teamInfo}>
                                <span>Team 1: {team1.size} players</span>
                                <span>Team 2: {team2.size} players</span>
                            </div>
                            <button type="button" onClick={() => setShowTeamCreation(true)} className={styles.editTeamsButton}>
                                Edit Teams
                            </button>
                        </div>
                    </div>
                )}

                <button type="submit" disabled={loading || startHour === ""} className={styles.button}>
                    {loading ? "Creating..." : "Create reservation"}
                </button>
            </form>

            {message && <p className={styles.mes}>{message}</p>}

            {showTeamCreation && (
                <SelectTeamComponent
                    setTeam1={setTeam1}
                    setTeam2={setTeam2}
                    onCancel={handleTeamCreationCancel}
                    onConfirm={handleTeamCreationConfirm}
                />
            )}
        </>
    )
}