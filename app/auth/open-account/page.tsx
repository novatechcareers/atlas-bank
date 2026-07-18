import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";

export default function OpenAccountPage() {
  return (
    <AuthLayout
      title="Create Your Atlas Bank Account"
      description="Open your Atlas Bank account and enjoy secure digital banking from anywhere in the world."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
