"use client";

import { cn } from "@/utils/cn";
import {
  GridStack,
  GridStackNode,
  GridStackOptions,
  GridStackWidget,
} from "gridstack";
import "gridstack/dist/gridstack.css";
import { get } from "http";
import React, {
  HTMLAttributes,
  ReactNode,
  RefObject,
  createRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createRoot } from "react-dom/client";

const GRID_CLASS = "grid-stack";
const GRID_ITEM_CONTENT_CLASS = "grid-stack-item-content";
const NESTED_GRID_CLASS = "grid-stack";

export type GridItem = Omit<
  GridStackWidget,
  "content" | "id" | "subGridOpts"
> & {
  id: string;
  node?: ReactNode;
  subGridOpts?: Omit<GridStackOptions, "children"> & {
    children?: GridItem[];
  };
};

export type GridEventCallback = (e: Event, items: GridStackNode[]) => void;

export type GridProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | "onAdd"
  | "onRemove"
  | "onChange"
  | "onResize"
  | "onResizeStart"
  | "onResizeStop"
  | "onResizeContent"
  | "onDisable"
  | "onEnable"
  | "onDrag"
  | "onDragStart"
  | "onDragStop"
  | "onDrop"
> & {
  onAdd?: GridEventCallback;
  onRemove?: GridEventCallback;
  onChange?: GridEventCallback;
  onResize?: GridEventCallback;
  onResizeStart?: GridEventCallback;
  onResizeStop?: GridEventCallback;
  onResizeContent?: GridEventCallback;
  onDisable?: GridEventCallback;
  onEnable?: GridEventCallback;
  onDrag?: GridEventCallback;
  onDragStart?: GridEventCallback;
  onDragStop?: GridEventCallback;
  onDrop?: GridEventCallback;
  options?: GridStackOptions;
  items?: GridItem[];
};
const Grid = forwardRef<GridStack, GridProps>(
  (
    {
      onAdd,
      onRemove,
      onChange,
      onResize,
      onResizeStart,
      onResizeStop,
      onResizeContent,
      onDisable,
      onEnable,
      onDrag,
      onDragStart,
      onDragStop,
      onDrop,
      options,
      items,
      className,
      ...props
    },
    ref,
  ) => {
    const gridstackItems: GridStackWidget[] | undefined = items?.map(
      /**  filter away custom props from {@link GridItem} */
      ({ node, ...item }) => ({
        ...item,
      }),
    );

    const itemRefs = useRef<Record<string, Element>>({});
    const gridRef = useRef<GridStack>(null);

    useEffect(() => {
      console.log(itemRefs.current);
    }, []);

    useImperativeHandle(ref, () => gridRef.current!, []);

    useLayoutEffect(() => {
      // @ts-expect-error overwrite gridRef according to gridstack demo: https://github.com/gridstack/gridstack.js/blob/fba00d67bf30fbb69e3dc2f41e46d2f34203ea2d/demo/react-hooks.html
      gridRef.current = gridRef.current ?? GridStack.init(options);
      const grid = gridRef.current;

      // add event listeners
      if (onAdd) grid.on("added", onAdd);
      if (onRemove) grid.on("removed", onRemove);
      if (onChange) grid.on("change", onChange);
      if (onResize) grid.on("resize", onResize);
      if (onResizeStart) grid.on("resizestart", onResizeStart);
      if (onResizeStop) grid.on("resizestop", onResizeStop);
      if (onResizeContent) grid.on("resizecontent", onResizeContent);
      if (onDisable) grid.on("disable", onDisable);
      if (onEnable) grid.on("enable", onEnable);
      if (onDrag) grid.on("drag", onDrag);
      if (onDragStart) grid.on("dragstart", onDragStart);
      if (onDragStop) grid.on("dragstop", onDragStop);
      if (onDrop) grid.on("dropped", onDrop);

      // load updates the grid with the items by id or adds/removes them if not present
      grid.load(gridstackItems ?? []);

      if (items && Object.keys(itemRefs.current).length !== items.length) {
        items.forEach((item) => {
          // update ref
          itemRefs.current[item.id] =
            itemRefs.current[item.id] ??
            getElementByGridStackId(grid.el, item.id);

          const node = item.node;
          const children = item.subGridOpts?.children;

          if (
            node !== undefined &&
            children !== undefined &&
            children.length > 0
          ) {
            throw new Error(
              "Cannot have both a node and children - choose one",
            );
          }

          const itemElement = itemRefs.current[item.id];
          const itemContentElement = getItemContentElement(itemElement);

          // CASE #1: no children - render node
          if (item.node !== undefined) {
            renderNode(itemContentElement, item.node);
          }

          // CASE #2: children - render nodes in subgrid
          if (children !== undefined && children.length > 0) {
            const nestedGridElement = getNestedGridElement(itemContentElement);

            children.forEach((child) => {
              const nestedItemElement = getElementByGridStackId(
                nestedGridElement,
                child.id,
              );
              const nestedItemContentElement =
                getItemContentElement(nestedItemElement);

              renderNode(nestedItemContentElement, child.node);
            });
          }
        });
      }

      return () => {
        grid.offAll();
      };
    }, [
      gridstackItems,
      items,
      onAdd,
      onChange,
      onDisable,
      onDrag,
      onDragStart,
      onDragStop,
      onDrop,
      onEnable,
      onRemove,
      onResize,
      onResizeContent,
      onResizeStart,
      onResizeStop,
      options,
    ]);

    return <div {...props} className={cn(GRID_CLASS, className)} />;

    function renderNode(element: Element, node: ReactNode) {
      createRoot(element).render(node);
    }

    function getElementByGridStackId(element: Element, id: string) {
      const el = element.querySelector(`[gs-id="${id}"]`);
      if (el === null) {
        throw new Error(`Element with gs-id ${id} not found`);
      }
      return el;
    }

    function getItemContentElement(itemElement: Element) {
      const el = itemElement.querySelector(`.${GRID_ITEM_CONTENT_CLASS}`);
      if (el === null) {
        throw new Error(
          `Element with class ${GRID_ITEM_CONTENT_CLASS} not found`,
        );
      }
      return el;
    }

    function getNestedGridElement(itemContentElement: Element) {
      const el = itemContentElement.querySelector(`.${NESTED_GRID_CLASS}`);
      if (el === null) {
        throw new Error(`Element with class ${NESTED_GRID_CLASS} not found`);
      }
      return el;
    }
  },
);
Grid.displayName = "Grid";

const ControlledExample = () => {
  const [items, setItems] = useState<GridItem[]>([
    {
      id: "item-0",
      x: 0,
      y: 2,
      w: 2,
      h: 2,
    },
    {
      id: "item-1",
      x: 0,
      y: 2,
      w: 2,
      h: 2,
      node: (
        <button
          onClick={() => {
            console.log("hello from cell");
          }}
        >
          Click me
        </button>
      ),
    },
    {
      id: "item-2",
      x: 0,
      y: 0,
      w: 2,
      h: 2,
      subGridOpts: {
        children: [
          {
            id: "item-3",
            x: 0,
            y: 0,
            maxH: 12,
            w: 12,
            h: 12,
            node: (
              <button
                onClick={() => {
                  console.log("hello from nested cell");
                }}
              >
                Click me
              </button>
            ),
          },
        ],
      },
    },
  ]);

  const grid = useRef<GridStack>(null);

  return (
    <>
      <Grid
        ref={grid}
        className="bg-green-600"
        items={items}
        options={{
          margin: 8,
          column: 12,
        }}
      />
    </>
  );
};

export default ControlledExample;
