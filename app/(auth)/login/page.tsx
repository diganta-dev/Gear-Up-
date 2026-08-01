import LoginForm from "../_components/LoginForm";

const LoginPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-lg border p-8 shadow-lg">
        {/* Form Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Welcome Back!</h1>
          <p className="text-sm text-gray-600">
            Please log in to your account to continue.
          </p>
        </div>
        {/* form fields */}
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;