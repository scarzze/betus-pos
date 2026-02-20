import { jsx as _jsx } from "react/jsx-runtime";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
export const ResizablePanelGroup = ({ direction = "horizontal", children, }) => {
    return _jsx(PanelGroup, { direction: direction, children: children });
};
export const ResizablePanel = ({ children }) => (_jsx(Panel, { children: children }));
export const ResizableHandle = () => (_jsx(PanelResizeHandle, { className: "bg-border w-1 cursor-col-resize" }));
