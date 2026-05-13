import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function JoinWaitlistForm() {
  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const placeholder = isFocused ? "Enter your email..." : "Join waitlist...";
  const hasValidEmail = emailRegex.test(email);

  return (
    <form className="flex flex-col items-start gap-2">
      <label className="relative inline-flex">
        <input
          aria-label="Email address"
          className="relative bg-transparent outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
        />
        <AnimatePresence mode="wait">
          {!email && (
            <motion.span
              key={placeholder}
              className="pointer-events-none absolute left-0 top-0 text-muted-foreground"
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              initial={{ opacity: 0, x: 4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {placeholder}
            </motion.span>
          )}
        </AnimatePresence>
      </label>
      <AnimatePresence>
        {hasValidEmail && (
          <motion.button
            type="submit"
            className="outline-none"
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            initial={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            ↠ Submit
          </motion.button>
        )}
      </AnimatePresence>
    </form>
  );
}
