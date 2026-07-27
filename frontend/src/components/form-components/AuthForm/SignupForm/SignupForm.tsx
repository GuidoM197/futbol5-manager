"use client"

import { useAppForm } from "@/config/use-app-form"
import { SignupRequestSchema } from "@/models/Login"
import { useSignup } from "@/services/UserServices"
import type React from "react"
import { useState } from "react"
import { Upload, User, Mail, MapPin, Lock, UserCircle } from "lucide-react"
import styles from "./SignupForm.module.css"

export const SignupForm = () => {
    const { mutate, error } = useSignup()
    const [photoFile, setPhotoFile] = useState<File | null>(null)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    const ROLES = ["USER", "ADMIN", "OWNER"]
    const LOCATION = ["PILAR", "BARRACAS", "PEHUAJO"]
    const GENDER = ["MALE", "FEMALE", "OTHER", "DROID", "PREFER_NOT_TO_SAY"]

    const formData = useAppForm({
        defaultValues: {
            name: "",
            lastname: "",
            email: "",
            photo: "",
            age: "",
            gender: "",
            zone: "",
            password: "",
            role: "",
        },
        validators: {
            onChange: SignupRequestSchema,
        },
        onSubmit: async ({ value }) => {
            if (photoFile) {
                mutate({ data: value, photo: photoFile })
            } else {
                mutate({ data: value, photo: new File([], "") })
            }
        },
    })

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setPhotoFile(file)
            setPhotoPreview(URL.createObjectURL(file))
        }
    }

    return (
        <formData.AppForm>
            <formData.FormContainer extraError={error}>
                <div className={styles.container}>
                    {/* Photo upload section */}
                    <div className={styles.photoUploadContainer}>
                        <div className={styles.photoPreviewContainer}>
                            {photoPreview ? (
                                <img
                                    src={photoPreview || "/placeholder.svg"}
                                    alt="Profile preview"
                                    className={styles.photoPreviewImage}
                                />
                            ) : (
                                <div className={styles.photoPreviewPlaceholder}>
                                    <Upload className={styles.uploadIcon} />
                                </div>
                            )}
                        </div>
                        <label className={styles.uploadButton}>
                            <Upload size={18} />
                            <span>Upload Photo</span>
                            <input type="file" accept="image/*" onChange={handleFileChange} className={styles.uploadInput} />
                        </label>
                    </div>

                    {/* Form fields */}
                    <div className={styles.gridContainer}>
                        <div className={styles.inputContainer}>
                            <formData.AppField
                                name="name"
                                children={(field) => (
                                    <div className={styles.inputContainer}>
                                        <User className={styles.inputIcon} />
                                        <div className={styles.inputWrapper}>
                                            <field.TextField label="Name" />
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                        <div className={styles.inputContainer}>
                            <formData.AppField
                                name="lastname"
                                children={(field) => (
                                    <div className={styles.inputContainer}>
                                        <User className={styles.inputIcon} />
                                        <div className={styles.inputWrapper}>
                                            <field.TextField label="Last Name" />
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    <div className={styles.inputContainer}>
                        <formData.AppField
                            name="email"
                            children={(field) => (
                                <div className={styles.inputContainer}>
                                    <Mail className={styles.inputIcon} />
                                    <div className={styles.inputWrapper}>
                                        <field.TextField label="Email" />
                                    </div>
                                </div>
                            )}
                        />
                    </div>

                    <div className={styles.gridContainer}>
                        <div className={styles.inputContainer}>
                            <formData.AppField
                                name="age"
                                children={(field) => (
                                    <div className={styles.inputContainer}>
                                        <UserCircle className={styles.inputIcon} />
                                        <div className={styles.inputWrapper}>
                                            <div style={{ color: "#3C4043", paddingBottom: 5 }}>
                                                <p>Age</p>
                                            </div>
                                            <input
                                                type="number"
                                                placeholder="Age"
                                                value={field.state.value ?? ""}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, "")
                                                    field.handleChange(value)
                                                }}
                                                onBlur={field.handleBlur}
                                                className={styles.input}
                                                min="1"
                                                max="120"
                                            />
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                        <div className={styles.inputContainer}>
                            <formData.AppField
                                name="gender"
                                children={(field) => (
                                    <div className={styles.inputContainer}>
                                        <UserCircle className={styles.inputIcon} />
                                        <div style={{ color: "#3C4043", paddingBottom: 5 }}>
                                            <p>Gender</p>
                                        </div>
                                        <div className={styles.inputWrapper}>
                                            <select
                                                name={field.name}
                                                value={field.state.value ?? ""}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                onBlur={field.handleBlur}
                                                className={styles.select}
                                            >
                                                <option value="">Select gender</option>
                                                {GENDER.map((gender) => (
                                                    <option key={gender} value={gender}>
                                                        {gender.charAt(0) + gender.slice(1).toLowerCase().replace(/_/g, " ")}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    <div className={styles.inputContainer}>
                        <formData.AppField
                            name="password"
                            children={(field) => (
                                <div className={styles.inputContainer}>
                                    <Lock className={styles.inputIcon} />
                                    <div className={styles.inputWrapper}>
                                        <field.PasswordField label="Password" />
                                    </div>
                                </div>
                            )}
                        />
                    </div>

                    <div className={styles.inputContainer}>
                        <formData.AppField
                            name="zone"
                            children={(field) => (
                                <div className={styles.inputContainer}>
                                    <MapPin className={styles.inputIcon} />
                                    <div className={styles.inputWrapper}>
                                        <select
                                            name={field.name}
                                            value={field.state.value ?? ""}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            onBlur={field.handleBlur}
                                            className={styles.select}
                                        >
                                            <option value="">Select a zone</option>
                                            {LOCATION.map((location) => (
                                                <option key={location} value={location}>
                                                    {location}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        />
                    </div>

                    <div className={styles.inputContainer}>
                        <formData.AppField
                            name="role"
                            children={(field) => (
                                <div className={styles.inputContainer}>
                                    <UserCircle className={styles.inputIcon} />
                                    <select
                                        name={field.name}
                                        value={field.state.value ?? ""}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        className={styles.select}
                                    >
                                        <option value="">Select a role</option>
                                        {ROLES.map((role) => (
                                            <option key={role} value={role}>
                                                {role}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        />
                    </div>

                    <button type="submit" className={styles.submitButton}>
                        Create Account
                    </button>
                </div>
            </formData.FormContainer>
        </formData.AppForm>
    )
}
