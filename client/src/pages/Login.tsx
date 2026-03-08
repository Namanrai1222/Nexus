import LoginForm from '../components/auth/LoginForm';

export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md bg-card rounded-xl border border-border p-6 sm:p-8 shadow-sm">
        <LoginForm />
      </div>
    </div>
  );
}
