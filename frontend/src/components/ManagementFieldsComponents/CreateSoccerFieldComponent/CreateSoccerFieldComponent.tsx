import {SoccerFieldForm} from "@/components/form-components/SoccerFieldContainer/SoccerFieldForm/SoccerFieldForm.tsx";
import style from "./CreateSoccerFieldComponent.module.css"

export const CreateSoccerFieldComponent = () => {

    return (
        <div className={style.container}>
            <h1 className={style.title}>Create Soccer Field</h1>
            <SoccerFieldForm />
        </div>
    );
};
