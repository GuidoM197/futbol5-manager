import { CommonLayout } from "@/components/CommonLayout/CommonLayout"
import { EditTournamentComponent } from "@/components/EditTournamentComponent/EditTournamentComponent"
import { useLocation } from "wouter"

interface EditTournamentScreenProps {
    params: {
        id: string
    }
}

export const EditTournamentScreen = ({ params }: EditTournamentScreenProps) => {
    const [, navigate] = useLocation()
    const tournamentId = parseInt(params.id)

    const handleSuccess = () => {
        navigate("/tournaments")
    }

    const handleCancel = () => {
        navigate("/tournaments")
    }

    return (
        <CommonLayout>
            <EditTournamentComponent 
                tournamentId={tournamentId}
                onSuccess={handleSuccess} 
                onCancel={handleCancel} 
            />
        </CommonLayout>
    )
} 