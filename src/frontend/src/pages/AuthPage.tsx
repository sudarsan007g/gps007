import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { User as UserType } from "../types/auth";
import {
  authenticateUser,
  createSession,
  emailOrMobileExists,
  registerUserWithCredentials,
} from "../utils/authStore";

interface Props {
  onLoginSuccess: () => void;
  defaultTab?: "login" | "register";
}

// ── Register Form ─────────────────────────────────────────────────────────────
interface RegisterFormProps {
  onSwitchToLogin: (email: string) => void;
}

function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = async (): Promise<string | null> => {
    if (!fullName.trim() || fullName.trim().length < 2)
      return "Full name must be at least 2 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return "Please enter a valid email address.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    if (await emailOrMobileExists(email.trim()))
      return "An account with this email already exists.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const validationError = await validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const user: UserType = await registerUserWithCredentials({
        fullName,
        email,
        password,
      });
      toast.success("Account created. Sign in to continue.");
      onSwitchToLogin(user.email);
    } catch {
      setError("Unable to create account. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <motion.div
          data-ocid="register.error_state"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 rounded-lg bg-destructive/10 border border-destructive/25 px-3.5 py-2.5"
        >
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive leading-snug">{error}</p>
        </motion.div>
      )}

      {/* Full Name */}
      <div className="space-y-1.5">
        <Label
          htmlFor="reg-name"
          className="text-sm font-medium text-foreground/80"
        >
          Full Name
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="reg-name"
            data-ocid="register.name_input"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="pl-9 bg-secondary/50 border-border/60 focus-visible:ring-primary/30 h-10"
            autoComplete="name"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label
          htmlFor="reg-email"
          className="text-sm font-medium text-foreground/80"
        >
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="reg-email"
            data-ocid="register.email_input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-9 bg-secondary/50 border-border/60 focus-visible:ring-primary/30 h-10"
            autoComplete="email"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label
          htmlFor="reg-password"
          className="text-sm font-medium text-foreground/80"
        >
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="reg-password"
            data-ocid="register.password_input"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-9 pr-9 bg-secondary/50 border-border/60 focus-visible:ring-primary/30 h-10"
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {password.length > 0 && (
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4].map((tier) => (
              <div
                key={tier}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  password.length >= tier * 3
                    ? tier <= 2
                      ? "bg-destructive"
                      : tier === 3
                        ? "bg-warning"
                        : "bg-success"
                    : "bg-border"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <Label
          htmlFor="reg-confirm"
          className="text-sm font-medium text-foreground/80"
        >
          Confirm Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="reg-confirm"
            data-ocid="register.confirm_password_input"
            type={showConfirm ? "text" : "password"}
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-9 pr-9 bg-secondary/50 border-border/60 focus-visible:ring-primary/30 h-10"
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {confirmPassword.length > 0 && (
          <p
            className={`text-xs ${password === confirmPassword ? "text-success" : "text-destructive"}`}
          >
            {password === confirmPassword
              ? "✓ Passwords match"
              : "✗ Passwords don't match"}
          </p>
        )}
      </div>

      <Button
        type="submit"
        data-ocid="register.submit_button"
        className="w-full h-11 font-semibold text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
            Creating Account...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Create Account
            <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => onSwitchToLogin(email)}
          className="font-semibold text-primary hover:text-primary/80 transition-colors underline-offset-2 hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}

// ── Login Form ────────────────────────────────────────────────────────────────
interface LoginFormProps {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
  initialEmail?: string;
}

function LoginForm({
  onLoginSuccess,
  onSwitchToRegister,
  initialEmail,
}: LoginFormProps) {
  const [email, setEmail] = useState(initialEmail ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Keep login identifier in sync when coming from successful registration.
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      const user = await authenticateUser(email.trim(), password);
      if (!user) {
        setError("Incorrect email or password. Please try again.");
        return;
      }
      await createSession(user.id);
      toast.success(`Welcome back, ${user.fullName}!`, {
        duration: 5000,
      });
      onLoginSuccess();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <motion.div
          data-ocid="login.error_state"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 rounded-lg bg-destructive/10 border border-destructive/25 px-3.5 py-2.5"
        >
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive leading-snug">{error}</p>
        </motion.div>
      )}

      {/* Email */}
      <div className="space-y-1.5">
        <Label
          htmlFor="login-email"
          className="text-sm font-medium text-foreground/80"
        >
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="login-email"
            data-ocid="login.identifier_input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-9 bg-secondary/50 border-border/60 focus-visible:ring-primary/30 h-10"
            autoComplete="email"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="login-password"
            className="text-sm font-medium text-foreground/80"
          >
            Password
          </Label>
          <button
            type="button"
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="login-password"
            data-ocid="login.password_input"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-9 pr-9 bg-secondary/50 border-border/60 focus-visible:ring-primary/30 h-10"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        data-ocid="login.submit_button"
        className="w-full h-11 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
            Signing in...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Sign In
            <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-semibold text-primary hover:text-primary/80 transition-colors underline-offset-2 hover:underline"
        >
          Register now
        </button>
      </p>
    </form>
  );
}

