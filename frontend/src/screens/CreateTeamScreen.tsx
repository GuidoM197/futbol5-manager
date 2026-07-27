import { CommonLayout } from "@/components/CommonLayout/CommonLayout"
import { CreateTeamComponent } from "@/components/CreateTeamComponent/CreateTeamComponent"
import { useLocation } from "wouter"

export const CreateTeamScreen = () => {
    const [, navigate] = useLocation()

    const handleCancel = () => {
        navigate("/soccer-fields")
    }

    return (
        <CommonLayout>
            <CreateTeamComponent onCancel={handleCancel} />
        </CommonLayout>
    )
}
