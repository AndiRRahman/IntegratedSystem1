import MainLayout from '@/components/shared/main-layout';
import { getSession } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default async function ProfilePage() {
  const session = await getSession();
  const initials = session?.name.split(' ').map(n => n[0]).join('') || 'U';

  return (
    <MainLayout>
      <h1 className="font-headline text-3xl font-bold mb-8">My Profile</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`https://avatar.vercel.sh/${session?.email}.png`} alt={`@${session?.name}`} />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{session?.name}</CardTitle>
              <CardDescription>{session?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" defaultValue={session?.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={session?.email} readOnly />
          </div>
          <Button>Update Profile</Button>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
