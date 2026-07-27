"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createTeam } from "@/services/TeamServices"
import styles from "./CreateTeamComponent.module.css"

function getEmailFromToken(): string {
    const token = localStorage.getItem("token")
    if (!token) return ""
    try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        return payload.sub || payload.email || ""
    } catch {
        return ""
    }
}

interface CreateTeamComponentProps {
    onSuccess?: () => void
    onCancel?: () => void
    setTeam1?: (emails: Set<string>) => void
    setTeam2?: (emails: Set<string>) => void
}

export function CreateTeamComponent({ onCancel }: CreateTeamComponentProps) {
    const userEmail = getEmailFromToken()
    const [name, setName] = useState("")
    const [memberEmails, setMemberEmails] = useState<string[]>(userEmail ? [userEmail] : [""])
    const [leader, setLeader] = useState(userEmail)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const addEmailField = () => setMemberEmails([...memberEmails, ""])
    const removeEmailField = (index: number) => {
        if (memberEmails.length > 1) {
            const newEmails = memberEmails.filter((_, i) => i !== index)
            setMemberEmails(newEmails)
            if (memberEmails[index] === leader) setLeader(newEmails[0] || "")
        }
    }
    const updateEmail = (index: number, value: string) => {
        const newEmails = [...memberEmails]
        newEmails[index] = value
        setMemberEmails(newEmails)
        if (index === memberEmails.findIndex(e => e === leader)) setLeader(value)
    }
    const resetForm = () => {
        setName("")
        setMemberEmails(userEmail ? [userEmail] : [""])
        setLeader(userEmail)
        setError(null)
    }

    useEffect(() => {
        const validEmails = memberEmails.filter(e => e.trim() !== "")
        if (!validEmails.includes(leader)) {
            setLeader(validEmails[0] || "")
        }
    }, [memberEmails])

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccessMessage(null)

        try {
            const token = localStorage.getItem("token")!
            const validEmails = memberEmails.filter((email) => email.trim() !== "")

            if (validEmails.length === 0) {
                setError("Please add at least one member email")
                setLoading(false)
                return
            }
            if (!leader || !validEmails.includes(leader)) {
                setError("Please select a valid leader")
                setLoading(false)
                return
            }

            await createTeam(
                {
                    name,
                    leader,
                    memberEmails: validEmails,
                },
                token,
            )

            setSuccessMessage(`Team "${name}" created successfully!`)
            resetForm()
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || "Failed to create team")
            } else {
                setError("Failed to create team")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Create Team</h1>

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
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Team Name:</label>
                    <input
                        className={styles.input}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter team name"
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Member Emails:</label>
                    {memberEmails.map((email, index) => (
                        <div key={index} className={styles.emailRow}>
                            <input
                                className={styles.input}
                                type="email"
                                value={email}
                                onChange={(e) => updateEmail(index, e.target.value)}
                                placeholder="Enter email address"
                                required={index === 0}
                                readOnly={index === 0 && email === userEmail}
                            />
                            {memberEmails.length > 1 && (
                                <button type="button" className={styles.removeButton} onClick={() => removeEmailField(index)}>
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" className={styles.addButton} onClick={addEmailField}
                            disabled={memberEmails.length >= 5}>
                        + Add another email
                    </button>
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Leader:</label>
                    <select
                        className={styles.input}
                        value={leader}
                        onChange={e => setLeader(e.target.value)}
                        required
                    >
                        {memberEmails
                            .filter((email, idx, arr) => email.trim() !== "" && arr.indexOf(email) === idx)
                            .map((email, idx) => (
                                <option key={idx} value={email}>{email}</option>
                            ))}
                    </select>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.buttons}>
                    {onCancel && (
                        <button
                            type="button"
                            className={`${styles.button} ${styles.cancelButton}`}
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    )}
                    <button type="submit" className={`${styles.button} ${styles.submitButton}`} disabled={loading}>
                        {loading ? "Creating..." : "Create Team"}
                    </button>
                </div>
            </form>
        </div>
    )
}