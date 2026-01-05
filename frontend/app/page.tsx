import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-4xl text-center">Attendance Tracker</CardTitle>
            <CardDescription className="text-center">
              Modern attendance tracking system for educational institutions
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Link href="/auth/login">
                <Button className="w-full" variant="default">
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="w-full" variant="outline">
                  Register
                </Button>
              </Link>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Features</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Real-time attendance tracking</li>
                <li>Multiple user roles (Admin, Teacher, Student, Guardian)</li>
                <li>Class and institution management</li>
                <li>Comprehensive reporting and analytics</li>
                <li>Mobile-friendly interface</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
