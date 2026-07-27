import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { LoginComponent } from "@/components/AuthComponents/LoginComponent/LoginComponent.tsx";

export const LoginScreen = () => {
  return (
      <CommonLayout>
        <LoginComponent />
      </CommonLayout>
  );
};