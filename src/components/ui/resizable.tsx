// src/components/ui/resizable.tsx
import React from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

interface ResizableGroupProps {
  direction?: "horizontal" | "vertical";
  children: React.ReactNode;
}

export const ResizablePanelGroup: React.FC<ResizableGroupProps> = ({
  direction = "horizontal",
  children,
}) => <PanelGroup direction={direction}>{children}</PanelGroup>;

export const ResizablePanel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Panel>{children}</Panel>
);

export const ResizableHandle: React.FC = () => (
  <PanelResizeHandle className="bg-border w-1 cursor-col-resize" />
);
