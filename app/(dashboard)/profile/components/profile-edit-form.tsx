"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Save, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageUploader from "@/components/shered/image-uploader";
import { updateProfile } from "@/service/profile";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  profileImage: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ProfileEditFormProps {
  user: {
    name: string;
    email: string;
    role: string;
    profileImage?: string | null;
  };
}

export default function ProfileEditForm({ user }: ProfileEditFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name,
      profileImage: user.profileImage || "",
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const payload: { name?: string; profileImage?: string } = {
        name: values.name,
      };
      if (values.profileImage) {
        payload.profileImage = values.profileImage;
      }

      const result = await updateProfile(payload);

      if (result.success) {
        toast.success(result.message || "Profile updated successfully.");
      } else {
        toast.error(result.message || "Failed to update profile.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ImgBB image uploader */}
      <div className="space-y-2">
        <Label>Profile Photo</Label>
        <Controller
          name="profileImage"
          control={control}
          render={({ field }) => (
            <ImageUploader
              value={field.value}
              onChange={field.onChange}
              previewSize={72}
            />
          )}
        />
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="profile-name">
          <User className="inline w-3.5 h-3.5 mr-1 mb-0.5" />
          Full Name
        </Label>
        <Input
          id="profile-name"
          placeholder="Your full name"
          {...register("name")}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Read-only email */}
      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          value={user.email}
          disabled
          className="bg-zinc-50 dark:bg-zinc-900 cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground">
          Email address cannot be changed.
        </p>
      </div>

      <Button type="submit" disabled={isPending || !isDirty} className="gap-2">
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {isPending ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  );
}
