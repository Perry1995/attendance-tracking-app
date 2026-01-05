'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, UserPlus, Users, Mail, Phone, ExternalLink } from 'lucide-react';
import { usersApi } from '@/lib/api/users';
import { guardiansApi, GuardianRelationship } from '@/lib/api/guardians';
import { toast } from 'sonner';

export default function GuardiansPage() {
  const [guardians, setGuardians] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGuardians();
  }, []);

  const fetchGuardians = async () => {
    try {
      setIsLoading(true);
      // Fetch users with role 'guardian'
      const response = await usersApi.getAll({ role: 'guardian' as any });
      if (response.success) {
        setGuardians(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch guardians:', error);
      toast.error('Failed to load guardians');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGuardians = guardians.filter(
    (g) =>
      `${g.firstName} ${g.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Guardians</h1>
              <p className="text-muted-foreground">
                Manage guardian records and student relationships
              </p>
            </div>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Guardian
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Guardians</CardTitle>
              <CardDescription>
                View and manage guardian contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search guardians..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredGuardians.length === 0 ? (
                <div className="text-center py-8 border rounded-lg border-dashed">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <p className="mt-2 text-muted-foreground">No guardians found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guardian</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGuardians.map((guardian) => (
                      <TableRow key={guardian.id}>
                        <TableCell className="font-medium">
                          {guardian.firstName} {guardian.lastName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {guardian.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {guardian.phone || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Relationships
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
