import RegisterForm from '../components/auth/RegisterForm';

export default function Register() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md bg-card rounded-xl border border-border p-6 sm:p-8 shadow-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
