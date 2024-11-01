import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { forwardRef, InputHTMLAttributes, useState } from "react";

export const FloatingLabelInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label: string }
>(({ className, label, placeholder, type, ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        className={cn(
          "h-14 pt-4",
          (isFocused || hasValue) && "pt-3",
          className,
        )}
        ref={ref}
        {...props}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          setHasValue(e.target.value !== "");
          props.onBlur?.(e);
        }}
        onChange={(e) => {
          setHasValue(e.target.value !== "");
          props.onChange?.(e);
        }}
        placeholder={placeholder}
        type={type === "password" && !showPassword ? "password" : "text"}
      />
      <Label
        className={cn(
          "absolute left-3 text-muted-foreground transition-all duration-200",
          !!placeholder ? "top-1 text-[10px]" : "top-5",
          (isFocused || hasValue) &&
            "left-1 -top-3 text-xs text-primary bg-white px-2",
        )}
      >
        {label}
      </Label>
      {type === "password" && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-2 top-3 h-8 w-8 px-0"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          <span className="sr-only">
            {showPassword ? "Hide password" : "Show password"}
          </span>
        </Button>
      )}
    </div>
  );
});

FloatingLabelInput.displayName = "FloatingLabelInput";

export default FloatingLabelInput;
