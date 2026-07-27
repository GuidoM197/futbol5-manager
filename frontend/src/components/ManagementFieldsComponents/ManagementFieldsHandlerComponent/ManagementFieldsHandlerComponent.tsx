import { ManagementFieldsButton } from "../ManagementFieldsButton/ManagementFieldsButton"
import { MyReservationComponent } from "../MyReservationComponent/MyReservationComponent"
import { useToken } from "@/services/TokenContext"
import { SoccerFieldsManagement } from "@/components/ManagementFieldsComponents/SoccerFieldsManagement/SoccerFieldsManagement";

export const ManagementFieldsHandlerComponent = () => {
    const [tokenState] = useToken()
    const isLoggedIn = tokenState.state === "LOGGED_IN"
    const isOwner = isLoggedIn && tokenState.role === "OWNER"
    const isAdmin = isLoggedIn && tokenState.role === "ADMIN"
    const isUser = isLoggedIn && tokenState.role === "USER"

    return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 px-4">
                <div className="max-w-6xl mx-auto space-y-6">
                    {isUser && (
                        <>
                            <ManagementFieldsButton />
                            <MyReservationComponent />
                        </>
                    )}
                    {isOwner && (
                        <>
                            <ManagementFieldsButton />
                            <SoccerFieldsManagement />
                        </>
                    )}
                    {isAdmin && (
                        <>
                            <SoccerFieldsManagement />
                        </>
                    )}
                </div>
            </div>
    )
}
