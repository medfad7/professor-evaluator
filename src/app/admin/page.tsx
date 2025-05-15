import { getAllProfessors } from '@/lib/data';
import { AddProfessorForm } from '@/components/admin/add-professor-form';
import { ProfessorAdminCard } from '@/components/admin/professor-admin-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UserPlus, ListChecks } from 'lucide-react';

export default async function AdminDashboardPage() {
  // Fetch professors server-side
  const professors = await getAllProfessors();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>

      {/* Add Professor Section */}
      <Card className="shadow-md border border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Add New Professor
          </CardTitle>
          <CardDescription>
            Enter the details for a new professor to add them to the database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddProfessorForm />
        </CardContent>
      </Card>

      <Separator />

      {/* Manage Professors Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
           <ListChecks className="h-6 w-6 text-primary" />
           Manage Professors ({professors.length})
        </h2>
        {professors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {professors.map((professor) => (
              <ProfessorAdminCard key={professor.id} professor={professor} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground italic">No professors found in the database.</p>
        )}
      </section>
    </div>
  );
}
