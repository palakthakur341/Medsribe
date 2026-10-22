"use client";

import React, { useMemo, useCallback } from "react";
import { FixedSizeList as List, VariableSizeList } from "react-window";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number | ((index: number) => number);
  renderItem: (props: { item: T; index: number; style: React.CSSProperties }) => React.ReactNode;
  className?: string;
  overscan?: number;
  isLoading?: boolean;
  loadingItemCount?: number;
  emptyState?: React.ReactNode;
  onScroll?: (scrollTop: number) => void;
}

export function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className,
  overscan = 5,
  isLoading = false,
  loadingItemCount = 10,
  emptyState,
  onScroll,
}: VirtualizedListProps<T>) {
  const isVariableHeight = typeof itemHeight === "function";

  const ItemRenderer = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      if (isLoading) {
        return (
          <div style={style} className="p-2">
            <Skeleton className="h-16 w-full" />
          </div>
        );
      }

      const item = items[index];
      if (!item) return null;

      return renderItem({ item, index, style });
    },
    [items, renderItem, isLoading]
  );

  const handleScroll = useCallback(
    ({ scrollTop }: { scrollTop: number }) => {
      onScroll?.(scrollTop);
    },
    [onScroll]
  );

  if (!isLoading && items.length === 0) {
    return (
      <div className={cn("flex items-center justify-center", className)} style={{ height }}>
        {emptyState || <div className="text-muted-foreground">No items to display</div>}
      </div>
    );
  }

  const itemCount = isLoading ? loadingItemCount : items.length;

  return (
    <div className={cn("", className)}>
      {isVariableHeight ? (
        <VariableSizeList
          height={height}
          itemCount={itemCount}
          itemSize={itemHeight as (index: number) => number}
          overscanCount={overscan}
          onScroll={handleScroll}
        >
          {ItemRenderer}
        </VariableSizeList>
      ) : (
        <List
          height={height}
          itemCount={itemCount}
          itemSize={itemHeight as number}
          overscanCount={overscan}
          onScroll={handleScroll}
        >
          {ItemRenderer}
        </List>
      )}
    </div>
  );
}

// Memoized list item wrapper
export const MemoizedListItem = React.memo<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}>(({ children, className, style }) => (
  <div className={className} style={style}>
    {children}
  </div>
));

MemoizedListItem.displayName = "MemoizedListItem";

// Hook for optimized list rendering
export function useVirtualizedList<T>(
  items: T[],
  options: {
    itemHeight: number | ((index: number) => number);
    containerHeight: number;
    overscan?: number;
    dependencies?: React.DependencyList;
  }
) {
  const { itemHeight, containerHeight, overscan = 5, dependencies = [] } = options;

  const memoizedItems = useMemo(() => items, dependencies);

  const renderVirtualizedList = useCallback(
    (renderItem: VirtualizedListProps<T>["renderItem"]) => (
      <VirtualizedList
        items={memoizedItems}
        height={containerHeight}
        itemHeight={itemHeight}
        renderItem={renderItem}
        overscan={overscan}
      />
    ),
    [memoizedItems, containerHeight, itemHeight, overscan]
  );

  return {
    items: memoizedItems,
    renderVirtualizedList,
  };
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCount = React.useRef(0);
  const lastRenderTime = React.useRef(Date.now());

  React.useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    if (process.env.NODE_ENV === "development") {
      console.log(`${componentName} render #${renderCount.current}, time since last: ${timeSinceLastRender}ms`);
    }
  });

  return {
    renderCount: renderCount.current,
  };
}

// Optimized scroll container
export const OptimizedScrollArea = React.memo<{
  children: React.ReactNode;
  className?: string;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
}>(({ children, className, onScroll }) => {
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      onScroll?.(event);
    },
    [onScroll]
  );

  return (
    <ScrollArea className={className} onScroll={handleScroll}>
      {children}
    </ScrollArea>
  );
});

OptimizedScrollArea.displayName = "OptimizedScrollArea";

// Intersection observer hook for lazy loading
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, options]);

  return isIntersecting;
}

// Lazy loading wrapper component
export const LazyLoadWrapper = React.memo<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  rootMargin?: string;
}>(({ children, fallback, className, rootMargin = "50px" }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref, { rootMargin });

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : fallback || <Skeleton className="h-20 w-full" />}
    </div>
  );
});

LazyLoadWrapper.displayName = "LazyLoadWrapper";

// Debounced search hook
export function useDebouncedSearch(
  searchTerm: string,
  delay: number = 300
) {
  const [debouncedTerm, setDebouncedTerm] = React.useState(searchTerm);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);

  return debouncedTerm;
}

// Optimized filter hook
export function useOptimizedFilter<T>(
  items: T[],
  filterFn: (item: T) => boolean,
  dependencies: React.DependencyList = []
) {
  return useMemo(() => {
    return items.filter(filterFn);
  }, [items, ...dependencies]);
}

// Batch update hook for performance
export function useBatchedUpdates() {
  const [updates, setUpdates] = React.useState<(() => void)[]>([]);

  const batchUpdate = useCallback((updateFn: () => void) => {
    setUpdates(prev => [...prev, updateFn]);
  }, []);

  React.useEffect(() => {
    if (updates.length > 0) {
      const timeoutId = setTimeout(() => {
        React.unstable_batchedUpdates(() => {
          updates.forEach(update => update());
        });
        setUpdates([]);
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [updates]);

  return { batchUpdate };
}

export default VirtualizedList;
