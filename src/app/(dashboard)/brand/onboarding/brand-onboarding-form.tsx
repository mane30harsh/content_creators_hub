"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, Globe, MapPin, Sparkles } from "lucide-react";

import {
  brandOnboardingSchema,
  type BrandOnboardingInput,
  INDUSTRIES,
} from "@/lib/validations/brand-profile";
import { completeBrandOnboarding } from "@/lib/actions/brand-profile";
import {
  Form, FormField, FormItem, FormLabel,
  FormControl, FormMessage, FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

export function BrandOnboardingForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<BrandOnboardingInput>({
    resolver: zodResolver(brandOnboardingSchema),
    defaultValues: {
      companyName: "",
      slug: "",
      tagline: "",
      industry: "",
      country: "",
      city: "",
      bio: "",
    },
  });

  // Auto-generate slug from company name
  function handleCompanyNameChange(value: string) {
    form.setValue("companyName", value);
    const currentSlug = form.getValues("slug");
    // Only auto-fill if slug hasn't been manually edited
    if (!currentSlug || currentSlug === slugify(form.getValues("companyName").slice(0, -1))) {
      form.setValue("slug", slugify(value), { shouldValidate: !!currentSlug });
    }
  }

  function slugify(str: string) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 40);
  }

  function onSubmit(values: BrandOnboardingInput) {
    startTransition(async () => {
      const result = await completeBrandOnboarding(values);
      if (!result.success) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            form.setError(field as keyof BrandOnboardingInput, { message: messages[0] });
          });
        }
        toast.error(result.error);
        return;
      }
      toast.success("Brand profile created!");
      router.push("/brand/dashboard");
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* Company Name */}
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                Company Name <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Acme Inc."
                  {...field}
                  onChange={(e) => handleCompanyNameChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Slug */}
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                Profile URL <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="flex items-center rounded-md border border-input bg-muted/40 focus-within:ring-1 focus-within:ring-ring overflow-hidden">
                  <span className="shrink-0 border-r border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                    /brand/
                  </span>
                  <input
                    className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                    placeholder="acme-inc"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                      )
                    }
                  />
                </div>
              </FormControl>
              <FormDescription>
                This becomes your public brand page URL. Lowercase letters, numbers, and hyphens only.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tagline */}
        <FormField
          control={form.control}
          name="tagline"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                Tagline
              </FormLabel>
              <FormControl>
                <Input placeholder="We make things people love." {...field} />
              </FormControl>
              <FormDescription>A punchy one-liner shown under your company name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Industry */}
        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Industry <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-72">
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  Country
                </FormLabel>
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
                <FormLabel>City / HQ</FormLabel>
                <FormControl>
                  <Input placeholder="San Francisco" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Bio */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About Your Brand</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell creators what your brand is about, who you're trying to reach, and why they should want to work with you…"
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {(field.value?.length ?? 0)}/800 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-2">
          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending ? "Creating your brand profile…" : "Continue →"}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          You can add your logo, social links, and product showcase after setup.
        </p>
      </form>
    </Form>
  );
}
