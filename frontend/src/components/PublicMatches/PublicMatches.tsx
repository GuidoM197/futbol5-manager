"use client"

import { useEffect, useState } from "react"
import { getAllPublicMatches, joinMatch, confirmParticipation, leaveMatch, type Match } from "@/services/MatchService"
import { useToken } from "@/services/TokenContext"
import { Redirect } from "wouter"
import styles from "./PublicMatches.module.css"

export const PublicMatches = () => {
    const [tokenState] = useToken()
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")
    const [messageType, setMessageType] = useState<"success" | "error">("success")
    const [showMessage, setShowMessage] = useState(false)
    const [shouldRedirect, setShouldRedirect] = useState(false)
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [joiningMatchId, setJoiningMatchId] = useState<number | null>(null)
    const [confirmingMatchId, setConfirmingMatchId] = useState<number | null>(null)
    const [leavingMatchId, setLeavingMatchId] = useState<number | null>(null)

    const getCurrentUserEmail = () => {
        if (tokenState.state === "LOGGED_IN") {
            const token = localStorage.getItem("token")
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split(".")[1]))
                    return payload.sub || payload.email
                } catch {
                    return null
                }
            }
        }
        return null
    }

    useEffect(() => {
        if (tokenState.state !== "LOGGED_IN") {
            setShouldRedirect(true)
        }
    }, [tokenState])

    useEffect(() => {
        fetchMatches()
    }, [currentPage])

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

    const fetchMatches = async () => {
        try {
            setLoading(true)
            const matchesData = await getAllPublicMatches(currentPage, 10)
            setMatches(matchesData.content)
            setTotalPages(matchesData.totalPages)
            setTotalElements(matchesData.totalElements)
        } catch (error) {
            showErrorMessage("Error loading public matches: " + (error as Error).message)
        } finally {
            setLoading(false)
        }
    }

    const handleJoinMatch = async (match: Match) => {
        if (tokenState.state !== "LOGGED_IN" || tokenState.role !== "USER") {
            showErrorMessage("Only users can join matches")
            return
        }
        if (!match || !match.id) {
            showErrorMessage("Invalid match data")
            return
        }
        const matchId = match.id
        try {
            setJoiningMatchId(matchId)
            const updatedMatch = await joinMatch(matchId)
            setMatches(matches.map((m) => (m.id === matchId ? updatedMatch : m)))
            showSuccessMessage("Successfully joined the match!")
        } catch (error) {
            console.error("Error joining match:", error)
            showErrorMessage((error as Error).message)
        } finally {
            setJoiningMatchId(null)
        }
    }

    const handleLeaveMatch = async (match: Match) => {
        if (tokenState.state !== "LOGGED_IN" || tokenState.role !== "USER") {
            showErrorMessage("Only users can leave matches")
            return
        }
        if (!match || !match.id) {
            showErrorMessage("Invalid match data")
            return
        }

        if (match.confirmed) {
            showErrorMessage("Cannot leave a confirmed match")
            return
        }

        const matchId = match.id
        try {
            setLeavingMatchId(matchId)
            const updatedMatch = await leaveMatch(matchId)
            setMatches(matches.map((m) => (m.id === matchId ? updatedMatch : m)))
            showSuccessMessage("Successfully left the match!")
        } catch (error) {
            console.error("Error leaving match:", error)
            showErrorMessage((error as Error).message)
        } finally {
            setLeavingMatchId(null)
        }
    }

    const handleConfirmParticipation = async (match: Match) => {
        if (tokenState.state !== "LOGGED_IN" || tokenState.role !== "USER") {
            showErrorMessage("Only users can confirm participation")
            return
        }
        if (!match || !match.id) {
            showErrorMessage("Invalid match data")
            return
        }
        const matchId = match.id
        try {
            setConfirmingMatchId(matchId)
            const updatedMatch = await confirmParticipation(matchId)
            setMatches(matches.map((m) => (m.id === matchId ? updatedMatch : m)))
            showSuccessMessage("Successfully confirmed participation!")
        } catch (error) {
            console.error("Error confirming participation:", error)
            showErrorMessage((error as Error).message)
        } finally {
            setConfirmingMatchId(null)
        }
    }

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage)
        }
    }

    const formatTeamMembers = (memberEmails: string[]) => {
        if (memberEmails.length <= 3) {
            return memberEmails.join(", ")
        }
        return `${memberEmails.slice(0, 3).join(", ")} +${memberEmails.length - 3} more`
    }

    const canJoinMatch = (match: Match) => {
        if (tokenState.state !== "LOGGED_IN" || tokenState.role !== "USER") {
            return false
        }

        if (match.confirmed) {
            return false
        }

        const userEmail = getCurrentUserEmail()
        if (!userEmail) return false

        const isInMatch =
            match.firstTeam.memberEmails.includes(userEmail) || match.secondTeam.memberEmails.includes(userEmail)
        if (isInMatch) return false

        const firstTeamFull = match.firstTeam.memberEmails.length >= 5
        const secondTeamFull = match.secondTeam.memberEmails.length >= 5
        return !firstTeamFull || !secondTeamFull
    }

    const canLeaveMatch = (match: Match) => {
        if (tokenState.state !== "LOGGED_IN" || tokenState.role !== "USER") {
            return false
        }

        if (match.confirmed) {
            return false
        }

        const userEmail = getCurrentUserEmail()
        if (!userEmail) return false

        return match.firstTeam.memberEmails.includes(userEmail) || match.secondTeam.memberEmails.includes(userEmail)
    }

    const canConfirmMatch = (match: Match) => {
        if (tokenState.state !== "LOGGED_IN" || tokenState.role !== "USER") {
            return false
        }
        const totalPlayers = match.firstTeam.memberEmails.length + match.secondTeam.memberEmails.length
        return totalPlayers === 10 && !match.confirmed
    }

    const getTeamSlotsInfo = (match: Match) => {
        if (match.confirmed) {
            return "Match confirmed"
        }

        const firstTeamSlots = 5 - match.firstTeam.memberEmails.length
        const secondTeamSlots = 5 - match.secondTeam.memberEmails.length
        if (firstTeamSlots === 0 && secondTeamSlots === 0) {
            return "Match is full"
        }
        const availableSlots = firstTeamSlots + secondTeamSlots
        return `${availableSlots} slot${availableSlots !== 1 ? "s" : ""} available`
    }

    const getMatchStatusMessage = (match: Match) => {
        if (match.confirmed) {
            return "This match is confirmed. No changes allowed."
        }
        return null
    }

    if (shouldRedirect) {
        return <Redirect to="/login" />
    }

    if (loading) {
        return <div className={styles.loading}>Loading public matches...</div>
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Public Matches</h1>
            <p className={styles.subtitle}>Discover and join open matches in your area</p>

            {message && (
                <div className={`${styles.message} ${styles[messageType]} ${showMessage ? styles.show : styles.hide}`}>
                    <div className={styles.messageContent}>
                        <span className={styles.messageIcon}>{messageType === "success" ? "✓" : "⚠"}</span>
                        {message}
                    </div>
                </div>
            )}

            {matches.length === 0 ? (
                <div className={styles.noMatches}>
                    <div className={styles.noMatchesIcon}>⚽</div>
                    <h3>No public matches available</h3>
                    <p>Be the first to create a public match!</p>
                </div>
            ) : (
                <>
                    <div className={styles.matchesGrid}>
                        {matches.map((match) => {
                            const canJoin = canJoinMatch(match)
                            const canLeave = canLeaveMatch(match)
                            const canConfirm = canConfirmMatch(match)
                            const statusMessage = getMatchStatusMessage(match)

                            return (
                                <div key={match.id} className={styles.matchCard}>
                                    <div className={styles.matchHeader}>
                                        <div className={styles.matchStatus}>
                      <span className={`${styles.statusBadge} ${match.confirmed ? styles.confirmed : styles.pending}`}>
                        {match.confirmed ? "Confirmed" : "Pending"}
                      </span>
                                            <span className={styles.matchType}>PUBLIC</span>
                                        </div>
                                        <div className={styles.slotsInfo}>
                      <span
                          className={`${styles.slotsBadge} ${match.confirmed ? styles.confirmed : canJoinMatch(match) ? styles.available : styles.full}`}
                      >
                        {getTeamSlotsInfo(match)}
                      </span>
                                        </div>
                                    </div>

                                    {statusMessage && (
                                        <div className={styles.statusMessage}>
                                            <span className={styles.statusMessageIcon}>🔒</span>
                                            {statusMessage}
                                        </div>
                                    )}

                                    <div className={styles.teamsContainer}>
                                        <div className={styles.team}>
                                            <h4 className={styles.teamName}>
                                                <span>Team 1</span>
                                                <span className={styles.teamCount}>({match.firstTeam.memberEmails.length}/5)</span>
                                            </h4>
                                            <p className={styles.teamMembers}>Members: {formatTeamMembers(match.firstTeam.memberEmails)}</p>
                                        </div>

                                        <div className={styles.vsContainer}>
                                            <span className={styles.vs}>VS</span>
                                        </div>

                                        <div className={styles.team}>
                                            <h4 className={styles.teamName}>
                                                <span>Team 2</span>
                                                <span className={styles.teamCount}>({match.secondTeam.memberEmails.length}/5)</span>
                                            </h4>
                                            <p className={styles.teamMembers}>Members: {formatTeamMembers(match.secondTeam.memberEmails)}</p>
                                        </div>
                                    </div>

                                    <div className={styles.reservationInfo}>
                                        <div className={styles.reservationTitle}>Cancha</div>
                                        <div className={styles.reservationDetails}>
                                            <p>
                                                <strong>Nombre:</strong> {match.fieldName}
                                            </p>
                                            <p>
                                                <strong>Ubicación:</strong> {match.fieldLocation}
                                            </p>
                                            <p>
                                                <strong>Fecha:</strong> {new Date(match.startTime).toLocaleDateString()}
                                            </p>
                                            <p>
                                                <strong>Hora:</strong>{" "}
                                                {new Date(match.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                                                {new Date(match.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={styles.matchActions}>
                                        {tokenState.state === "LOGGED_IN" && tokenState.role === "USER" && (
                                            <>
                                                {canJoin && (
                                                    <button
                                                        className={`${styles.button} ${styles.joinButton} ${!canJoin ? styles.disabled : ""}`}
                                                        onClick={() => handleJoinMatch(match)}
                                                        disabled={!canJoin || joiningMatchId === match.id}
                                                    >
                                                        {joiningMatchId === match.id ? "Joining..." : "Join Match"}
                                                    </button>
                                                )}
                                                {canLeave && (
                                                    <button
                                                        className={`${styles.button} ${styles.leaveButton} ${leavingMatchId === match.id ? styles.disabled : ""}`}
                                                        onClick={() => handleLeaveMatch(match)}
                                                        disabled={leavingMatchId === match.id}
                                                    >
                                                        {leavingMatchId === match.id ? "Leaving..." : "Leave Match"}
                                                    </button>
                                                )}
                                                {canConfirm && (
                                                    <button
                                                        className={`${styles.button} ${styles.confirmButton} ${confirmingMatchId === match.id ? styles.disabled : ""}`}
                                                        onClick={() => handleConfirmParticipation(match)}
                                                        disabled={confirmingMatchId === match.id}
                                                    >
                                                        {confirmingMatchId === match.id ? "Confirming..." : "Confirm Participation"}
                                                    </button>
                                                )}
                                                {match.confirmed && (
                                                    <div className={styles.confirmedMessage}>
                                                        <span className={styles.confirmedIcon}>✅</span>
                                                        Match is locked and confirmed
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                className={`${styles.paginationButton} ${currentPage === 0 ? styles.disabled : ""}`}
                            >
                                Previous
                            </button>
                            <div className={styles.pageInfo}>
                <span>
                  Page {currentPage + 1} of {totalPages}
                </span>
                                <span className={styles.totalElements}>({totalElements} matches total)</span>
                            </div>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1}
                                className={`${styles.paginationButton} ${currentPage >= totalPages - 1 ? styles.disabled : ""}`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
