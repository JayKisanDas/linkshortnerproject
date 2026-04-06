import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getLinksByUserId } from "@/data/links";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateLinkDialog } from "@/components/CreateLinkDialog";
import { EditLinkDialog } from "@/components/EditLinkDialog";
import { DeleteLinkDialog } from "@/components/DeleteLinkDialog";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const links = await getLinksByUserId(userId);

  return (
    <div className="w-full py-8 px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Links</h1>
        <CreateLinkDialog />
      </div>
      {links.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              You have not created any links yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="flex flex-col gap-4">
          {links.map((link) => (
            <li key={link.id}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium truncate">
                    {link.shortCode}
                  </CardTitle>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <EditLinkDialog link={link} />
                    <DeleteLinkDialog link={link} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-sm text-muted-foreground">
                      {link.url}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    Created: {new Date(link.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
