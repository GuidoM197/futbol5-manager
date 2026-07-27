"use client"

import { useToken } from "@/services/TokenContext"
import { useLocation } from "wouter"
import styles from "./TeamHandlerComponent.module.css"

export const TeamHandlerComponent = () => {
    const [tokenState] = useToken()
    const [, navigate] = useLocation()

    return (
        <>
            {tokenState.state === "LOGGED_IN" && (
                <button onClick={() => navigate("/teams/create")} className={styles.createTeamButton}>
                    Create Team
                </button>
            )}
        </>
    )
}
