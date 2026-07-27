import { CommonLayout } from "@/components/CommonLayout/CommonLayout"
import { CreateTournamentComponent } from "@/components/CreateTournamentComponent/CreateTournamentComponent"
import { useLocation } from "wouter"

export const CreateTournamentScreen = () => {
    const [, navigate] = useLocation()

    const handleSuccess = () => {
        navigate("/tournaments")
    }

    const handleCancel = () => {
        navigate("/tournaments")
    }

    return (
        <CommonLayout>
            <CreateTournamentComponent onSuccess={handleSuccess} onCancel={handleCancel} />
        </CommonLayout>
    )
} 