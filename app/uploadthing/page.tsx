"use client";

import * as React from "react";
import { Copy, ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UploadButton } from "@/lib/uploadthing";

export default function UploadThingPage() {
  const [lastUrl, setLastUrl] = React.useState<string | null>(null);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Image upload
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload an image and copy its public URL for use in the app.
        </p>
      </div>

      <Card className="border-border/60">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
              <ImageIcon className="size-4" aria-hidden />
            </span>
            Upload
          </CardTitle>
          <CardDescription className="text-sm">
            One image per upload, up to 4&nbsp;MB. JPEG, PNG, WebP, GIF, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex min-h-11 items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/30 px-3 py-6">
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                const file = res[0];
                const url = file?.ufsUrl ?? file?.serverData?.url;
                if (url) {
                  setLastUrl(url);
                  toast.success("Upload complete", {
                    description: "The image URL is ready to copy.",
                  });
                }
              }}
              onUploadError={(error) => {
                toast.error("Upload failed", {
                  description: error.message,
                });
              }}
              appearance={{
                button:
                  "ut-ready:bg-primary ut-ready:hover:bg-primary/90 ut-uploading:cursor-not-allowed ut-uploading:bg-primary/70 ut-readying:bg-muted ut-readying:text-muted-foreground rounded-lg px-4 py-2 text-sm font-medium text-primary-foreground",
                allowedContent: "ut-readying:text-muted-foreground text-xs",
              }}
              content={{
                button: ({ ready, isUploading }) =>
                  ready
                    ? isUploading
                      ? "Uploading…"
                      : "Choose image"
                    : "Preparing…",
              }}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="uploaded-url"
              className="text-xs font-medium text-muted-foreground"
            >
              Image URL
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                id="uploaded-url"
                readOnly
                value={lastUrl ?? ""}
                placeholder="Upload a file to see the URL here"
                className="font-mono text-xs md:text-sm"
              />
              <Button
                type="button"
                variant="outline"
                className="min-h-11 shrink-0 sm:min-w-28"
                disabled={!lastUrl}
                onClick={async () => {
                  if (!lastUrl) return;
                  try {
                    await navigator.clipboard.writeText(lastUrl);
                    toast.success("Copied to clipboard");
                  } catch {
                    toast.error("Could not copy — select the field and copy manually.");
                  }
                }}
              >
                <Copy className="size-4" aria-hidden />
                Copy
              </Button>
            </div>
          </div>

          {lastUrl ? (
            <div className="overflow-hidden rounded-lg border border-border bg-muted/20">
              {/* eslint-disable-next-line @next/next/no-img-element -- remote UploadThing URL */}
              <img
                src={lastUrl}
                alt="Uploaded preview"
                className="max-h-64 w-full object-contain"
              />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
