import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type RoleStubPageProps = {
  title: string;
  description: string;
  body: string;
};

export function RoleStubPage({ title, description, body }: RoleStubPageProps) {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Coming next</CardTitle>
          <CardDescription>{body}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This section will connect to your organization data and workflows as
            features ship.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
