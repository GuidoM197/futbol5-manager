import styles from './HomeComponent.module.css'
import { CalendarDays, Users, MapPin, Zap, Clock, User } from "lucide-react"

export const HomeComponent = () => {
    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                {/* Hero Section */}
                <div className={styles.hero}>
                    <div className={styles.heroIcon}>⚽</div>
                    <h1 className={styles.heroTitle}>
                        Management & Reservation
                        <span className={styles.heroTitleHighlight}>Soccer Fields</span>
                    </h1>
                    <p className={styles.heroDescription}>
                        ¿Tired of organizing matches via WhatsApp and Excel spreadsheets? Our platform lets you{" "}
                        <span className={styles.heroDescriptionHighlight}>organize, coordinate and reserve</span>
                        {" "}matches in a simple and fast way.
                    </p>
                </div>

                {/* Features Grid */}
                <div className={styles.grid}>
                    {[
                        {
                            icon: <MapPin style={{ width: 24, height: 24, color: "#059669" }} />,
                            title: "Reserve soccer fields",
                            text: "Find and book courts in your area with just a few clicks",
                        },
                        {
                            icon: <Users style={{ width: 24, height: 24, color: "#059669" }} />,
                            title: "Organize Matches",
                            text: "Create matches and invite friends easily",
                        },
                        {
                            icon: <CalendarDays style={{ width: 24, height: 24, color: "#059669" }} />,
                            title: "Manage Schedules",
                            text: "Manage schedules and teams intuitively",
                        },
                        {
                            icon: <Clock style={{ width: 24, height: 24, color: "#059669" }} />,
                            title: "Save Time",
                            text: "All from one platform, without complications",
                        },
                        {
                            icon: <Zap style={{ width: 24, height: 24, color: "#059669" }} />,
                            title: "Quick and Easy",
                            text: "Intuitive interface for a smooth experience",
                        },
                        {
                            icon: <User style={{ width: 24, height: 24, color: "#059669" }} />,
                            title: "Manage Your Profile",
                            text: "Create the ultimate customizable profile to showcase your attributes",
                        }
                    ].map((feature, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.cardIcon}>{feature.icon}</div>
                            <h3 className={styles.cardTitle}>{feature.title}</h3>
                            <p className={styles.cardText}>{feature.text}</p>
                        </div>
                    ))}
                </div>

                {/* Coming Soon Section */}
                <div className={styles.comingSoon}>
                    <h2 className={styles.comingTitle}>Coming Soon!</h2>
                    <p className={styles.comingText}>
                        We're working to give you the best experience managing 5-a-side football matches.
                        Get ready to revolutionize the way you organize your matches.
                    </p>
                    <div className={styles.comingBadge}>
                        <div className={styles.pulseDot}></div>
                        <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>In development</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomeComponent
