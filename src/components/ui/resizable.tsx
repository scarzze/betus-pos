// src/components/ui/resizable.tsx
import React from "react";
import { Group, Panel, Separator } from "react-resizable-panels";

interface ResizableGroupProps {
  direction?: "horizontal" | "vertical";
  children: React.ReactNode;
}

export const ResizablePanelGroup: React.FC<ResizableGroupProps> = ({
  direction = "horizontal",
  children,
}) => <Group orientation={direction}>{children}</Group>;

export const ResizablePanel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Panel>{children}</Panel>
);

export const ResizableHandle: React.FC = () => (
  <Separator className="bg-border w-1 cursor-col-resize" />
);
