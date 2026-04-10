"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function userInitials(name: string | null | undefined): string {
  const trimmed = name?.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.[0];
    const b = parts[parts.length - 1]?.[0];
    if (a && b) return `${a}${b}`.toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

export function AccountAvatarDropdown({
  user,
}: {
  user: NonNullable<Session["user"]>;
}) {
  const label = user.name ? `Account menu (${user.name})` : "Account menu";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="min-h-11 min-w-11 rounded-full"
          aria-label={label}
        >
          <Avatar>
            {user.image ? (
              <AvatarImage
                src={user.image}
                alt=""
                referrerPolicy="no-referrer"
              />
            ) : null}
            <AvatarFallback className="text-xs font-medium">
              {userInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-36 max-w-[min(18rem,calc(100vw-2rem))]"
        align="end"
      >
        <DropdownMenuGroup className="flex flex-col gap-0.5">
          <DropdownMenuItem asChild>
            <Link
              href="/protected"
              className="cursor-pointer text-sm text-foreground"
            >
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/protected"
              className="cursor-pointer text-sm text-foreground"
            >
              Billing
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/protected"
              className="cursor-pointer text-sm text-foreground"
            >
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="flex flex-col gap-0.5">
          <DropdownMenuItem
            variant="destructive"
            className="text-sm"
            onSelect={() => {
              void signOut({ callbackUrl: "/" });
            }}
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
