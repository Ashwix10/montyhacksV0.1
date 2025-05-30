import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Maximize2, Minimize2, Move, Copy } from 'lucide-react';

interface ExpandableModalProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isExpanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  onClose?: () => void;
  className?: string;
  defaultPosition?: { x: number; y: number };
  zIndex?: number;
}

export function ExpandableModal({
  title,
  icon,
  children,
  isExpanded = false,
  onExpandChange,
  onClose,
  className = '',
  defaultPosition = { x: 100, y: 100 },
  zIndex = 50
}: ExpandableModalProps) {
  const [position, setPosition] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('drag-handle')) {
      setIsDragging(true);
      const rect = modalRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && isExpanded) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, isExpanded]);

  if (!isExpanded) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none"
      style={{ zIndex }}
    >
      <div
        ref={modalRef}
        className={`absolute pointer-events-auto transition-all duration-300 ${className}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '800px',
          height: '600px',
          maxWidth: '90vw',
          maxHeight: '90vh'
        }}
      >
        <Card className="glass-morphism border-0 shadow-2xl h-full flex flex-col">
          <CardHeader 
            className="pb-3 cursor-move drag-handle border-b border-border/50"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-3">
                {icon && <div className="text-primary">{icon}</div>}
                <span>{title}</span>
                <Move className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onExpandChange?.(false)}
                  className="h-8 w-8 p-0"
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface ExpandableCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  expandable?: boolean;
}

export function ExpandableCard({
  title,
  icon,
  children,
  className = '',
  expandable = true
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <Card className={`glass-morphism border-0 ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3">
              {icon && <div className="text-primary">{icon}</div>}
              <span>{title}</span>
            </CardTitle>
            
            {expandable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="h-8 w-8 p-0"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {children}
        </CardContent>
      </Card>

      <ExpandableModal
        title={title}
        icon={icon}
        isExpanded={isExpanded}
        onExpandChange={setIsExpanded}
        onClose={() => setIsExpanded(false)}
      >
        <div className="p-6 h-full overflow-auto">
          {children}
        </div>
      </ExpandableModal>
    </>
  );
}