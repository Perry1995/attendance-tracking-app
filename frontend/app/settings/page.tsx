import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Building,
  Bell,
  Shield,
  Palette,
  Save,
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your application settings and preferences
            </p>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Manage your general account settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="institution">Institution Name</Label>
                      <Input
                        id="institution"
                        defaultValue="Default Institution"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input id="timezone" defaultValue="America/New_York" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Input id="language" defaultValue="English" />
                  </div>
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        title: 'Email Notifications',
                        description: 'Receive email updates about attendance',
                      },
                      {
                        title: 'Absence Alerts',
                        description:
                          'Get notified when a student is marked absent',
                      },
                      {
                        title: 'Weekly Reports',
                        description:
                          'Receive weekly attendance summary reports',
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.description}
                          </div>
                        </div>
                        <input type="checkbox" defaultChecked className="h-4 w-4" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your password and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button>Update Password</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize how the application looks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <div className="flex gap-4">
                        <Button variant="outline" className="flex-1">
                          Light
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Dark
                        </Button>
                        <Button variant="default" className="flex-1">
                          System
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Accent Color</Label>
                      <div className="flex gap-2">
                        {['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'].map(
                          (color, index) => (
                            <div
                              key={index}
                              className={`h-8 w-8 rounded-full cursor-pointer ${color} ${
                                index === 0 ? 'ring-2 ring-offset-2 ring-primary' : ''
                              }`}
                            />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
