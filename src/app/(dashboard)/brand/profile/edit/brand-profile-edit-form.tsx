"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building2, Globe, MapPin, Sparkles, Instagram, Twitter,
  Youtube, Music2, Linkedin, Facebook, Mail, Phone, Image as ImageIcon,
  Users, Calendar,
} from "lucide-react";

import {
  brandProfileSchema,
  type BrandProfileInput,
  INDUSTRIES,
  COMPANY_SIZES,
} from "@/lib/validations/brand-profile";
import { updateBrandProfile } from "@/lib/actions/brand-profile";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BrandProfileData {
  slug: string | null;
  companyName: string | null;
  tagline: string | null;
  logo: string | null;
  coverImage: string | null;
  bio: string | null;
  industry: string | null;
  companySize: string | null;
  foundedYear: number | null;
  websiteUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  country: string | null;
  city: string | null;
  instagramHandle: string | null;
  twitterHandle: string | null;
  youtubeHandle: string | null;
  tiktokHandle: string | null;
  linkedinUrl: string | null;
  facebookUrl: string | null;
}

export function BrandProfileEditForm({ profile }: { profile: BrandProfileData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<BrandProfileInput>({
    resolver: zodResolver(brandProfileSchema),
    defaultValues: {
      slug:            profile.slug ?? "",
      companyName:     profile.companyName ?? "",
      tagline:         profile.tagline ?? "",
      logo:            profile.logo ?? "",
      coverImage:      profile.coverImage ?? "",
      bio:             profile.bio ?? "",
      industry:        profile.industry ?? "",
      companySize:     profile.companySize ?? "",
      foundedYear:     profile.foundedYear ?? undefined,
      websiteUrl:      profile.websiteUrl ?? "",
      contactEmail:    profile.contactEmail ?? "",
      contactPhone:    profile.contactPhone ?? "",
      country:         profile.country ?? "",
      city:            profile.city ?? "",
      instagramHandle: profile.instagramHandle ?? "",
      twitterHandle:   profile.twitterHandle ?? "",
      youtubeHandle:   profile.youtubeHandle ?? "",
      tiktokHandle:    profile.tiktokHandle ?? "",
      linkedinUrl:     profile.linkedinUrl ?? "",
      facebookUrl:     profile.facebookUrl ?? "",
    },
  });

  function onSubmit(values: BrandProfileInput) {
    startTransition(async () => {
      const result = await updateBrandProfile(values);
      if (!result.success) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, msgs]) => {
            form.setError(field as keyof BrandProfileInput, { message: msgs[0] });
          });
        }
        toast.error(result.error);
        return;
      }
      toast.success("Profile saved!");
      router.refresh();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="identity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 text-xs sm:text-sm">
            <TabsTrigger value="identity">Identity</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          {/* ── IDENTITY ────────────────────────────────── */}
          <TabsContent value="identity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Brand Identity
                </CardTitle>
                <CardDescription>
                  Your public-facing name, slug, imagery and description.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo + Cover */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          Logo URL
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://…/logo.png" {...field} />
                        </FormControl>
                        <FormDescription>Square image recommended (min 200×200).</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="coverImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          Cover Banner URL
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://…/cover.jpg" {...field} />
                        </FormControl>
                        <FormDescription>Recommended 1500×500px.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Company Name + Slug */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Company Name <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Profile Slug <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center rounded-md border border-input bg-muted/40 focus-within:ring-1 focus-within:ring-ring overflow-hidden">
                            <span className="shrink-0 border-r border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                              /brand/
                            </span>
                            <input
                              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                                )
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                        <Input placeholder="Just do it." {...field} />
                      </FormControl>
                      <FormDescription>
                        {(field.value?.length ?? 0)}/120 · Shown under your company name.
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
                      <FormLabel>About the Brand</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Who you are, what you sell, and why creators should partner with you…"
                          className="resize-none"
                          rows={5}
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

                {/* Industry */}
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Industry <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry…" />
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── COMPANY ─────────────────────────────────── */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Company Details
                </CardTitle>
                <CardDescription>
                  Size, founding year, location, and website.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="companySize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          Company Size
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select size…" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COMPANY_SIZES.map(({ value, label }) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="foundedYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          Founded Year
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={String(new Date().getFullYear())}
                            min={1800}
                            max={new Date().getFullYear()}
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value === "" ? "" : Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="websiteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                        Website
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="https://acme.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

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
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── SOCIAL ──────────────────────────────────── */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
                <CardDescription>
                  Link your brand&apos;s social accounts so creators can find you everywhere.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {[
                  { name: "instagramHandle" as const, Icon: Instagram, label: "Instagram", color: "text-pink-600", prefix: "@", placeholder: "acmebrand" },
                  { name: "twitterHandle" as const, Icon: Twitter, label: "X / Twitter", color: "text-sky-500", prefix: "@", placeholder: "acmebrand" },
                  { name: "youtubeHandle" as const, Icon: Youtube, label: "YouTube", color: "text-red-600", prefix: "@", placeholder: "acmechannel" },
                  { name: "tiktokHandle" as const, Icon: Music2, label: "TikTok", color: "text-foreground", prefix: "@", placeholder: "acmebrand" },
                ].map(({ name, Icon, label, color, prefix, placeholder }) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={`flex items-center gap-1.5 ${color}`}>
                          <Icon className="h-3.5 w-3.5" />
                          {label}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
                              {prefix}
                            </span>
                            <Input className="pl-7" placeholder={placeholder} {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                <Separator />

                {[
                  { name: "linkedinUrl" as const, Icon: Linkedin, label: "LinkedIn URL", color: "text-blue-600", placeholder: "https://linkedin.com/company/acme" },
                  { name: "facebookUrl" as const, Icon: Facebook, label: "Facebook URL", color: "text-blue-700", placeholder: "https://facebook.com/acme" },
                ].map(({ name, Icon, label, color, placeholder }) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={`flex items-center gap-1.5 ${color}`}>
                          <Icon className="h-3.5 w-3.5" />
                          {label}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder={placeholder} {...(field as React.InputHTMLAttributes<HTMLInputElement>)} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── CONTACT ─────────────────────────────────── */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Shown on your public profile so creators can reach your partnerships team.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        Partnerships Email
                      </FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="partnerships@acme.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Creators will use this to initiate brand deals.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        Phone (optional)
                      </FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+1 555 000 0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sticky save bar */}
        <div className="flex justify-end gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Need React import for InputHTMLAttributes reference
import React from "react";
