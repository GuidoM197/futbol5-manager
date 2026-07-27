import type React from "react"
import { useEffect, useState } from "react"
import {
    getMyFields,
    deleteField,
    updateFieldAsAdmin,
    updateFieldAsOwner,
    type SoccerField,
    type SoccerFieldCreateDTO,
} from "@/services/SoccerFieldService.ts"
import styles from "./SoccerFieldsManagement.module.css"
import { useToken } from "@/services/TokenContext"

const LOCATIONS = ["PILAR", "PEHUAJO", "BARRACAS"]
const GRASS_TYPES = [
    "Natural - Bermuda Grass",
    "Natural - Ryegrass",
    "Natural - Festuca",
    "Natural - Kentucky Bluegrass",
    "Natural - Mezcla",
    "Sintético - 3ra Generación",
    "Sintético - Sin Relleno",
]


export const SoccerFieldsManagement = () => {
    const [fields, setFields] = useState<SoccerField[]>([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")
    const [messageType, setMessageType] = useState<"success" | "error">("success")
    const [showMessage, setShowMessage] = useState(false)
    const [editingField, setEditingField] = useState<SoccerField | null>(null)

    const [tokenState] = useToken()
    const isLoggedIn = tokenState.state === "LOGGED_IN"
    const isAdmin = isLoggedIn && tokenState.role === "ADMIN"
    const isOwner = isLoggedIn && tokenState.role === "OWNER"

    useEffect(() => {
        fetchFields()
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

    const fetchFields = async () => {
        try {
            setLoading(true)
            const fieldsData = await getMyFields()
            setFields(fieldsData)
        } catch (error) {
            showErrorMessage("Error loading fields: " + (error as Error).message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) {
            return
        }

        try {
            const success = await deleteField(id)
            if (success) {
                setFields(fields.filter((f) => f.id !== id))
                showSuccessMessage("Field deleted successfully!")
            } else {
                showErrorMessage("Error deleting field. You may not have permission.")
            }
        } catch (error) {
            showErrorMessage("Error deleting field: " + (error as Error).message)
        }
    }

    const handleEdit = (field: SoccerField) => {
        setEditingField(field)
    }

    const handleSaveEdit = async (updatedData: SoccerFieldCreateDTO) => {
        if (!editingField) return

        try {

            let updatedField: SoccerField | null = null

            if (isAdmin) {
                updatedField = await updateFieldAsAdmin(editingField.id, updatedData)
            } else if (isOwner) {
                updatedField = await updateFieldAsOwner(editingField.id, updatedData)
            }

            if (updatedField) {
                setFields(fields.map((f) => (f.id === editingField.id ? updatedField : f)))
                setEditingField(null)
                showSuccessMessage("Field updated successfully!")
            } else {
                showErrorMessage("Error updating field. You may not have permission.")
            }
        } catch (error) {
            showErrorMessage("Error updating field: " + (error as Error).message)
        }
    }

    const handleCancelEdit = () => {
        setEditingField(null)
    }

    if (loading) {
        return <div className={styles.loading}>Loading fields...</div>
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Manage Soccer Fields</h1>

            {message && (
                <div className={`${styles.message} ${styles[messageType]} ${showMessage ? styles.show : styles.hide}`}>
                    <div className={styles.messageContent}>
                        <span className={styles.messageIcon}>{messageType === "success" ? "✓" : "⚠"}</span>
                        {message}
                    </div>
                </div>
            )}

            {fields.length === 0 ? (
                <div className={styles.noFields}>No soccer fields found.</div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Location</th>
                            <th>Grass Type</th>
                            <th>Administrator</th>
                            <th>Hours</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {fields.map((field) => (
                            <tr key={field.id}>
                                <td>{field.name}</td>
                                <td>{field.location}</td>
                                <td>{field.grassType}</td>
                                <td>{field.administratorEmail}</td>
                                <td>
                                    {field.startTime}:00 - {field.endTime}:00
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <button onClick={() => handleEdit(field)} className={`${styles.button} ${styles.editButton}`}>
                                            Edit
                                        </button>
                                        {isOwner && (
                                            <button
                                                onClick={() => handleDelete(field.id, field.name)}
                                                className={`${styles.button} ${styles.deleteButton}`}
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {editingField &&
                <EditFieldModal
                    field={editingField}
                    onSave={handleSaveEdit}
                    onCancel={handleCancelEdit}
                    userRole={tokenState.state === "LOGGED_IN" ? tokenState.role : null}
                />
            }
        </div>
    )
}

interface EditFieldModalProps {
    field: SoccerField
    onSave: (data: SoccerFieldCreateDTO) => void
    onCancel: () => void
    userRole: string | null
}

const EditFieldModal = ({ field, onSave, onCancel, userRole }: EditFieldModalProps) => {
    const [formData, setFormData] = useState<SoccerFieldCreateDTO>({
        name: field.name,
        location: field.location,
        grassType: field.grassType,
        administratorEmail: field.administratorEmail,
        startTime: field.startTime,
        endTime: field.endTime,
    })
    const [formError, setFormError] = useState("")

    const isOwner = userRole === "OWNER"

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setFormError("")

        if (formData.startTime >= formData.endTime) {
            setFormError("Start time must be less than end time")
            return
        }

        onSave(formData)
    }

    const hoursOptions = Array.from({ length: 24 }, (_, i) => i)

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h2 className={styles.modalTitle}>Edit Soccer Field</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {formError && <div className={styles.formError}>{formError}</div>}

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Name:</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Location:</label>
                        <select
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            required
                            className={styles.select}
                        >
                            {LOCATIONS.map((location) => (
                                <option key={location} value={location}>
                                    {location}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Grass Type:</label>
                        <select
                            value={formData.grassType}
                            onChange={(e) => setFormData({ ...formData, grassType: e.target.value })}
                            required
                            className={styles.select}
                        >
                            {GRASS_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Administrator Email:</label>
                        {isOwner ? (
                            <input
                                type="email"
                                value={formData.administratorEmail}
                                onChange={(e) => setFormData({ ...formData, administratorEmail: e.target.value })}
                                required
                                className={styles.input}
                            />
                        ) : (
                            <div className={styles.readOnlyField}>{formData.administratorEmail}</div>
                        )}
                    </div>

                    <div className={styles.timeInputsContainer}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Start Time:</label>
                            <select
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: Number(e.target.value) })}
                                required
                                className={styles.select}
                            >
                                {hoursOptions.map((hour) => (
                                    <option key={`start-${hour}`} value={hour}>
                                        {hour}:00
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>End Time:</label>
                            <select
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: Number(e.target.value) })}
                                required
                                className={styles.select}
                            >
                                {hoursOptions.map((hour) => (
                                    <option key={`end-${hour}`} value={hour}>
                                        {hour}:00
                                    </option>
                                ))}
                            </select>
                        </div>
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
