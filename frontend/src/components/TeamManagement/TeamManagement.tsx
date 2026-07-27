"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { getMyTeams, deleteTeam, updateTeam, type Team, type TeamCreateDTO } from "@/services/TeamServices"
import { useToken } from "@/services/TokenContext"
import { Redirect, useLocation } from "wouter"
import styles from "./TeamManagement.module.css"

export const TeamsManagement = () => {
    const [tokenState] = useToken()
    const [, navigate] = useLocation()
    const [teams, setTeams] = useState<Team[]>([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")
    const [messageType, setMessageType] = useState<"success" | "error">("success")
    const [showMessage, setShowMessage] = useState(false)
    const [editingTeam, setEditingTeam] = useState<Team | null>(null)
    const [shouldRedirect, setShouldRedirect] = useState(false)

    useEffect(() => {
        if (tokenState.state !== "LOGGED_IN" || tokenState.role !== "USER") {
            setShouldRedirect(true)
        }
    }, [tokenState])

    useEffect(() => {
        if (tokenState.state === "LOGGED_IN" && tokenState.role === "USER") {
            fetchTeams()
        }
    }, [tokenState])

    useEffect(() => {
        if (message) {
            setShowMessage(true)
            const timer = setTimeout(() => {
                setShowMessage(false)
                setTimeout(() => setMessage(""), 300)
            }, 4000)

            return () => clearTimeout(timer)
        }
    }, [message])

    const showSuccessMessage = (msg: string) => {
        setMessage(msg)
        setMessageType("success")
    }

    const showErrorMessage = (msg: string) => {
        setMessage(msg)
        setMessageType("error")
    }

    const fetchTeams = async () => {
        try {
            setLoading(true)
            const teamsData = await getMyTeams()
            setTeams(teamsData)
        } catch (error) {
            console.error("Error fetching teams:", error)
            showErrorMessage("Error loading teams: " + (error as Error).message)
        } finally {
            setLoading(false)
        }
    }

    const getCurrentUserEmail = (): string => {
        if (tokenState.state === "LOGGED_IN" && tokenState.accessToken) {
            try {
                return JSON.parse(atob(tokenState.accessToken.split(".")[1])).sub
            } catch (error) {
                console.error("Error parsing token:", error)
            }
        }
        return ""
    }

    const isTeamLeader = (team: Team): boolean => {
        return team.leader === getCurrentUserEmail()
    }

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to delete team "${name}"?`)) {
            return
        }

        try {
            const success = await deleteTeam(id)
            if (success) {
                setTeams(teams.filter((t) => t.id !== id))
                showSuccessMessage("Team deleted successfully!")
            } else {
                showErrorMessage("Error deleting team. You may not have permission.")
            }
        } catch (error) {
            showErrorMessage("Error deleting team: " + (error as Error).message)
        }
    }

    const handleEdit = (team: Team) => {
        setEditingTeam(team)
    }

    const handleSaveEdit = async (updatedData: TeamCreateDTO) => {
        if (!editingTeam) return

        try {
            const updatedTeam = await updateTeam(editingTeam.id, updatedData)
            if (updatedTeam) {
                setTeams(teams.map((t) => (t.id === editingTeam.id ? updatedTeam : t)))
                setEditingTeam(null)
                showSuccessMessage("Team updated successfully!")
            } else {
                showErrorMessage("Error updating team. Check that all members are valid users from your location.")
            }
        } catch (error) {
            showErrorMessage("Error updating team: " + (error as Error).message)
        }
    }

    const handleCancelEdit = () => {
        setEditingTeam(null)
    }

    const currentUserEmail = getCurrentUserEmail()

    const leaderTeams = teams.filter((team) => isTeamLeader(team))
    const memberTeams = teams.filter((team) => !isTeamLeader(team) && team.memberEmails.includes(currentUserEmail))

    if (shouldRedirect) {
        return <Redirect to="/" />
    }

    if (loading) {
        return <div className={styles.loading}>Loading teams...</div>
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>My Teams</h1>
                <button onClick={() => navigate("/soccer-fields/create-team")} className={styles.createButton}>
                    Create New Team
                </button>
            </div>

            {message && (
                <div className={`${styles.message} ${styles[messageType]} ${showMessage ? styles.show : styles.hide}`}>
                    <div className={styles.messageContent}>
                        <span className={styles.messageIcon}>{messageType === "success" ? "✓" : "⚠"}</span>
                        {message}
                    </div>
                </div>
            )}

            {teams.length === 0 ? (
                <div className={styles.noTeams}>
                    <p>You are not a member of any teams yet.</p>
                </div>
            ) : (
                <div className={styles.teamsContainer}>
                    {}
                    {leaderTeams.length > 0 && (
                        <div className={styles.teamSection}>
                            <h2 className={styles.sectionTitle}>Teams I Lead ({leaderTeams.length})</h2>
                            <div className={styles.teamsGrid}>
                                {leaderTeams.map((team) => (
                                    <TeamCard
                                        key={team.id}
                                        team={team}
                                        isLeader={true}
                                        currentUserEmail={currentUserEmail}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {}
                    {memberTeams.length > 0 && (
                        <div className={styles.teamSection}>
                            <h2 className={styles.sectionTitle}>Teams I'm Member Of ({memberTeams.length})</h2>
                            <div className={styles.teamsGrid}>
                                {memberTeams.map((team) => (
                                    <TeamCard
                                        key={team.id}
                                        team={team}
                                        isLeader={false}
                                        currentUserEmail={currentUserEmail}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {editingTeam && (
                <EditTeamModal
                    team={editingTeam}
                    onSave={handleSaveEdit}
                    onCancel={handleCancelEdit}
                    currentUserEmail={currentUserEmail}
                />
            )}
        </div>
    )
}

interface TeamCardProps {
    team: Team
    isLeader: boolean
    currentUserEmail: string
    onEdit: (team: Team) => void
    onDelete: (id: number, name: string) => void
}

const TeamCard = ({ team, isLeader, currentUserEmail, onEdit, onDelete }: TeamCardProps) => {
    return (
        <div className={`${styles.teamCard} ${isLeader ? styles.leaderCard : styles.memberCard}`}>
            <div className={styles.teamHeader}>
                <h3 className={styles.teamName}>{team.teamName}</h3>
                {isLeader && <span className={styles.leaderBadge}>Leader</span>}
            </div>

            <div className={styles.teamInfo}>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Leader:</span>
                    <span className={styles.value}>{team.leader}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Members:</span>
                    <span className={styles.value}>{team.memberEmails.length}</span>
                </div>
            </div>

            <div className={styles.membersList}>
                <h4 className={styles.membersTitle}>Team Members:</h4>
                <ul className={styles.membersUl}>
                    {team.memberEmails.map((email) => (
                        <li key={email} className={`${styles.memberItem} ${email === currentUserEmail ? styles.currentUser : ""}`}>
                            {email} {email === currentUserEmail && <span className={styles.youBadge}>(You)</span>}
                            {email === team.leader && <span className={styles.leaderIndicator}>👑</span>}
                        </li>
                    ))}
                </ul>
            </div>

            {isLeader && (
                <div className={styles.actions}>
                    <button onClick={() => onEdit(team)} className={`${styles.button} ${styles.editButton}`}>
                        Edit Team
                    </button>
                    <button
                        onClick={() => onDelete(team.id, team.teamName)}
                        className={`${styles.button} ${styles.deleteButton}`}
                    >
                        Delete Team
                    </button>
                </div>
            )}

            {!isLeader && (
                <div className={styles.memberInfo}>
                    <p className={styles.memberText}>You are a member of this team</p>
                </div>
            )}
        </div>
    )
}

interface EditTeamModalProps {
    team: Team
    onSave: (data: TeamCreateDTO) => void
    onCancel: () => void
    currentUserEmail: string
}

const EditTeamModal = ({ team, onSave, onCancel, currentUserEmail }: EditTeamModalProps) => {
    const [memberEmails, setMemberEmails] = useState<string[]>(team.memberEmails)
    const [leader, setLeader] = useState<string>(team.leader)
    const [formError, setFormError] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setFormError("")

        if (memberEmails.length !== 5) {
            setFormError("Team must have exactly 5 members")
            return
        }

        const validEmails = memberEmails.filter((email) => email.trim() !== "")
        if (validEmails.length !== 5 || !leader.trim()) {
            setFormError("All member emails and leader email must be filled")
            return
        }

        const uniqueEmails = new Set(validEmails)
        if (uniqueEmails.size !== validEmails.length) {
            setFormError("All member emails must be unique")
            return
        }

        if (!validEmails.includes(leader)) {
            setFormError("Leader must be one of the team members")
            return
        }

        const teamCreateDTO: TeamCreateDTO = {
            name: team.teamName,
            leader: leader,
            memberEmails: validEmails,
        }

        onSave(teamCreateDTO)
    }

    const handleEmailChange = (index: number, value: string) => {
        const newEmails = [...memberEmails]
        newEmails[index] = value
        setMemberEmails(newEmails)
    }

    const handleLeaderChange = (newLeader: string) => {
        setLeader(newLeader)
    }

    const validMemberEmails = memberEmails.filter((email) => email.trim() !== "")
    const uniqueValidEmails = [...new Set(validMemberEmails)]

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h2 className={styles.modalTitle}>Edit Team</h2>
                <p className={styles.modalSubtitle}>Team: {team.teamName}</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {formError && <div className={styles.formError}>{formError}</div>}

                    <div className={styles.membersInputs}>
                        <h4 className={styles.membersInputTitle}>Team Members (5 required):</h4>
                        {memberEmails.map((email, index) => (
                            <div key={index} className={styles.inputGroup}>
                                <label className={styles.label}>Member {index + 1}:</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => handleEmailChange(index, e.target.value)}
                                    required
                                    className={styles.input}
                                    placeholder="member@example.com"
                                />
                            </div>
                        ))}
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Team Leader:</label>
                        <select
                            value={leader}
                            onChange={(e) => handleLeaderChange(e.target.value)}
                            required
                            className={styles.select}
                        >
                            <option value="">Select a leader...</option>
                            {uniqueValidEmails.map((email) => (
                                <option key={email} value={email}>
                                    {email} {email === currentUserEmail ? "(You)" : ""}
                                </option>
                            ))}
                        </select>
                        <small className={styles.helpText}>
                            The leader must be one of the team members listed above. Fill in all member emails first.
                        </small>
                    </div>

                    <div className={styles.modalActions}>
                        <button type="submit" className={`${styles.button} ${styles.saveButton}`}>
                            Save Changes
                        </button>
                        <button type="button" onClick={onCancel} className={`${styles.button} ${styles.cancelButton}`}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
