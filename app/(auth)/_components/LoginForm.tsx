"use client";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import React, { useActionState, useEffect } from 'react';
import { registerUser } from '../_actions/authAction';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const LoginForm = () => {
    const [state,action,pending]=useActionState(registerUser,false)
    const route = useRouter()
    useEffect(() => {
  if (!state) return;

  if (state.success) {
    toast.success("Login Successfully");
    const role = (state as any).role;
    if (role === "admin") {
      route.push('/admin-dashboard');
    } else if (role === "provider") {
      route.push('/provider-dashboard');
    } else {
      route.push('/dashboard');
    }
  } else {
    toast.error(state.message || "Login Failed");
  }
}, [state]);
    return (
        <form action={action} className="space-y-4">
            <Card className="space-y-4 p-6">
                <Input name="email" placeholder="Email" type="email" required ></Input>
                <Input name="password" placeholder="Password" type="password" required ></Input>
                <Button type="submit">
                    {pending?"submitting":"login"}
                    </Button>
            </Card>
        </form>
    );
};

export default LoginForm;




