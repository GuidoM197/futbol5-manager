"use client"

import { useEffect, useState } from "react"
import { searchTournaments, getAllTournaments } from "@/services/TournamentServices"
import { getMyLedTeams } from "@/services/TeamServices"
import { Tournament } from "@/models/Tournament"
import { TournamentFormat, TournamentStatus, TournamentFormatLabels, TournamentStatusLabels } from "@/models/Tournament"
import { useToken } from "@/services/TokenContext"
import { Redirect } from "wouter"
import styles from "./TournamentSearchComponent.module.css"
import {BASE_API_URL} from "@/config/app-query-client.ts";

export const TournamentSearch = () => {
    const [tokenState] = useToken()
    const [tournaments, setTournaments] = useState<Tournament[]>([])
    const [ledTeams, setLedTeams] = useState<{ id: number; teamName: string }[]>([])
    const [selectedTeams, setSelectedTeams] = useState<{ [tournamentId: number]: number }>({})
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")
    const [messageType, setMessageType] = useState<"success" | "error">("success")
    const [showMessage, setShowMessage] = useState(false)
    const [shouldRedirect, setShouldRedirect] = useState(false)
    const [nameFilter, setNameFilter] = useState("")
    const [formatFilter, setFormatFilter] = useState<TournamentFormat | "">("")
    const [statusFilter, setStatusFilter] = useState<TournamentStatus | "">("")
    const [startDateFilter, setStartDateFilter] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [enrolling, setEnrolling] = useState<{ [tournamentId: number]: boolean }>({})

    useEffect(() => {
        if (tokenState.state !== "LOGGED_IN") {
            setShouldRedirect(true)
        } else {
            fetchLedTeams()
        }
    }, [tokenState])

    useEffect(() => {
        fetchAllTournaments()
    }, [])

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

    const fetchLedTeams = async () => {
        try {
            const token = localStorage.getItem("token")
            if (!token) throw new Error("No token found")
            const emailResponse = await fetch(`${BASE_API_URL}/users/get-email`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const email = await emailResponse.text()
            const teams = await getMyLedTeams(email, token)
            setLedTeams(teams)
        } catch (error) {
            showErrorMessage("Error loading your teams: " + (error as Error).message)
        }
    }

    const fetchAllTournaments = async () => {
        try {
            setLoading(true)
            const tournamentsData = await getAllTournaments()
            setTournaments(tournamentsData)
        } catch (error) {
            showErrorMessage("Error loading tournaments: " + (error as Error).message)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async () => {
        try {
            setIsSearching(true)
            const searchResults = await searchTournaments(
                nameFilter || undefined,
                formatFilter || undefined,
                statusFilter || undefined,
                startDateFilter || undefined,
            )
            setTournaments(searchResults)
            if (searchResults.length === 0) {
                showSuccessMessage("No tournaments found matching your criteria")
            } else {
                showSuccessMessage(`Found ${searchResults.length} tournament${searchResults.length !== 1 ? "s" : ""}`)
            }
        } catch (error) {
            showErrorMessage("Error searching tournaments: " + (error as Error).message)
        } finally {
            setIsSearching(false)
        }
    }

    const handleClearFilters = () => {
        setNameFilter("")
        setFormatFilter("")
        setStatusFilter("")
        setStartDateFilter("")
        fetchAllTournaments()
    }

    const handleEnroll = async (tournamentId: number) => {
        const teamId = selectedTeams[tournamentId]
        if (!teamId) {
            showErrorMessage("Please select a team to enroll")
            return
        }
        setEnrolling({ ...enrolling, [tournamentId]: true })
        try {
            const token = localStorage.getItem("token")
            if (!token) throw new Error("No token found")
            const response = await fetch(`${BASE_API_URL}/tournaments/${tournamentId}/enroll/${teamId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            if (!response.ok) {
                let errorMsg = "Error enrolling team"
                try {
                    const errorData = await response.json()
                    errorMsg = errorData.message || errorMsg
                } catch {}
                throw new Error(errorMsg)
            }
            await response.json()
            showSuccessMessage("Team enrolled successfully!")
            fetchAllTournaments()
        } catch (error) {
            showErrorMessage((error as Error).message)
        } finally {
            setEnrolling({ ...enrolling, [tournamentId]: false })
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const getStatusBadgeClass = (status: TournamentStatus) => {
        switch (status) {
            case TournamentStatus.OPEN_FOR_REGISTRATION:
                return styles.statusOpen
            case TournamentStatus.REGISTRATION_CLOSED:
                return styles.statusClosed
            case TournamentStatus.IN_PROGRESS:
                return styles.statusInProgress
            case TournamentStatus.COMPLETED:
                return styles.statusCompleted
            case TournamentStatus.CANCELLED:
                return styles.statusCancelled
            default:
                return styles.statusDefault
        }
    }

    if (shouldRedirect) {
        return <Redirect to="/login" />
    }

    if (loading) {
        return <div className={styles.loading}>Loading tournaments...</div>
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Tournament Search</h1>
            <p className={styles.subtitle}>Discover and explore tournaments on the platform</p>

            {message && (
                <div className={`${styles.message} ${styles[messageType]} ${showMessage ? styles.show : styles.hide}`}>
                    <div className={styles.messageContent}>
                        <span className={styles.messageIcon}>{messageType === "success" ? "✓" : "⚠"}</span>
                        {message}
                    </div>
                </div>
            )}

            {/* Search Filters */}
            <div className={styles.filtersContainer}>
                <div className={styles.filtersGrid}>
                    <div className={styles.filterGroup}>
                        <label htmlFor="nameFilter" className={styles.filterLabel}>
                            Tournament Name
                        </label>
                        <input
                            id="nameFilter"
                            type="text"
                            placeholder="Search by name..."
                            value={nameFilter}
                            onChange={(e) => setNameFilter(e.target.value)}
                            className={styles.filterInput}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label htmlFor="formatFilter" className={styles.filterLabel}>
                            Format
                        </label>
                        <select
                            id="formatFilter"
                            value={formatFilter}
                            onChange={(e) => setFormatFilter(e.target.value as TournamentFormat | "")}
                            className={styles.filterSelect}
                        >
                            <option value="">All Formats</option>
                            {Object.values(TournamentFormat).map((format) => (
                                <option key={format} value={format}>
                                    {TournamentFormatLabels[format]}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label htmlFor="statusFilter" className={styles.filterLabel}>
                            Status
                        </label>
                        <select
                            id="statusFilter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as TournamentStatus | "")}
                            className={styles.filterSelect}
                        >
                            <option value="">All Statuses</option>
                            {Object.values(TournamentStatus).map((status) => (
                                <option key={status} value={status}>
                                    {TournamentStatusLabels[status]}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label htmlFor="startDateFilter" className={styles.filterLabel}>
                            Start Date
                        </label>
                        <input
                            id="startDateFilter"
                            type="date"
                            value={startDateFilter}
                            onChange={(e) => setStartDateFilter(e.target.value)}
                            className={styles.filterInput}
                        />
                    </div>
                </div>

                <div className={styles.filterActions}>
                    <button onClick={handleSearch} disabled={isSearching} className={`${styles.button} ${styles.searchButton}`}>
                        {isSearching ? "Searching..." : "Search Tournaments"}
                    </button>
                    <button onClick={handleClearFilters} className={`${styles.button} ${styles.clearButton}`}>
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Tournament Results */}
            {tournaments.length === 0 ? (
                <div className={styles.noTournaments}>
                    <div className={styles.noTournamentsIcon}>🏆</div>
                    <h3>No tournaments found</h3>
                    <p>Try adjusting your search criteria or check back later for new tournaments.</p>
                </div>
            ) : (
                <div className={styles.tournamentsGrid}>
                    {tournaments.map((tournament) => (
                        <div key={tournament.id} className={styles.tournamentCard}>
                            <div className={styles.tournamentHeader}>
                                <h3 className={styles.tournamentName}>{tournament.name}</h3>
                                <span className={`${styles.statusBadge} ${getStatusBadgeClass(tournament.status)}`}>
                                    {TournamentStatusLabels[tournament.status]}
                                </span>
                            </div>

                            <div className={styles.tournamentInfo}>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Format:</span>
                                    <span className={styles.infoValue}>{TournamentFormatLabels[tournament.format]}</span>
                                </div>

                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Start Date:</span>
                                    <span className={styles.infoValue}>{formatDate(tournament.startDate)}</span>
                                </div>

                                {tournament.endDate && (
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>End Date:</span>
                                        <span className={styles.infoValue}>{formatDate(tournament.endDate)}</span>
                                    </div>
                                )}

                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Max Teams:</span>
                                    <span className={styles.infoValue}>{tournament.maxTeams}</span>
                                </div>

                                {tournament.registrationCost && (
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Registration Cost:</span>
                                        <span className={styles.infoValue}>${tournament.registrationCost}</span>
                                    </div>
                                )}

                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Organizer:</span>
                                    <span className={styles.infoValue}>{tournament.organizerEmail}</span>
                                </div>
                            </div>

                            {tournament.description && (
                                <div className={styles.tournamentDescription}>
                                    <h4>Description</h4>
                                    <p>{tournament.description}</p>
                                </div>
                            )}

                            {tournament.prizes && (
                                <div className={styles.tournamentPrizes}>
                                    <h4>Prizes</h4>
                                    <p>{tournament.prizes}</p>
                                </div>
                            )}

                            {tournament.status === TournamentStatus.OPEN_FOR_REGISTRATION && (
                                <div className={styles.enrollContainer}>
                                    <select
                                        value={selectedTeams[tournament.id] || ""}
                                        onChange={(e) =>
                                            setSelectedTeams({
                                                ...selectedTeams,
                                                [tournament.id]: parseInt(e.target.value),
                                            })
                                        }
                                        className={styles.teamSelect}
                                        disabled={ledTeams.length === 0}
                                    >
                                        <option value="">Select a team</option>
                                        {ledTeams.map((team) => (
                                            <option key={team.id} value={team.id}>
                                                {team.teamName}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => handleEnroll(tournament.id)}
                                        disabled={enrolling[tournament.id] || !selectedTeams[tournament.id]}
                                        className={`${styles.button} ${styles.enrollButton}`}
                                    >
                                        {enrolling[tournament.id] ? "Enrolling..." : "Enroll Team"}
                                    </button>
                                </div>
                            )}

                            <div className={styles.tournamentFooter}>
                                <span className={styles.createdDate}>Created: {formatDate(tournament.createdAt)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}