// src/components/ui/resizable.tsx
import React from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

interface ResizablePanelGroupProps {
  direction?: "horizontal" | "vertical";
  children: React.ReactNode;
}

export const ResizablePanelGroup: React.FC<ResizablePanelGroupProps> = ({ direction = "horizontal", children }) => (
  <PanelGroup direction={direction}>{children}</PanelGroup>
);

export const ResizablePanel: React.FC<{ children: React.ReactNode }> = ({ children }) => <Panel>{children}</Panel>;

export const ResizableHandle: React.FC<{ withHandle?: boolean }> = ({ withHandle = true }) =>
  withHandle ? <PanelResizeHandle className="bg-border w-1 cursor-col-resize" /> : null;
