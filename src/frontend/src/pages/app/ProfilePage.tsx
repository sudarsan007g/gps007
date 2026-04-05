import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Mail,
  Moon,
  Phone,
  Shield,
  Sun,
  LogOut,
  Calendar,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { User } from "../../types/auth";

interface ProfilePageProps {
  user: User;
  theme: "light" | "dark";
  onBack: () => void;
  onToggleTheme: () => void;
  onLogout: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ProfilePage({
  user,
  theme,
  onBack,
  onToggleTheme,
  onLogout,
}: ProfilePageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.button
          onClick={onBack}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </motion.button>
        <h1 className="text-xl font-bold">Profile Settings</h1>
      </div>

      {/* User Avatar and Name Card */}
      <motion.div
        className="rounded-lg border border-border/50 bg-card/50 p-6 backdrop-blur"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center font-display font-bold text-lg text-white shadow-lg shrink-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.18 195), oklch(0.45 0.18 265))",
            }}
          >
            {user.fullName
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">{user.fullName}</h2>
            <p className="text-sm text-muted-foreground">
              User ID: {user.id.slice(0, 8)}...
            </p>
          </div>
        </div>
      </motion.div>

      {/* Account Details */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Account Information
        </h3>

        {/* Email */}
        <div className="rounded-lg border border-border/50 bg-card/30 p-4 backdrop-blur flex items-start gap-3">
          <Mail className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Email
            </p>
            <p className="text-sm font-medium text-foreground break-all">
              {user.email}
            </p>
          </div>
        </div>

        {/* Phone */}
        <div className="rounded-lg border border-border/50 bg-card/30 p-4 backdrop-blur flex items-start gap-3">
          <Phone className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Phone Number
            </p>
            <p className="text-sm font-medium text-foreground">{user.mobile}</p>
          </div>
        </div>

        {/* Account Created */}
        <div className="rounded-lg border border-border/50 bg-card/30 p-4 backdrop-blur flex items-start gap-3">
          <Calendar className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Account Created
            </p>
            <p className="text-sm font-medium text-foreground">
              {formatDate(user.createdAt)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Settings */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Settings
        </h3>

        {/* Theme Toggle */}
        <motion.div
          className="rounded-lg border border-border/50 bg-card/30 p-4 backdrop-blur flex items-center justify-between"
          whileHover={{ backgroundColor: "oklch(var(--color-card) / 0.5)" }}
        >
          <div className="flex items-center gap-3">
            {theme === "dark" ? (
              <Moon className="h-5 w-5 text-yellow-500" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-500" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">Theme</p>
              <p className="text-xs text-muted-foreground capitalize">
                {theme} mode
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleTheme}
            className="h-8 px-3 text-xs"
          >
            Toggle
          </Button>
        </motion.div>
      </motion.div>

      {/* Actions */}
      <motion.div
        className="space-y-3 pt-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Actions
        </h3>

        {/* Logout Button */}
        <Button
          onClick={() => {
            onLogout();
            toast.success("Logged out successfully");
          }}
          variant="outline"
          className="w-full h-10 justify-start gap-3 text-foreground hover:text-foreground hover:bg-card/50"
        >
          <LogOut className="h-4 w-4 text-blue-500" />
          Sign Out
        </Button>
      </motion.div>

      {/* Security Info */}
      <motion.div
        className="rounded-lg border border-border/50 bg-card/30 p-4 backdrop-blur flex items-start gap-3 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Shield className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Data & Security
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Your account data is encrypted and securely stored. For additional security,
            consider signing out of other devices periodically.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
