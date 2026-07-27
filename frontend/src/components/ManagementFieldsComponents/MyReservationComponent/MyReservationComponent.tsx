"use client"

import { useEffect, useState } from "react"
import { useToken } from "@/services/TokenContext.tsx"
import { Calendar, Clock, MapPin, AlertCircle, CalendarDays } from 'lucide-react'
import styles from "./MyReservationComponent.module.css"

type Reservation = {
    id: number
    field: { name: string }
    day: string
    startHour: number
    endHour: number
}

export const MyReservationComponent = () => {
    const [tokenState] = useToken()
    const [reservations, setReservations] = useState<Reservation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchReservations = async () => {
            setLoading(true)
            setError(null)
            try {
                const token = localStorage.getItem("token")
                let userEmail = ""
                if (tokenState.state === "LOGGED_IN" && "accessToken" in tokenState && tokenState.accessToken) {
                    userEmail = JSON.parse(atob(tokenState.accessToken.split(".")[1])).sub
                }
                const res = await fetch(`http://localhost:30002/reservations/user-reservations?userEmail=${userEmail}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (res.ok) {
                    const data = await res.json()
                    setReservations(data)
                } else {
                    setError("Reservations cannot been charged")
                }
            } catch (e) {
                setError("Network error")
            } finally {
                setLoading(false)
            }
        }
        if (tokenState.state === "LOGGED_IN") fetchReservations()
    }, [tokenState])

    const formatDate = (dateString: string) => {
        const [year, month, day] = dateString.split('-').map(Number)
        const date = new Date(year, month - 1, day)
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const getTimeStatus = (day: string, startHour: number) => {
        const [year, month, dayNum] = day.split('-').map(Number)
        const reservationDate = new Date(year, month - 1, dayNum)
        const now = new Date()
        const reservationDateTime = new Date(reservationDate.setHours(startHour, 0, 0, 0))

        if (reservationDateTime < now) {
            return { status: "past", className: styles.pastBadge, text: "Completed" }
        } else if (reservationDateTime.toDateString() === now.toDateString()) {
            return { status: "today", className: styles.todayBadge, text: "Today" }
        } else {
            return { status: "upcoming", className: styles.upcomingBadge, text: "Upcoming" }
        }
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.titleSection}>
                        <div className={styles.iconContainer}>
                            <CalendarDays className={styles.titleIcon} />
                        </div>
                        <h1 className={styles.title}>My Reservations</h1>
                    </div>
                </div>
                <div className={styles.loadingContainer}>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className={styles.skeletonCard}>
                            <div className={styles.skeletonHeader}></div>
                            <div className={styles.skeletonLine}></div>
                            <div className={styles.skeletonLine}></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.errorContainer}>
                    <AlertCircle className={styles.errorIcon} />
                    <p className={styles.errorMessage}>{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <div className={styles.iconContainer}>
                        <CalendarDays className={styles.titleIcon} />
                    </div>
                    <h1 className={styles.title}>My Reservations</h1>
                    <div className={styles.countBadge}>
                        {reservations.length} {reservations.length === 1 ? "reservation" : "reservations"}
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                {reservations.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <Calendar className={styles.emptyCalendarIcon} />
                        </div>
                        <h3 className={styles.emptyTitle}>No reservations yet</h3>
                        <p className={styles.emptyDescription}>You don't have any reservations at the moment.</p>
                    </div>
                ) : (
                    <div className={styles.reservationGrid}>
                        {reservations.map((reservation) => {
                            const timeStatus = getTimeStatus(reservation.day, reservation.startHour)
                            return (
                                <div key={reservation.id} className={styles.reservationCard}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.fieldInfo}>
                                            <div className={styles.fieldIconContainer}>
                                                <MapPin className={styles.fieldIcon} />
                                            </div>
                                            <div className={styles.fieldDetails}>
                                                <h3 className={styles.fieldName}>{reservation.field.name}</h3>
                                                <p className={styles.fieldType}>Soccer Field</p>
                                            </div>
                                        </div>
                                        <div className={`${styles.statusBadge} ${timeStatus.className}`}>{timeStatus.text}</div>
                                    </div>

                                    <div className={styles.cardContent}>
                                        <div className={styles.infoRow}>
                                            <Calendar className={styles.infoIcon} />
                                            <span className={styles.infoText}>{formatDate(reservation.day)}</span>
                                        </div>

                                        <div className={styles.infoRow}>
                                            <Clock className={styles.infoIcon} />
                                            <span className={styles.infoText}>
                        {reservation.startHour}:00 - {reservation.endHour}:00
                      </span>
                                            <div className={styles.durationBadge}>
                                                {reservation.endHour - reservation.startHour}h duration
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}