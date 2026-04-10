import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AdminPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Contract Farming</h1>

        <div className="flex w-full flex-col gap-4">
          <Link href="/organisation/register">
            <Button className="w-full cursor-pointer">
              Register Organisation
            </Button>
          </Link>

          <Link href="/organisation/list">
            <Button variant="outline" className="w-full cursor-pointer">
              View Organisations
            </Button>
          </Link>

          <Link href="/user/register">
            <Button variant="outline" className="w-full cursor-pointer">
              Register User
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
