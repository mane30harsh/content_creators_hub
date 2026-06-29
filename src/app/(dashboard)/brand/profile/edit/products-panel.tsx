"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ExternalLink, Package, X, Check } from "lucide-react";

import {
  brandProductSchema,
  type BrandProductInput,
} from "@/lib/validations/brand-profile";
import {
  upsertBrandProduct,
  deleteBrandProduct,
} from "@/lib/actions/brand-profile";
import {
  Form, FormField, FormItem, FormLabel,
  FormControl, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  productUrl: string | null;
  isPublic: boolean;
}

interface ProductsPanelProps {
  products: Product[];
}

function ProductForm({
  defaultValues,
  productId,
  onSuccess,
  onCancel,
}: {
  defaultValues?: Partial<BrandProductInput>;
  productId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<BrandProductInput>({
    resolver: zodResolver(brandProductSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      productUrl: "",
      isPublic: true,
      ...defaultValues,
    },
  });

  function onSubmit(values: BrandProductInput) {
    startTransition(async () => {
      const result = await upsertBrandProduct(values, productId);
      if (!result.success) {
        toast.error(result.error);
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([f, msgs]) =>
            form.setError(f as keyof BrandProductInput, { message: msgs[0] })
          );
        }
        return;
      }
      toast.success(productId ? "Product updated!" : "Product added!");
      onSuccess();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="AcmePro Max" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="productUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Page URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://acme.com/product" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://…/product.jpg" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of this product…"
                  className="resize-none"
                  rows={2}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
            <X className="mr-1.5 h-3.5 w-3.5" />
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isPending}>
            <Check className="mr-1.5 h-3.5 w-3.5" />
            {isPending ? "Saving…" : productId ? "Update" : "Add Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function ProductCard({
  product,
  onEdit,
}: {
  product: Product;
  onEdit: () => void;
}) {
  const [deleting, startDelete] = useTransition();

  function handleDelete() {
    if (!confirm(`Remove "${product.name}"?`)) return;
    startDelete(async () => {
      const result = await deleteBrandProduct(product.id);
      if (!result.success) toast.error(result.error);
      else toast.success("Product removed");
    });
  }

  return (
    <div className={cn(
      "group flex gap-4 rounded-xl border border-border bg-card p-4 transition-opacity",
      deleting && "opacity-50 pointer-events-none"
    )}>
      {/* Thumbnail */}
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Package className="h-6 w-6" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold leading-tight">{product.name}</p>
            {product.description && (
              <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                {product.description}
              </p>
            )}
          </div>
          {/* Actions */}
          <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {product.productUrl && (
              <a
                href={product.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <button
              onClick={onEdit}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductsPanel({ products: initial }: ProductsPanelProps) {
  const [products] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Product Showcase
          </CardTitle>
          <CardDescription>
            Highlight your key products so creators understand what they&apos;ll be promoting.
          </CardDescription>
        </div>
        {!showForm && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Product
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add form */}
        {showForm && !editingId && (
          <ProductForm
            onSuccess={() => { setShowForm(false); window.location.reload(); }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {products.length === 0 && !showForm ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
            <Package className="mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium">No products yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add your products so creators know what they&apos;re promoting.
            </p>
            <Button size="sm" className="mt-4" onClick={() => setShowForm(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add First Product
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) =>
              editingId === product.id ? (
                <ProductForm
                  key={product.id}
                  productId={product.id}
                  defaultValues={{
                    name: product.name,
                    description: product.description ?? "",
                    imageUrl: product.imageUrl ?? "",
                    productUrl: product.productUrl ?? "",
                    isPublic: product.isPublic,
                  }}
                  onSuccess={() => { setEditingId(null); window.location.reload(); }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={() => { setShowForm(false); setEditingId(product.id); }}
                />
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
