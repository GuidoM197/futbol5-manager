import {ReservationForm} from "@/components/form-components/SoccerFieldContainer/ReservationForm/ReservationForm.tsx";
import style from "./CreateReservationComponent.module.css"

export const CreateReservationComponent = () => {
    return (
        <div className={style.container}>
            <h1 className={style.title}>Create Reservation</h1>
            <ReservationForm />
        </div>
    );
};