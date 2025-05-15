import { getAllProfessors } from '@/lib/data'; // Updated to use Firestore version
import { ProfessorSearch } from '@/components/professor-search';
import { Search, GraduationCap } from 'lucide-react'; // Import icons used in the hero section

// Removed Suspense and Skeleton imports as data is fetched directly now.

// The ProfessorList and ProfessorListSkeleton components are moved to ProfessorSearch client component.

export default async function Home() {
  // Fetch professors on the server using the Firestore implementation
  const professors = await getAllProfessors();

  return (
    <div className="space-y-8">
      <section className="text-center py-10 md:py-16 bg-gradient-to-br from-primary/10 via-background to-accent/10 rounded-lg shadow-inner border border-border/30">
        <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4 opacity-80" />
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-primary mb-3">
          Find & Rate Your Professors
        </h1>
        <p className="text-md sm:text-lg text-muted-foreground mb-6 max-w-xl md:max-w-2xl mx-auto px-4">
          Make informed course decisions by reading reviews from fellow students. Share your own experiences to help others!
        </p>
        {/* Search input is now part of the ProfessorSearch component below */}
      </section>

      <section>
        {/* Render the client component responsible for search and display */}
        {/* Pass the fetched professors from Firestore */}
        <ProfessorSearch initialProfessors={professors} />
      </section>
    </div>
  );
}
