import { LoginForm } from "@/components/form-components/AuthForm/LoginForm/LoginForm";
import styles from "../AuthComponent.module.css";

export const LoginComponent = () => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Log In</h1>
                    <p className={styles.subtitle}>
                        Welcome back! Please enter your credentials.
                    </p>
                </div>
                <LoginForm />
            </div>
        </div>
    );
};
