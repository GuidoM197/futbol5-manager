"use client"

import { useState, useEffect } from "react"
import { useLocation } from "wouter"
import { getMyTournaments, getAllTournaments, deleteTournament } from "@/services/TournamentServices"
import { type Tournament, TournamentFormatLabels, TournamentStatusLabels } from "@/models/Tournament"
import styles from "./TournamentsListComponent.module.css"

export function TournamentsListComponent() {
    const [, navigate] = useLocation()
    const [myTournaments, setMyTournaments] = useState<Tournament[]>([])
    const [allTournaments, setAllTournaments] = useState<Tournament[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'my' | 'all'>('my')
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const loadTournaments = async () => {
        try {
            setLoading(true)
            setError(null)
            
            const [myTournamentsData, allTournamentsData] = await Promise.all([
                getMyTournaments(),
                getAllTournaments()
            ])
            
            setMyTournaments(myTournamentsData)
            setAllTournaments(allTournamentsData)
        } catch (err) {
            console.error('Error loading tournaments:', err)
            setError(err instanceof Error ? err.message : 'Failed to load tournaments')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadTournaments()
    }, [])

    const handleCreateTournament = () => {
        navigate("/tournaments/create")
    }

    const handleDeleteTournament = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) {
            return
        }

        try {
            setDeletingId(id)
            const success = await deleteTournament(id)
            
            if (success) {
                setMyTournaments(prev => prev.filter(t => t.id !== id))
                setAllTournaments(prev => prev.filter(t => t.id !== id))
            } else {
                setError("Failed to delete tournament. You may not have permission or the tournament cannot be deleted.")
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete tournament')
        } finally {
            setDeletingId(null)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC'
        })
    }

    const canEditTournament = (tournament: Tournament) => {
        return tournament.status === 'OPEN_FOR_REGISTRATION'
    }

    const renderTournamentCard = (tournament: Tournament, isOwner: boolean = false) => (
        <div key={tournament.id} className={styles.tournamentCard}>
            <div className={styles.tournamentHeader}>
                <h3 className={styles.tournamentName}>{tournament.name}</h3>
                <span className={`${styles.status} ${styles[tournament.status.toLowerCase()]}`}>
                    {TournamentStatusLabels[tournament.status]}
                </span>
            </div>
            
            <div className={styles.tournamentInfo}>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Start Date:</span>
                    <span>{formatDate(tournament.startDate)}</span>
                </div>
                
                {tournament.endDate && (
                    <div className={styles.infoRow}>
                        <span className={styles.label}>End Date:</span>
                        <span>{formatDate(tournament.endDate)}</span>
                    </div>
                )}
                
                <div className={styles.infoRow}>
                    <span className={styles.label}>Format:</span>
                    <span>{TournamentFormatLabels[tournament.format]}</span>
                </div>
                
                <div className={styles.infoRow}>
                    <span className={styles.label}>Max Teams:</span>
                    <span>{tournament.maxTeams}</span>
                </div>
                
                {tournament.registrationCost && (
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Registration Cost:</span>
                        <span>${tournament.registrationCost}</span>
                    </div>
                )}
                
                {tournament.prizes && (
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Prizes:</span>
                        <span>{tournament.prizes}</span>
                    </div>
                )}
                
                {tournament.description && (
                    <div className={styles.description}>
                        <span className={styles.label}>Description:</span>
                        <p>{tournament.description}</p>
                    </div>
                )}
                
                {!isOwner && (
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Organizer:</span>
                        <span>{tournament.organizerEmail}</span>
                    </div>
                )}
            </div>
            
            {isOwner && (
                <div className={styles.tournamentActions}>
                    {canEditTournament(tournament) && (
                        <button 
                            className={`${styles.actionButton} ${styles.editButton}`}
                            onClick={() => navigate(`/tournaments/${tournament.id}/edit`)}
                        >
                            Edit
                        </button>
                    )}
                    
                    {canEditTournament(tournament) && (
                        <button 
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => handleDeleteTournament(tournament.id, tournament.name)}
                            disabled={deletingId === tournament.id}
                        >
                            {deletingId === tournament.id ? 'Deleting...' : 'Delete'}
                        </button>
                    )}
                </div>
            )}
        </div>
    )

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading tournaments...</div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Tournaments</h1>
                <button 
                    className={styles.createButton}
                    onClick={handleCreateTournament}
                >
                    Create Tournament
                </button>
            </div>

            {error && (
                <div className={styles.error}>
                    {error}
                    <button 
                        className={styles.errorClose}
                        onClick={() => setError(null)}
                    >
                        ×
                    </button>
                </div>
            )}

            <div className={styles.tabs}>
                <button 
                    className={`${styles.tab} ${activeTab === 'my' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('my')}
                >
                    My Tournaments ({myTournaments.length})
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All Tournaments ({allTournaments.length})
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'my' && (
                    <div className={styles.tournamentsList}>
                        {myTournaments.length === 0 ? (
                            <div className={styles.emptyState}>
                                <h3>No tournaments yet</h3>
                                <p>Create your first tournament to get started!</p>
                                <button 
                                    className={styles.createButton}
                                    onClick={handleCreateTournament}
                                >
                                    Create Tournament
                                </button>
                            </div>
                        ) : (
                            myTournaments.map(tournament => renderTournamentCard(tournament, true))
                        )}
                    </div>
                )}

                {activeTab === 'all' && (
                    <div className={styles.tournamentsList}>
                        {allTournaments.length === 0 ? (
                            <div className={styles.emptyState}>
                                <h3>No tournaments available</h3>
                                <p>Be the first to create a tournament!</p>
                            </div>
                        ) : (
                            allTournaments.map(tournament => renderTournamentCard(tournament, false))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
} 