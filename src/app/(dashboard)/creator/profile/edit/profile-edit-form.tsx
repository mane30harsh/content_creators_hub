"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Instagram,
  Youtube,
  Music2,
  Twitter,
  Linkedin,
  Globe,
  Mail,
  Phone,
  User,
  MapPin,
  Sparkles,
} from "lucide-react";
// Inline type for creator profile data passed from server component
interface CreatorProfile {
  displayName: string | null;
  username: string | null;
  bio: string | null;
  country: string | null;
  city: string | null;
  language: string[];
  niche: string[];
  availability: string;
  contactEmail: string | null;
  contactPhone: string | null;
  instagramHandle: string | null;
  instagramFollowers: number | null;
  youtubeHandle: string | null;
  youtubeSubscribers: number | null;
  tiktokHandle: string | null;
  tiktokFollowers: number | null;
  twitterHandle: string | null;
  twitterFollowers: number | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  avatar: string | null;
  coverImage: string | null;
}

import {
  creatorProfileSchema,
  type CreatorProfileInput,
  AVAILABILITY_OPTIONS,
} from "@/lib/validations/creator-profile";
import { updateCreatorProfile } from "@/lib/actions/creator-profile";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { NicheSelector } from "@/components/creator/niche-selector";
import { LanguageSelector } from "@/components/creator/language-selector";

interface ProfileEditFormProps {
  profile: CreatorProfile;
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreatorProfileInput>({
    resolver: zodResolver(creatorProfileSchema),
    defaultValues: {
      displayName: profile.displayName ?? "",
      username: profile.username ?? "",
      bio: profile.bio ?? "",
      country: profile.country ?? "",
      city: profile.city ?? "",
      language: profile.language.length ? profile.language : ["English"],
      niche: profile.niche,
      availability: (profile.availability as CreatorProfileInput["availability"]) ?? "AVAILABLE",
      contactEmail: profile.contactEmail ?? "",
      contactPhone: profile.contactPhone ?? "",
      instagramHandle: profile.instagramHandle ?? "",
      instagramFollowers: profile.instagramFollowers ?? undefined,
      youtubeHandle: profile.youtubeHandle ?? "",
      youtubeSubscribers: profile.youtubeSubscribers ?? undefined,
      tiktokHandle: profile.tiktokHandle ?? "",
      tiktokFollowers: profile.tiktokFollowers ?? undefined,
      twitterHandle: profile.twitterHandle ?? "",
      twitterFollowers: profile.twitterFollowers ?? undefined,
      linkedinUrl: profile.linkedinUrl ?? "",
      websiteUrl: profile.websiteUrl ?? "",
      avatar: profile.avatar ?? "",
      coverImage: profile.coverImage ?? "",
    },
  });

  function onSubmit(values: CreatorProfileInput) {
    startTransition(async () => {
      const result = await updateCreatorProfile(values);
      if (!result.success) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            form.setError(field as keyof CreatorProfileInput, { message: messages[0] });
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="basics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="niches">Niches</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          {/* ── BASICS ───────────────────────────────────── */}
          <TabsContent value="basics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> Basic Info
                </CardTitle>
                <CardDescription>
                  Your public identity on the platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar & Cover URLs */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="avatar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Picture URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormDescription>Paste a direct image link.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="coverImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Banner URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormDescription>Recommended: 1500×500px.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Display Name + Username */}
                <div className="grid gap-4 sm:grid-cols-2">
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
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
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

                {/* Bio */}
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell brands what makes you unique..."
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>{(field.value?.length ?? 0)}/500</FormDescription>
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
                          <MapPin className="h-3.5 w-3.5" /> Country
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
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Availability */}
                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Availability Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── NICHES & LANGUAGES ───────────────────────── */}
          <TabsContent value="niches">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" /> Niches & Languages
                </CardTitle>
                <CardDescription>
                  Help brands discover you with the right filters.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <FormField
                  control={form.control}
                  name="niche"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Niches *</FormLabel>
                      <FormDescription>Select every niche that applies.</FormDescription>
                      <NicheSelector
                        value={field.value}
                        onChange={field.onChange}
                        error={form.formState.errors.niche?.message}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator />
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Languages *</FormLabel>
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── SOCIAL ───────────────────────────────────── */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media & Following</CardTitle>
                <CardDescription>
                  Enter your handles and follower counts to be searchable by platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Instagram */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-pink-600">
                    <Instagram className="h-4 w-4" /> Instagram
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="instagramHandle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Handle</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                              <Input className="pl-7" placeholder="yourhandle" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="instagramFollowers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Followers</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="10000"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* YouTube */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
                    <Youtube className="h-4 w-4" /> YouTube
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="youtubeHandle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Channel Handle</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                              <Input className="pl-7" placeholder="yourchannel" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="youtubeSubscribers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subscribers</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="5000"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* TikTok */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Music2 className="h-4 w-4" /> TikTok
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="tiktokHandle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Handle</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                              <Input className="pl-7" placeholder="yourhandle" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tiktokFollowers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Followers</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="25000"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Twitter / X */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-sky-500">
                    <Twitter className="h-4 w-4" /> X / Twitter
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="twitterHandle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Handle</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                              <Input className="pl-7" placeholder="yourhandle" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="twitterFollowers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Followers</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="3000"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* LinkedIn + Website */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="linkedinUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <Linkedin className="h-3.5 w-3.5 text-blue-600" /> LinkedIn URL
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/you" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="websiteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5" /> Website URL
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://yoursite.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── CONTACT ──────────────────────────────────── */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Visible to brands who view your profile. Only share what you're comfortable with.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" /> Business Email
                      </FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="hello@yoursite.com" {...field} />
                      </FormControl>
                      <FormDescription>For brand partnership enquiries.</FormDescription>
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
                        <Phone className="h-3.5 w-3.5" /> Phone
                      </FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+1 555 000 0000" {...field} />
                      </FormControl>
                      <FormDescription>Optional. Not displayed publicly by default.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save button — always visible */}
        <div className="mt-6 flex justify-end gap-3">
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
