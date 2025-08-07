// Scroll position management utility
// Stores scroll positions for different pages and restores them when navigating back

interface ScrollPosition {
  x: number;
  y: number;
  timestamp: number;
}

class ScrollPositionManager {
  private positions: Map<string, ScrollPosition> = new Map();
  private readonly STORAGE_KEY = 'skinvault_scroll_positions';
  private readonly MAX_AGE = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.loadFromStorage();
  }

  // Save scroll position for a specific page
  savePosition(path: string, x: number, y: number): void {
    const position: ScrollPosition = {
      x,
      y,
      timestamp: Date.now()
    };
    
    console.log(`Saving scroll position for ${path}:`, position);
    this.positions.set(path, position);
    this.saveToStorage();
  }

  // Get scroll position for a specific page
  getPosition(path: string): ScrollPosition | null {
    const position = this.positions.get(path);
    
    if (!position) return null;
    
    // Check if position is too old
    if (Date.now() - position.timestamp > this.MAX_AGE) {
      this.positions.delete(path);
      this.saveToStorage();
      return null;
    }
    
    return position;
  }

  // Clear scroll position for a specific page
  clearPosition(path: string): void {
    this.positions.delete(path);
    this.saveToStorage();
  }

  // Clear all scroll positions
  clearAll(): void {
    this.positions.clear();
    this.saveToStorage();
  }

  // Restore scroll position for a page
  restorePosition(path: string): boolean {
    const position = this.getPosition(path);
    if (position) {
      console.log(`Restoring scroll position for ${path}:`, position);
      
      // Wait for DOM to be stable
      const waitForStableDOM = () => {
        return new Promise<void>((resolve) => {
          let lastHeight = document.body.scrollHeight;
          let stableCount = 0;
          
          const checkStability = () => {
            const currentHeight = document.body.scrollHeight;
            if (currentHeight === lastHeight) {
              stableCount++;
              if (stableCount >= 3) {
                resolve();
                return;
              }
            } else {
              stableCount = 0;
              lastHeight = currentHeight;
            }
            setTimeout(checkStability, 100);
          };
          
          checkStability();
        });
      };
      
      // Use multiple attempts to ensure scroll position is set correctly
      const attemptScroll = async (attempts = 0) => {
        if (attempts >= 5) {
          console.log('Max scroll restoration attempts reached');
          return;
        }
        
        // Wait for DOM to be stable
        await waitForStableDOM();
        
        setTimeout(() => {
          const currentScrollY = window.scrollY;
          window.scrollTo({
            left: position.x,
            top: position.y,
            behavior: 'instant'
          });
          
          // Check if scroll position was set correctly
          setTimeout(() => {
            const newScrollY = window.scrollY;
            console.log(`Scroll attempt ${attempts + 1}:`, { 
              target: position.y, 
              current: newScrollY, 
              previous: currentScrollY 
            });
            
            // If scroll position is still not correct, try again
            if (Math.abs(newScrollY - position.y) > 10) {
              attemptScroll(attempts + 1);
            } else {
              console.log(`Successfully scrolled to position:`, { x: position.x, y: position.y });
            }
          }, 100);
        }, 100 * (attempts + 1));
      };
      
      attemptScroll();
      return true;
    }
    console.log(`No saved position found for ${path}`);
    return false;
  }

  // Save current scroll position for the current page
  saveCurrentPosition(): void {
    const path = window.location.pathname;
    this.savePosition(path, window.scrollX, window.scrollY);
  }

  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.positions);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save scroll positions to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.positions = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.warn('Failed to load scroll positions from localStorage:', error);
      this.positions = new Map();
    }
  }
}

// Create a singleton instance
export const scrollPositionManager = new ScrollPositionManager();

// Hook to manage scroll position for a component
export const useScrollPosition = (path?: string) => {
  const currentPath = path || window.location.pathname;

  // Save position before unmounting
  const savePosition = () => {
    scrollPositionManager.saveCurrentPosition();
  };

  // Restore position on mount
  const restorePosition = () => {
    return scrollPositionManager.restorePosition(currentPath);
  };

  // Clear position (useful when navigating to a detail page)
  const clearPosition = () => {
    scrollPositionManager.clearPosition(currentPath);
  };

  return {
    savePosition,
    restorePosition,
    clearPosition
  };
}; 