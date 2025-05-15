'use client';

import * as React from 'react';
import type { Professor } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { ProfessorCard } from '@/components/professor-card';
import { Search, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfessorSearchProps {
  initialProfessors: Professor[];
}

function ProfessorListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {[...Array(8)].map((_, i) => (
        <Skeleton key={i} className="h-[280px] w-full rounded-lg" />
      ))}
    </div>
  );
}


export function ProfessorSearch({ initialProfessors }: ProfessorSearchProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filteredProfessors, setFilteredProfessors] = React.useState<Professor[]>(initialProfessors);
  const [isLoading, setIsLoading] = React.useState(false); // Basic loading state for feedback

  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => { // Debounce filtering slightly
        const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
        if (lowerCaseSearchTerm === '') {
            setFilteredProfessors(initialProfessors);
        } else {
            const filtered = initialProfessors.filter(professor =>
            professor.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            professor.department.toLowerCase().includes(lowerCaseSearchTerm) ||
            professor.courseCode.toLowerCase().includes(lowerCaseSearchTerm)
            );
            setFilteredProfessors(filtered);
        }
        setIsLoading(false);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer); // Cleanup timer on unmount or term change
  }, [searchTerm, initialProfessors]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="space-y-6">
      {/* Search Input Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 border-b border-primary/30 pb-2 flex items-center gap-2">
            <Search className="h-5 w-5 text-primary"/>
            Browse Professors
        </h2>
        <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
            type="search"
            placeholder="Search by name, department, or course code..."
            className="pl-10 w-full rounded-full shadow-sm focus-visible:ring-primary/50"
            value={searchTerm}
            onChange={handleSearchChange}
            aria-label="Search Professors"
            />
        </div>
      </div>


      {/* Professor List Display */}
      <div>
         {isLoading ? (
             <ProfessorListSkeleton />
         ) : filteredProfessors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredProfessors.map((professor) => (
                <ProfessorCard key={professor.id} professor={professor} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 px-4 border border-dashed rounded-lg bg-card/50">
                <Info className="h-8 w-8 text-muted-foreground mx-auto mb-3"/>
                <p className="text-muted-foreground">
                  No professors found matching "{searchTerm}".
                </p>
                <p className="text-sm text-muted-foreground/80 mt-1">
                   Try broadening your search terms.
                </p>
            </div>
          )}
      </div>
    </div>
  );
}
