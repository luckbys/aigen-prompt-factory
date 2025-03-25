import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MenuIcon, PanelLeftOpen, PanelRightOpen, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  progress?: number;
}

interface LayoutState {
  leftSize: number;
  rightSize: number;
  leftCollapsed: boolean;
  rightCollapsed: boolean;
}

const defaultState: LayoutState = {
  leftSize: 25,
  rightSize: 25,
  leftCollapsed: false,
  rightCollapsed: false,
};

const Layout = React.forwardRef<HTMLDivElement, LayoutProps>(
  ({ className, children, leftPanel, rightPanel, progress, ...props }, ref) => {
    const [showLeftDrawer, setShowLeftDrawer] = useState(false);
    const [showRightDrawer, setShowRightDrawer] = useState(false);
    const [state, setState] = useState<LayoutState>(() => {
      const saved = localStorage.getItem("layout-state");
      return saved ? JSON.parse(saved) : defaultState;
    });
    const [isResizing, setIsResizing] = useState(false);

    // Persistir estado do layout
    useEffect(() => {
      localStorage.setItem("layout-state", JSON.stringify(state));
    }, [state]);

    const handlePanelResize = (sizes: number[]) => {
      if (!isResizing) {
        setIsResizing(true);
      }
      
      setState(prev => ({
        ...prev,
        leftSize: sizes[0],
        rightSize: sizes[2],
      }));
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
    };

    const toggleLeftPanel = () => {
      setState(prev => ({
        ...prev,
        leftCollapsed: !prev.leftCollapsed,
      }));
    };

    const toggleRightPanel = () => {
      setState(prev => ({
        ...prev,
        rightCollapsed: !prev.rightCollapsed,
      }));
    };

    return (
      <div ref={ref} className={cn("h-screen flex flex-col", className)} {...props}>
        {/* Barra superior móvel com animações e progresso */}
        <div className="lg:hidden flex flex-col">
          <div className="flex items-center justify-between p-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Sheet open={showLeftDrawer} onOpenChange={setShowLeftDrawer}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="transition-transform active:scale-95"
                >
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="left" 
                className="w-[300px] sm:w-[400px] transition-transform"
              >
                <SheetHeader className="border-b pb-4">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <ScrollArea className="flex-1 h-[calc(100vh-8rem)] px-1">
                  {leftPanel}
                </ScrollArea>
                <SheetFooter className="border-t pt-4">
                  <Button variant="outline" onClick={() => setShowLeftDrawer(false)}>
                    Fechar
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              {typeof progress === 'number' && (
                <div className="text-xs text-muted-foreground">
                  {Math.round(progress)}% completo
                </div>
              )}
              <Sheet open={showRightDrawer} onOpenChange={setShowRightDrawer}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="transition-transform active:scale-95"
                  >
                    <PanelRightOpen className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent 
                  side="right" 
                  className="w-[300px] sm:w-[400px] transition-transform"
                >
                  <SheetHeader className="border-b pb-4">
                    <SheetTitle>Visualização</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="flex-1 h-[calc(100vh-8rem)] px-1">
                    {rightPanel}
                  </ScrollArea>
                  <SheetFooter className="border-t pt-4">
                    <Button variant="outline" onClick={() => setShowRightDrawer(false)}>
                      Fechar
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Barra de progresso */}
          {typeof progress === 'number' && (
            <div className="h-1 bg-muted w-full">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Layout desktop com painéis redimensionáveis e animações */}
        <div className="hidden lg:flex h-full">
          {typeof progress === 'number' && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-muted z-50">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          <ResizablePanelGroup
            direction="horizontal"
            className="min-h-screen transition-all duration-300 ease-in-out"
            onLayout={handlePanelResize}
          >
            <ResizablePanel
              defaultSize={state.leftSize}
              minSize={15}
              maxSize={40}
              className={cn(
                "transition-all duration-300",
                isResizing && "select-none",
                state.leftCollapsed && "!w-[4%] !min-w-[4%] !max-w-[4%]"
              )}
            >
              <div className="h-full p-3 relative">
                <ScrollArea className={cn(
                  "h-[calc(100vh-2rem)]",
                  state.leftCollapsed && "opacity-0"
                )}>
                  {leftPanel}
                </ScrollArea>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute bottom-2 right-2 h-8 w-8 rounded-full opacity-70 hover:opacity-100"
                        onClick={toggleLeftPanel}
                      >
                        {state.leftCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {state.leftCollapsed ? "Expandir painel" : "Recolher painel"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel 
              defaultSize={100 - state.leftSize - state.rightSize}
              className={cn(
                "transition-all duration-300",
                isResizing && "select-none"
              )}
            >
              <ScrollArea className="h-screen">
                <div className="p-3">
                  {children}
                </div>
              </ScrollArea>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel
              defaultSize={state.rightSize}
              minSize={15}
              maxSize={40}
              className={cn(
                "transition-all duration-300",
                isResizing && "select-none",
                state.rightCollapsed && "!w-[4%] !min-w-[4%] !max-w-[4%]"
              )}
            >
              <div className="h-full p-4 relative">
                <ScrollArea className={cn(
                  "h-[calc(100vh-2rem)]",
                  state.rightCollapsed && "opacity-0"
                )}>
                  {rightPanel}
                </ScrollArea>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute bottom-2 left-2 h-8 w-8 rounded-full opacity-70 hover:opacity-100"
                        onClick={toggleRightPanel}
                      >
                        {state.rightCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      {state.rightCollapsed ? "Expandir painel" : "Recolher painel"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Conteúdo principal para mobile com animações */}
        <div className="lg:hidden flex-1 overflow-hidden">
          <ScrollArea 
            className="h-full transition-all duration-300 ease-in-out"
          >
            <div className="p-4">
              {children}
            </div>
          </ScrollArea>
        </div>

        {/* Navegação rápida mobile */}
        <div className="lg:hidden fixed bottom-4 right-4 flex flex-col gap-2">
          {showLeftDrawer || showRightDrawer ? null : (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-10 w-10 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => setShowLeftDrawer(true)}
                    >
                      <MenuIcon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">Abrir menu</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-10 w-10 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => setShowRightDrawer(true)}
                    >
                      <PanelRightOpen className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">Abrir visualização</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </div>
    );
  }
);

Layout.displayName = "Layout";

export default Layout; 