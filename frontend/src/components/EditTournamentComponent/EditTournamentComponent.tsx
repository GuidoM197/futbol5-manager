"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getTournamentById, updateTournament } from "@/services/TournamentServices"
import { TournamentFormat, TournamentFormatLabels, type TournamentCreateDTO, type Tournament } from "@/models/Tournament"
import styles from "../CreateTournamentComponent/CreateTournamentComponent.module.css"

interface EditTournamentComponentProps {
    tournamentId: number
    onSuccess?: () => void
    onCancel?: () => void
}

export function EditTournamentComponent({ tournamentId, onSuccess, onCancel }: EditTournamentComponentProps) {
    const [tournament, setTournament] = useState<Tournament | null>(null)
    const [formData, setFormData] = useState<TournamentCreateDTO>({
        name: "",
        startDate: "",
        format: TournamentFormat.SINGLE_ELIMINATION,
        maxTeams: 4,
        endDate: "",
        description: "",
        prizes: "",
        registrationCost: undefined
    })
    
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    useEffect(() => {
        const loadTournament = async () => {
            try {
                setLoading(true)
                setError(null)
                
                const tournamentData = await getTournamentById(tournamentId)
                setTournament(tournamentData)
                
                // Populate form with existing data
                setFormData({
                    name: tournamentData.name,
                    startDate: tournamentData.startDate,
                    format: tournamentData.format,
                    maxTeams: tournamentData.maxTeams,
                    endDate: tournamentData.endDate || "",
                    description: tournamentData.description || "",
                    prizes: tournamentData.prizes || "",
                    registrationCost: tournamentData.registrationCost || undefined
                })
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load tournament')
            } finally {
                setLoading(false)
            }
        }

        loadTournament()
    }, [tournamentId])

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                const successDiv = document.querySelector(`.${styles.success}`) as HTMLElement
                if (successDiv) {
                    successDiv.style.transition = "opacity 0.5s"
                    successDiv.style.opacity = "0"
                    setTimeout(() => setSuccessMessage(null), 500)
                } else {
                    setSuccessMessage(null)
                }
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [successMessage])

    const getTomorrowDateString = () => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow.toISOString().split('T')[0]
    }

    const handleInputChange = (field: keyof TournamentCreateDTO, value: string | number | TournamentFormat) => {
        const processedValue = field === 'registrationCost' && value === "" ? undefined : value
        setFormData(prev => ({ ...prev, [field]: processedValue }))
        setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        setSuccessMessage(null)

        try {
            // Validate dates
            const startDate = new Date(formData.startDate)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            
            if (startDate <= today) {
                setError("Start date must be in the future")
                setSaving(false)
                return
            }

            if (formData.endDate) {
                const endDate = new Date(formData.endDate)
                if (endDate < startDate) {
                    setError("End date cannot be before start date")
                    setSaving(false)
                    return
                }
            }

            // Prepare data for submission
            const submitData: TournamentCreateDTO = {
                ...formData,
                endDate: formData.endDate || undefined,
                description: formData.description || undefined,
                prizes: formData.prizes || undefined,
                registrationCost: formData.registrationCost || undefined
            }

            await updateTournament(tournamentId, submitData)

            setSuccessMessage(`Tournament "${formData.name}" updated successfully!`)
            
            if (onSuccess) {
                setTimeout(() => onSuccess(), 1000)
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || "Failed to update tournament")
            } else {
                setError("Failed to update tournament")
            }
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading tournament...</div>
            </div>
        )
    }

    if (!tournament) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>Tournament not found</div>
            </div>
        )
    }

    // Check if tournament can be edited
    if (tournament.status !== 'OPEN_FOR_REGISTRATION') {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    This tournament cannot be edited because it's no longer open for registration.
                </div>
                {onCancel && (
                    <button 
                        className={`${styles.button} ${styles.cancelButton}`}
                        onClick={onCancel}
                        style={{ marginTop: '20px' }}
                    >
                        Back to Tournaments
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Edit Tournament</h1>

            {successMessage && (
                <div className={styles.success}>
                    <div className={styles.successIcon}>✓</div>
                    <span>{successMessage}</span>
                    <button type="button" className={styles.closeSuccess} onClick={() => setSuccessMessage(null)}>
                        ×
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
                {/* Required Fields */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Required Information</h3>
                    
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Tournament Name *</label>
                        <input
                            className={styles.input}
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter tournament name"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Start Date *</label>
                        <input
                            className={styles.input}
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                            min={getTomorrowDateString()}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Tournament Format *</label>
                        <select
                            className={styles.input}
                            value={formData.format}
                            onChange={(e) => handleInputChange('format', e.target.value as TournamentFormat)}
                            required
                        >
                            {Object.entries(TournamentFormatLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Maximum Teams *</label>
                        <input
                            className={styles.input}
                            type="number"
                            min="2"
                            max="64"
                            value={formData.maxTeams}
                            onChange={(e) => handleInputChange('maxTeams', parseInt(e.target.value))}
                            required
                        />
                    </div>
                </div>

                {/* Optional Fields */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Optional Information</h3>
                    
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>End Date</label>
                        <input
                            className={styles.input}
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                            min={formData.startDate || getTomorrowDateString()}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Description / Rules</label>
                        <textarea
                            className={`${styles.input} ${styles.textarea}`}
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Enter tournament description and rules"
                            rows={4}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Prizes</label>
                        <input
                            className={styles.input}
                            type="text"
                            value={formData.prizes}
                            onChange={(e) => handleInputChange('prizes', e.target.value)}
                            placeholder="Enter prize information"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Registration Cost per Team</label>
                        <input
                            className={styles.input}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.registrationCost || ""}
                            onChange={(e) => handleInputChange('registrationCost', e.target.value ? parseFloat(e.target.value) : "")}
                            placeholder="0.00"
                        />
                    </div>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.buttons}>
                    {onCancel && (
                        <button
                            type="button"
                            className={`${styles.button} ${styles.cancelButton}`}
                            onClick={onCancel}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                    )}
                    <button type="submit" className={`${styles.button} ${styles.submitButton}`} disabled={saving}>
                        {saving ? "Updating..." : "Update Tournament"}
                    </button>
                </div>
            </form>
        </div>
    )
} 