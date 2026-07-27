import { useLogin } from "@/services/UserServices.ts";
import { useAppForm } from "@/config/use-app-form.ts";
import { LoginRequestSchema } from "@/models/Login.ts";
import { Lock, Mail } from "lucide-react";
import styles from "./LoginForm.module.css";

export const LoginForm = () => {
    const { mutate, error } = useLogin();

    const formData = useAppForm({
        defaultValues: {
            email: "",
            password: "",
        },
        validators: {
            onChange: LoginRequestSchema,
        },
        onSubmit: async ({ value }) => mutate(value),
    });

    return (
        <formData.AppForm>
            <formData.FormContainer extraError={error}>
                <div className={styles.spaceBetweenFields}>
                    <div className={styles.relativeContainer}>
                        <formData.AppField
                            name="email"
                            children={(field) => (
                                <div className={styles.relativeContainer}>
                                    <Mail className={styles.icon} />
                                    <div className={styles.inputWrapper}>
                                        <field.TextField label="Email" />
                                    </div>
                                </div>
                            )}
                        />
                    </div>
                    <div className={styles.relativeContainer}>
                        <formData.AppField
                            name="password"
                            children={(field) => (
                                <div className={styles.relativeContainer}>
                                    <Lock className={styles.icon} />
                                    <div className={styles.inputWrapper}>
                                        <field.PasswordField label="Password" />
                                    </div>
                                </div>
                            )}
                        />
                    </div>
                    <button type="submit" className={styles.submitButton}>
                        Log In
                    </button>
                </div>
            </formData.FormContainer>
        </formData.AppForm>
    );
};
