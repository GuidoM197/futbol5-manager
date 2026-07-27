import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { SignupComponent } from "@/components/AuthComponents/SignupComponent/SignupComponent.tsx";

export const SignupScreen = () => {
    return (
        <CommonLayout>
            <SignupComponent />
        </CommonLayout>
    );
};