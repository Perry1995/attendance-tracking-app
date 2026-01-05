'use client';

import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  HelpCircle,
  Book,
  Mail,
  MessageCircle,
  FileText,
  Video,
  ExternalLink,
} from 'lucide-react';

export default function HelpPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Help & Support</h1>
        <p className="text-xl text-muted-foreground">
          Find answers to common questions and get support
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Documentation
            </CardTitle>
            <CardDescription>
              Browse our comprehensive documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link
                href="/docs/getting-started"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <FileText className="h-4 w-4" />
                Getting Started Guide
              </Link>
              <Link
                href="/docs/api"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <FileText className="h-4 w-4" />
                API Documentation
              </Link>
              <Link
                href="/docs/features"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <FileText className="h-4 w-4" />
                Feature Guide
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Common Questions
            </CardTitle>
            <CardDescription>
              Answers to frequently asked questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link
                href="/faq/how-to-create-class"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                How do I create a new class?
              </Link>
              <Link
                href="/faq/attendance-tracking"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                How do I track student attendance?
              </Link>
              <Link
                href="/faq/adding-students"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                How do I add new students?
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-12">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Mail className="h-5 w-5" />
              Email Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Get help via email
            </p>
            <Button variant="outline" className="w-full">
              contact@attendance-tracker.com
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Video className="h-5 w-5" />
              Video Tutorials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Watch tutorial videos
            </p>
            <Button variant="outline" className="w-full">
              View Tutorials
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Live Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Chat with our team
            </p>
            <Button className="w-full">Start Chat</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Check the current status of our services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="font-medium text-green-700">All Systems Operational</span>
              </div>
              <p className="text-sm text-green-600">Everything is running normally</p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="font-medium text-yellow-700">Partial Degradation</span>
              </div>
              <p className="text-sm text-yellow-600">Some features may be slow</p>
            </div>
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="font-medium text-red-700">Service Outage</span>
              </div>
              <p className="text-sm text-red-600">Service is currently down</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
