import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { CreateReservationComponent } from "@/components/ManagementFieldsComponents/CreateReservationComponent/CreateReservationComponent.tsx";

export const CreateReservationScreen = () => {
    return (
        <CommonLayout>
            <CreateReservationComponent />
        </CommonLayout>
    );
};