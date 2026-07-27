"use client"

import React from "react"
import { useState } from "react"
import styles from "./SelectTeamComponent.module.css"
import { getMyLedTeams, Team } from "@/services/TeamServices.ts" // Importa el tipo Team

interface CreateTeamComponentProps {
    setTeam1: (team: Set<string>) => void
    setTeam2: (team: Set<string>) => void
    onCancel: () => void
    onConfirm: () => void
}

export const SelectTeamComponent: React.FC<CreateTeamComponentProps> = ({
                                                                            setTeam1,
                                                                            setTeam2,
                                                                            onCancel,
                                                                            onConfirm,
                                                                        }) => {
    const [team1Leader, setTeam1Leader] = useState("")
    const [team2Leader, setTeam2Leader] = useState("")
    const [team1Options, setTeam1Options] = useState<Team[]>([])
    const [team2Options, setTeam2Options] = useState<Team[]>([])
    const [selectedTeam1, setSelectedTeam1] = useState<Team | null>(null)
    const [selectedTeam2, setSelectedTeam2] = useState<Team | null>(null)
    const [team1Loading, setTeam1Loading] = useState(false)
    const [team2Loading, setTeam2Loading] = useState(false)
    const [team1Error, setTeam1Error] = useState<string | null>(null)
    const [team2Error, setTeam2Error] = useState<string | null>(null)

    const fetchTeamsByLeader = async (leaderEmail: string, teamNumber: 1 | 2) => {
        if (!leaderEmail.trim()) return

        const setLoading = teamNumber === 1 ? setTeam1Loading : setTeam2Loading
        const setOptions = teamNumber === 1 ? setTeam1Options : setTeam2Options
        const setError = teamNumber === 1 ? setTeam1Error : setTeam2Error
        const setSelected = teamNumber === 1 ? setSelectedTeam1 : setSelectedTeam2

        setLoading(true)
        setError(null)
        setSelected(null)

        try {
            const token = localStorage.getItem("token")
            if (!token) {
                setError("No authentication token found")
                return
            }

            const teams = await getMyLedTeams(leaderEmail, token)
            setOptions(teams)

            if (teams.length === 0) {
                setError("No teams found for this leader")
            }
        } catch (error) {
            console.error(`Error fetching teams for team ${teamNumber}:`, error)
            setError("Error loading teams")
            setOptions([])
        } finally {
            setLoading(false)
        }
    }

    const handleTeamSelection = (teamId: string, teamNumber: 1 | 2) => {
        const options = teamNumber === 1 ? team1Options : team2Options
        const setSelected = teamNumber === 1 ? setSelectedTeam1 : setSelectedTeam2
        const setTeam = teamNumber === 1 ? setTeam1 : setTeam2

        const team = options.find((t) => String(t.id) === teamId)
        if (team) {
            setSelected(team)
            if (setTeam) {
                setTeam(new Set(team.memberEmails))
            }
        }
    }

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm()
        }
    }

    const handleCancel = () => {
        // Reset all states
        setTeam1Leader("")
        setTeam2Leader("")
        setTeam1Options([])
        setTeam2Options([])
        setSelectedTeam1(null)
        setSelectedTeam2(null)
        setTeam1Error(null)
        setTeam2Error(null)

        // Reset parent team states
        if (setTeam1) setTeam1(new Set())
        if (setTeam2) setTeam2(new Set())

        if (onCancel) {
            onCancel()
        }
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Select Teams</h1>
                    <button type="button" className={styles.closeButton} onClick={handleCancel}>
                        ×
                    </button>
                </div>

                <div className={styles.teamsContainer}>
                    {/* Team 1 */}
                    <div className={styles.teamSection}>
                        <div className={styles.teamHeader}>
                            <h3 className={styles.teamTitle}>Team 1</h3>
                            <span className={styles.playerCount}>
                {selectedTeam1 ? `${selectedTeam1.memberEmails.length}/5` : "0/5"}
              </span>
                        </div>

                        <p className={styles.teamDescription}>Select a team to add all 5 players</p>

                        <div className={styles.inputGroup}>
                            <input
                                className={styles.input}
                                type="email"
                                value={team1Leader}
                                onChange={(e) => setTeam1Leader(e.target.value)}
                                onBlur={() => fetchTeamsByLeader(team1Leader, 1)}
                                placeholder="Leader email"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <select
                                className={styles.select}
                                value={selectedTeam1?.id || ""}
                                onChange={(e) => handleTeamSelection(e.target.value, 1)}
                                disabled={team1Loading || team1Options.length === 0}
                            >
                                <option value="">Select a team</option>
                                {team1Options.map((team) => (
                                    <option key={team.id} value={team.id}>
                                        {team.teamName} ({team.memberEmails.length} players)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {team1Loading && <div className={styles.loading}>Loading teams...</div>}

                        {team1Error && <div className={styles.error}>{team1Error}</div>}

                        {!selectedTeam1 && !team1Loading && !team1Error && (
                            <div className={styles.noPlayers}>No players in this team</div>
                        )}

                        {selectedTeam1 && (
                            <div className={styles.teamInfo}>
                                <h4 className={styles.teamName}>{selectedTeam1.teamName}</h4>
                                <div className={styles.membersList}>
                                    {selectedTeam1.memberEmails.map((email, index) => (
                                        <span key={index} className={styles.memberEmail}>
                      {email}
                    </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Team 2 */}
                    <div className={styles.teamSection}>
                        <div className={styles.teamHeader}>
                            <h3 className={styles.teamTitle}>Team 2</h3>
                            <span className={styles.playerCount}>
                {selectedTeam2 ? `${selectedTeam2.memberEmails.length}/5` : "0/5"}
              </span>
                        </div>

                        <p className={styles.teamDescription}>Select a team to add all 5 players</p>

                        <div className={styles.inputGroup}>
                            <input
                                className={styles.input}
                                type="email"
                                value={team2Leader}
                                onChange={(e) => setTeam2Leader(e.target.value)}
                                onBlur={() => fetchTeamsByLeader(team2Leader, 2)}
                                placeholder="Leader email"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <select
                                className={styles.select}
                                value={selectedTeam2?.id || ""}
                                onChange={(e) => handleTeamSelection(e.target.value, 2)}
                                disabled={team2Loading || team2Options.length === 0}
                            >
                                <option value="">Select a team</option>
                                {team2Options.map((team) => (
                                    <option key={team.id} value={team.id}>
                                        {team.teamName} ({team.memberEmails.length} players)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {team2Loading && <div className={styles.loading}>Loading teams...</div>}

                        {team2Error && <div className={styles.error}>{team2Error}</div>}

                        {!selectedTeam2 && !team2Loading && !team2Error && (
                            <div className={styles.noPlayers}>No players in this team</div>
                        )}

                        {selectedTeam2 && (
                            <div className={styles.teamInfo}>
                                <h4 className={styles.teamName}>{selectedTeam2.teamName}</h4>
                                <div className={styles.membersList}>
                                    {selectedTeam2.memberEmails.map((email, index) => (
                                        <span key={index} className={styles.memberEmail}>
                      {email}
                    </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.buttons}>
                    <button type="button" className={`${styles.button} ${styles.cancelButton}`} onClick={handleCancel}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className={`${styles.button} ${styles.confirmButton}`}
                        onClick={handleConfirm}
                        disabled={!selectedTeam1 && !selectedTeam2}
                    >
                        Confirm Teams
                    </button>
                </div>
            </div>
        </div>
    )
}
