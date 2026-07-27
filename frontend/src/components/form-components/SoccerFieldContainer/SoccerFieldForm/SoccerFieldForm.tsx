import React, { useState } from "react";
import { useToken } from "@/services/TokenContext";
import { Redirect } from "wouter";
import styles from "./SoccerFieldForm.module.css";

export const SoccerFieldForm = () => {
    const [tokenState] = useToken();
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [grassType, setGrassType] = useState("");
    const [administratorEmail, setAdministratorEmail] = useState("");
    const [message, setMessage] = useState("");
    const [startTime, setStartTime] = useState<number>(9);
    const [endTime, setEndTime] = useState<number>(17);
    const [loading, setLoading] = useState(false);
    const LOCATIONS = ["PILAR", "PEHUAJO", "BARRACAS"];
    const GRASS_TYPES = [
        "Natural - Bermuda Grass",
        "Natural - Ryegrass",
        "Natural - Festuca",
        "Natural - Kentucky Bluegrass",
        "Natural - Mezcla",
        "Sintético - 3ra Generación",
        "Sintético - Sin Relleno",
    ];
    const HOURS = Array.from({ length: 25 }, (_, i) => i);
    const START_HOURS = HOURS.filter(hour => hour >= 0 && hour <= 23);
    const END_HOURS = HOURS.filter(hour => hour >= 1 && hour <= 24);

    if (tokenState.state !== "LOGGED_IN" || tokenState.role !== "OWNER") {
        return <Redirect to="/" />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:30002/soccer-fields/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name,
                    location,
                    grassType,
                    administratorEmail,
                    startTime,
                    endTime
                }),
            });

            if (res.ok) {
                setMessage("The soccer field was created correctly!!!");
                setName("");
                setLocation("");
                setGrassType("");
                setAdministratorEmail("");
                setStartTime(9);
                setEndTime(17);
            } else {
                const errorText = await res.text();
                setMessage("Error creating court: " + (errorText || "Name already taken or invalid administrator email"));
            }
        } catch (error) {
            setMessage("Network Error: " + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className={styles.formContainer}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Name:</label>
                    <div className={styles.inputWrapper}>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>
                </div>
                <div className={`${styles.inputGroup} ${styles.selectWrapper}`}>
                    <label className={styles.label}>Location:</label>
                    <select
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        required
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
                    <label className={styles.label}>grass type :</label>
                    <select
                        value={grassType}
                        onChange={e => setGrassType(e.target.value)}
                        required
                        className={styles.select}
                    >
                        <option value="">select a Grass Type</option>
                        {GRASS_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Administrator email (ADMIN):</label>
                    <div className={styles.inputWrapper}>
                        <input
                            type="email"
                            value={administratorEmail}
                            onChange={e => setAdministratorEmail(e.target.value)}
                            required
                            className={styles.emailInput}
                        />
                    </div>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Hora de apertura:</label>
                  <select
                      value={startTime}
                      onChange={e => setStartTime(Number(e.target.value))}
                      required
                      className={styles.select}
                  >
                    {START_HOURS.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}:00
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Hora de cierre:</label>
                  <select
                      value={endTime}
                      onChange={e => setEndTime(Number(e.target.value))}
                      required
                      className={styles.select}
                  >
                    {END_HOURS.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}:00
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" disabled={loading} className={styles.button}>
                    {loading ? "Creating..." : "Create"}
                </button>
            </form>
            {message && <p className={styles.message}>{message}</p>}
        </>
    );
};
