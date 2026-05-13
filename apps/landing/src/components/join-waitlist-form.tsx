import { useForm } from "@tanstack/react-form";
import { z } from "astro/zod";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const waitlistSchema = z.object({
  email: z.email(),
});

export function JoinWaitlistForm() {
  const [isFocused, setIsFocused] = useState(false);
  const placeholder = isFocused ? "Enter your email..." : "Join waitlist...";

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onChange: waitlistSchema,
    },
    onSubmit: async ({ value }) => {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value.email.trim() }),
      });
    },
  });

  return (
    <form
      className="flex flex-col items-start gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field name="email">
        {(field) => {
          const email = field.state.value;

          return (
            <>
              <label className="relative inline-flex">
                <input
                  aria-label="Email address"
                  autoComplete="email"
                  className="relative bg-transparent outline-none"
                  inputMode="email"
                  name={field.name}
                  spellCheck={false}
                  type="email"
                  value={email}
                  onBlur={() => {
                    setIsFocused(false);
                    field.handleBlur();
                  }}
                  onChange={(event) => field.handleChange(event.target.value)}
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
              <form.Subscribe
                selector={(state) => ({
                  hasValidEmail: state.isValid,
                  isSubmitting: state.isSubmitting,
                })}
              >
                {({ hasValidEmail, isSubmitting }) => (
                  <AnimatePresence>
                    {hasValidEmail && (
                      <motion.button
                        type="submit"
                        className="outline-none"
                        disabled={isSubmitting}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        initial={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                      >
                        {isSubmitting ? "↠ Sending" : "↠ Submit"}
                      </motion.button>
                    )}
                  </AnimatePresence>
                )}
              </form.Subscribe>
            </>
          );
        }}
      </form.Field>
    </form>
  );
}
