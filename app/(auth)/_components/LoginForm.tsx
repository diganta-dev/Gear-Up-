"use client";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import React, { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { loginAction } from '../_actions/authAction';
import { Eye, EyeOff } from 'lucide-react';

const LoginForm = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, action, pending] = useActionState(loginAction, undefined as any);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!state) return;

    if (state.success) {
      toast.success("Login Successfully");
      // Note: the login response from backend and the jwt decode handles redirect in server action too,
      // but if it relies on client redirect here, it's covered.
    } else {
      toast.error(state.message || "Login Failed");
    }
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <Card className="space-y-4 p-6">
        <Input name="email" placeholder="Email" type="email" required />
        <div className="relative">
          <Input
            name="password"
            placeholder="Password"
            type={showPassword ? "text" : "password"} 
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Submitting..." : "Login"}
        </Button>
      </Card>
    </form>
  );
};

export default LoginForm;
