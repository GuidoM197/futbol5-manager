import { SignupForm } from "@/components/form-components/AuthForm/SignupForm/SignupForm";
import styles from "../AuthComponent.module.css";

export const SignupComponent = () => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Create Account</h1>
                    <p className={styles.subtitle}>Join our community</p>
                </div>
                <SignupForm />
            </div>
        </div>
    );
};
