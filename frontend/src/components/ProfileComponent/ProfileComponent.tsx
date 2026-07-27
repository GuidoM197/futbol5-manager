"use client"

import { useEffect, useState } from "react"
import { useToken } from "@/services/TokenContext"
import { getMyProfile, fetchMyPicture, updateMyProfile } from "@/services/UserServices"
import styles from "./ProfileComponent.module.css"

type User = {
    name: string
    lastname: string
    email: string
    age: string
    gender: string
    zone: string
    role: string
}

const LOCATIONS = ["PILAR", "PEHUAJO", "BARRACAS"]
const GENDER_OPTIONS = ["MALE", "FEMALE", "OTHER", "DROID", "PREFER_NOT_TO_SAY"]

const ProfileComponent = () => {
    const [tokenState] = useToken()
    const [user, setUser] = useState<User | null>(null)
    const [photoUrl, setPhotoUrl] = useState<string | null>(null)
    const [location, setLocation] = useState("")
    const [editing, setEditing] = useState(false)
    const [formData, setFormData] = useState<User | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (tokenState.state === "LOGGED_IN") {
            getMyProfile()
                .then((userData) => {
                    setUser(userData)
                    setFormData(userData)
                    setLocation(userData.zone)
                })
                .catch((err) => console.error("Error fetching user profile:", err))

            fetchMyPicture()
                .then((url) => {
                    setPhotoUrl(url)
                })
                .catch(() => {
                    setPhotoUrl(null)
                })
        }
    }, [tokenState])

    const onChange = (field: keyof User, value: string) => {
        if (!formData) return
        setFormData({ ...formData, [field]: value })
    }

    const onSave = async () => {
        if (!formData) return
        setSaving(true)
        setError(null)

        try {
            await updateMyProfile({
                name: formData.name,
                lastname: formData.lastname,
                age: formData.age,
                gender: formData.gender,
                zone: formData.zone,
            })

            setUser(formData)
            setEditing(false)
        } catch (err: any) {
            console.error("Error updating profile:", err)
            setError("Error saving profile. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    const getRoleColor = (role: string) => {
        switch (role.toUpperCase()) {
            case "OWNER":
                return styles.roleOwner
            case "USER":
                return styles.roleUser
            case "ADMIN":
                return styles.roleAdmin
            default:
                return styles.roleDefault
        }
    }

    if (!user)
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p className={styles.loadingText}>Loading profile...</p>
            </div>
        )

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerBackground}></div>
                <div className={styles.profileSection}>
                    <div className={styles.photoContainer}>
                        {photoUrl ? (
                            <img src={photoUrl || "/placeholder.svg"} className={styles.photo} alt="Profile" />
                        ) : (
                            <div className={styles.initialContainer}>{user.name ? user.name[0].toUpperCase() : "?"}</div>
                        )}
                    </div>
                    <div className={styles.userInfo}>
                        <h2 className={styles.userName}>
                            {user.name} {user.lastname}
                        </h2>
                        <p className={styles.userEmail}>{user.email}</p>
                        <span className={`${styles.roleBadge} ${getRoleColor(user.role)}`}>{user.role}</span>
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                {!editing ? (
                    <div className={styles.infoGrid}>
                        <div className={styles.infoCard}>
                            <div className={styles.infoIcon}>🎂</div>
                            <div className={styles.infoContent}>
                                <span className={styles.infoLabel}>Age</span>
                                <span className={styles.infoValue}>{user.age} years</span>
                            </div>
                        </div>

                        <div className={styles.infoCard}>
                            <div className={styles.infoIcon}>⚧️</div>
                            <div className={styles.infoContent}>
                                <span className={styles.infoLabel}>Gender</span>
                                <span className={styles.infoValue}>{user.gender}</span>
                            </div>
                        </div>

                        <div className={styles.infoCard}>
                            <div className={styles.infoIcon}>📍</div>
                            <div className={styles.infoContent}>
                                <span className={styles.infoLabel}>Location</span>
                                <span className={styles.infoValue}>{user.zone}</span>
                            </div>
                        </div>

                        <div className={styles.actionButtons}>
                            <button className={styles.editButton} onClick={() => setEditing(true)}>
                                <span className={styles.buttonIcon}>✏️</span>
                                Edit Profile
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.editForm}>
                        <div className={styles.formSection}>
                            <h3 className={styles.sectionTitle}>Personal Information</h3>
                            <div className={styles.formGrid}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>First Name</label>
                                    <input
                                        type="text"
                                        value={formData?.name ?? ""}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[0-9]/g, '')
                                            onChange("name", value)
                                        }}
                                        onKeyPress={(e) => {
                                            if (/[0-9]/.test(e.key)) {
                                                e.preventDefault()
                                            }
                                        }}
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Last Name</label>
                                    <input
                                        type="text"
                                        value={formData?.lastname ?? ""}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[0-9]/g, '')
                                            onChange("lastname", value)
                                        }}
                                        onKeyPress={(e) => {
                                            if (/[0-9]/.test(e.key)) {
                                                e.preventDefault()
                                            }
                                        }}
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Email</label>
                                    <input
                                        type="email"
                                        value={formData?.email ?? ""}
                                        className={`${styles.input} ${styles.disabledInput}`}
                                        disabled
                                    />
                                    <small className={styles.note}>Email cannot be changed</small>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Age</label>
                                    <input
                                        type="number"
                                        value={formData?.age ?? ""}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9]/g, '')
                                            onChange("age", value)
                                        }}
                                        className={styles.input}
                                        min="1"
                                        max="120"
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Gender</label>
                                    <select
                                        value={formData?.gender ?? ""}
                                        onChange={(e) => onChange("gender", e.target.value)}
                                        className={styles.select}
                                    >
                                        <option value="">Select gender</option>
                                        {GENDER_OPTIONS.map((gender) => (
                                            <option key={gender} value={gender}>
                                                {gender.replace(/_/g, " ")}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Location</label>
                                    <select
                                        value={location}
                                        onChange={(e) => {
                                            setLocation(e.target.value)
                                            if (formData) onChange("zone", e.target.value)
                                        }}
                                        className={styles.select}
                                    >
                                        <option value="">Select a location</option>
                                        {LOCATIONS.map((loc) => (
                                            <option key={loc} value={loc}>
                                                {loc}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Role</label>
                                    <input
                                        type="text"
                                        value={formData?.role ?? ""}
                                        className={`${styles.input} ${styles.disabledInput}`}
                                        disabled
                                    />
                                    <small className={styles.note}>Role cannot be changed</small>
                                </div>
                            </div>
                        </div>

                        {error && <div className={styles.errorMessage}>{error}</div>}

                        <div className={styles.formActions}>
                            <button onClick={onSave} disabled={saving} className={styles.saveButton}>
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                                onClick={() => {
                                    setEditing(false)
                                    setFormData(user)
                                    setError(null)
                                }}
                                disabled={saving}
                                className={styles.cancelButton}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProfileComponent