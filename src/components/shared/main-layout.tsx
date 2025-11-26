import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "./header";
import { Footer } from "./footer";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header session={session} />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
