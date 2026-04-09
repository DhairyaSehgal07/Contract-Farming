import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">

        {/* Heading */}
        <h1 className="text-3xl font-bold tracking-tight">
          Contract Farming
        </h1>

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full">
          <Link href="/organisation/register">
            <Button className="w-full cursor-pointer">
              Register Organisation
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
  )
}