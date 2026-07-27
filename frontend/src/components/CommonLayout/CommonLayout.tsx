"use client"

import type React from "react"
import {Link} from "wouter"

import { useToken } from "@/services/TokenContext"

import styles from "./CommonLayout.module.css"

export const CommonLayout = ({ children }: React.PropsWithChildren) => {
    const [tokenState] = useToken()

    return (
        <div className={styles.mainLayout}>
            <ul className={styles.topBar}>
                <HomeLink />
                {tokenState.state === "LOGGED_OUT" ? <LoggedOutLinks /> : <LoggedInLinks />}
            </ul>
            <div className={styles.body}>{children}</div>
        </div>
    )
}

const HomeLink = () => {
    return (
        <li className={styles.homeLink}>
            <Link href={"/"}>
                <span className={styles.homeIcon}>⚽</span>
            </Link>
        </li>
    )
}

const LoggedOutLinks = () => {
    return (
        <>
            <li>
                <Link href={"/login"}>Log in</Link>
            </li>
            <li>
                <Link href={"/signup"}>Sign Up</Link>
            </li>
        </>
    )
}

const LoggedInLinks = () => {
    const [tokenState, setTokenState] = useToken()

    const logOut = () => {
        setTokenState({ state: "LOGGED_OUT" })
    }

    return (
        <>
            <li>
                <Link href={"/"}>Home</Link>
            </li>

            {tokenState.state === "LOGGED_IN" && tokenState.role === "USER" && (
                <li>
                    <Link href={"/tournaments"}>Tournaments</Link>
                </li>
            )}
            {tokenState.state === "LOGGED_IN" && tokenState.role === "USER" && (
                <>
                    <li>
                        <Link href={"/public-matches"}>Public Matches</Link>
                    </li>
                    <li>
                        <Link href={"/my-reservations"}>My Reservations</Link>
                    </li>
                    <li>
                        <Link href={"/my-teams"}>My Teams</Link>
                    </li>
                    <li>
                        <Link href={"/tournaments/search"}>Search Tournaments</Link>
                    </li>
                </>
            )}

            {tokenState.state === "LOGGED_IN" && tokenState.role === "ADMIN" && (
                <>
                    <li>
                        <Link href={"/soccer-fields"}>Manage Soccer Fields</Link>
                    </li>
                </>
            )}
            {tokenState.state === "LOGGED_IN" && tokenState.role === "OWNER" && (
                <>
                    <li>
                        <Link href={"/soccer-fields"}>Manage Soccer Fields</Link>
                    </li>
                </>
            )}

            <li>
                <Link href={"/profile"}>Profile</Link>
            </li>
            <li>
                <button onClick={logOut}>Log out</button>
            </li>
        </>
    )
}