// ── Auth Page (Root) ──────────────────────────────────────────────────────────
export default function AuthPage({
  onLoginSuccess,
  defaultTab = "login",
}: Props) {
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);
  const [loginEmailPrefill, setLoginEmailPrefill] = useState("");

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 30% 20%, oklch(0.28 0.08 265 / 0.6) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 80% 80%, oklch(0.25 0.1 220 / 0.5) 0%, transparent 55%),
          oklch(0.12 0.03 265)
        `,
      }}
    >
      {/* Background image overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "url(/assets/generated/auth-bg.dim_1920x1080.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Decorative blobs */}
      <div
        className="absolute top-0 left-0 w-72 h-72 rounded-full blur-3xl opacity-15"
        style={{ background: "oklch(0.55 0.18 195)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10"
        style={{ background: "oklch(0.45 0.15 265)" }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-xl"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.18 195), oklch(0.45 0.15 265))",
            }}
          >
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-white tracking-tight">
            SecureAuth
          </h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.75 0.05 240)" }}>
            Trusted identity, secured access
          </p>
        </motion.div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key="auth"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
          >
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "login" | "register")}
            >
              <TabsList className="w-full rounded-none h-12 bg-secondary/60 border-b border-border/60 p-0">
                <TabsTrigger
                  value="login"
                  data-ocid="auth.tab.1"
                  className="flex-1 h-full rounded-none font-semibold text-sm data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary transition-all"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  data-ocid="auth.tab.2"
                  className="flex-1 h-full rounded-none font-semibold text-sm data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary transition-all"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="p-6 sm:p-7 mt-0">
                <div className="mb-5">
                  <h2 className="font-display font-bold text-xl text-foreground">
                    Welcome back
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Sign in to your account
                  </p>
                </div>
                <LoginForm
                  onLoginSuccess={onLoginSuccess}
                  onSwitchToRegister={() => setActiveTab("register")}
                  initialEmail={loginEmailPrefill}
                />
              </TabsContent>

              <TabsContent value="register" className="p-6 sm:p-7 mt-0">
                <div className="mb-5">
                  <h2 className="font-display font-bold text-xl text-foreground">
                    Create account
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Fill in your details to get started
                  </p>
                </div>
                <RegisterForm
                  onSwitchToLogin={(email) => {
                    setLoginEmailPrefill(email);
                    setActiveTab("login");
                  }}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <p
          className="text-center text-xs mt-6"
          style={{ color: "oklch(0.55 0.04 240)" }}
        >
          © {new Date().getFullYear()}.{" "}
          <a
            href="https://secureauth.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline transition-colors"
            style={{ color: "oklch(0.65 0.08 195)" }}
          >
            SecureAuth
          </a>
        </p>
      </div>
    </div>
  );
}
