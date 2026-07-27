"use client"

import { useToken } from "@/services/TokenContext.tsx"
import { useLocation } from "wouter"
import { Calendar, Plus, Users } from "lucide-react"
import styles from "./ManagementFieldsButton.module.css"

export const ManagementFieldsButton = () => {
    const [tokenState] = useToken()
    const [, navigate] = useLocation()

    if (tokenState.state !== "LOGGED_IN") return null

    const getRoleConfig = () => {
        const roleConfig = {
            OWNER: { label: "Owner", className: styles.ownerBadge },
            USER: { label: "User", className: styles.userBadge },
            ADMIN: { label: "Admin", className: styles.adminBadge },
        }
        return roleConfig[tokenState.role] || roleConfig.USER
    }

    const roleInfo = getRoleConfig()

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.roleInfo}>
                    <div className={`${styles.roleDot} ${roleInfo.className}`}></div>
                    <span className={`${styles.roleBadge} ${roleInfo.className}`}>{roleInfo.label}</span>
                </div>
                <Users className={styles.headerIcon} />
            </div>

            <div className={styles.actionsContainer}>
                {tokenState.role === "OWNER" && (
                    <button
                        onClick={() => navigate("/soccer-fields/create")}
                        className={`${styles.actionButton} ${styles.ownerButton}`}
                    >
                        <Plus className={styles.buttonIcon} />
                        Create Soccer Field
                    </button>
                )}

                {tokenState.role === "USER" && (
                    <button
                        onClick={() => navigate("/soccer-fields/reservations/create")}
                        className={`${styles.actionButton} ${styles.userButton}`}
                    >
                        <Calendar className={styles.buttonIcon} />
                        Create Reservation
                    </button>
                )}

            </div>
        </div>
    )
}
