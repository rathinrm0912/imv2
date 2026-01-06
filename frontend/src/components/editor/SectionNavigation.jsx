import React from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { ChevronRight } from 'lucide-react';

const SectionNavigation = ({ sections, activeSection, onSectionClick }) => {
  return (
    <div className="w-64 border-r border-border bg-card h-full">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg">Contents</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="p-2">
          {sections.map((section) => (
            <button
              key={section.section_id}
              onClick={() => onSectionClick(section.section_id)}
              className={`w-full text-left px-3 py-2 rounded-sm text-sm transition-colors mb-1 ${
                activeSection === section.section_id
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'hover:bg-muted'
              }`}
              data-testid={`nav-${section.section_id}`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs opacity-70">{section.section_number}</span>
                <span className="flex-1 truncate">{section.title}</span>
                {activeSection === section.section_id && <ChevronRight size={14} />}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SectionNavigation;