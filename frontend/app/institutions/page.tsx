'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Building,
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  Users,
  MoreHorizontal,
} from 'lucide-react';
import { institutionsApi, Institution } from '@/lib/api/institutions';
import { toast } from 'sonner';

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInstitutions();
  }, [searchTerm]);

  const fetchInstitutions = async () => {
    try {
      setIsLoading(true);
      const response = await institutionsApi.getAll({
        search: searchTerm || undefined,
      });

      if (response.success) {
        let filteredInstitutions = response.data;

        if (searchTerm) {
          filteredInstitutions = filteredInstitutions.filter((institution) =>
            institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            institution.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            institution.address?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setInstitutions(filteredInstitutions);
      }
    } catch (error) {
      console.error('Failed to fetch institutions:', error);
      toast.error('Failed to load institutions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Institutions</h1>
              <p className="text-muted-foreground">
                Manage institutions and their details
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Institution
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Institutions</CardTitle>
              <CardDescription>
                View and manage all institutions in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search institutions..."
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
              ) : institutions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No institutions found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Institution</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {institutions.map((institution) => (
                      <TableRow key={institution.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <Building className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="font-medium">{institution.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {institution.description || 'No description'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{institution.code}</Badge>
                        </TableCell>
                        <TableCell>
                          {institution.address ? (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="max-w-[200px] truncate">
                                {institution.address}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No address</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {institution.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                {institution.phone}
                              </div>
                            )}
                            {institution.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                {institution.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{institution.userCount || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={institution.isActive ? 'success' : 'secondary'}
                          >
                            {institution.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
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