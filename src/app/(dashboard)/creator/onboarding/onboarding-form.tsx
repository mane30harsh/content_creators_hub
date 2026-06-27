"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { onboardingSchema, type OnboardingInput } from "@/lib/validations/creator-profile";
import { completeOnboarding } from "@/lib/actions/creator-profile";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NicheSelector } from "@/components/creator/niche-selector";
import { LanguageSelector } from "@/components/creator/language-selector";
import { AVAILABILITY_OPTIONS } from "@/lib/validations/creator-profile";

export function OnboardingForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      displayName: "",
      username: "",
      bio: "",
      country: "",
      city: "",
      language: ["English"],
      niche: [],
      availability: "AVAILABLE",
    },
  });

  function onSubmit(values: OnboardingInput) {
    startTransition(async () => {
      const result = await completeOnboarding(values);
      if (!result.success) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            form.setError(field as keyof OnboardingInput, {
              message: messages[0],
            });
          });
        }
        toast.error(result.error);
        return;
      }
      toast.success("Profile created! Let's go 🚀");
      router.push("/creator/dashboard");
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Display Name */}
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name *</FormLabel>
              <FormControl>
                <Input placeholder="Your creator name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Username */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username *</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    @
                  </span>
                  <Input
                    className="pl-7"
                    placeholder="yourhandle"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                    }
                  />
                </div>
              </FormControl>
              <FormDescription>
                Lowercase letters, numbers, and underscores only. This will be your public URL.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bio */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell brands what you're all about..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {(field.value?.length ?? 0)}/500 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="United States" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="New York" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Niches */}
        <FormField
          control={form.control}
          name="niche"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Niches *</FormLabel>
              <FormDescription>Pick all that apply.</FormDescription>
              <NicheSelector
                value={field.value}
                onChange={field.onChange}
                error={form.formState.errors.niche?.message}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Languages */}
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Languages *</FormLabel>
              <FormDescription>Languages you create content in.</FormDescription>
              <LanguageSelector
                value={field.value}
                onChange={field.onChange}
                error={form.formState.errors.language?.message}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Availability */}
        <FormField
          control={form.control}
          name="availability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Availability Status *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Creating profile…" : "Complete Setup →"}
        </Button>
      </form>
    </Form>
  );
}
