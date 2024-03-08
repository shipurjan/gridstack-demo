'use client';

import { cn } from "@/utils/cn";
import { GridStack, GridStackNode, GridStackOptions } from "gridstack";
import "gridstack/dist/gridstack.css";
import React, { Children, HTMLAttributes, ReactElement, RefObject, createRef, memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { GridItem } from "./GridItem";
import { GRIDSTACK_REFS } from "@/globals/GRID";

function hasKey(child: any): child is { key: string } {
  return Object.prototype.hasOwnProperty.call(child, "key")
}

const GRID_CLASS = 'grid-stack'
const GRID_ITEM_CLASS = 'grid-stack-item'
const GRID_ITEM_CONTENT_CLASS = 'grid-stack-item-content'

export type GridEventCallback = (e: Event, items: GridStackNode[]) => void;
export type GridProps = Omit<HTMLAttributes<HTMLDivElement>,
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
}
export const Grid = memo(({ 
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
  options, children, className, ...props }: GridProps) => {
  const refs = useRef<Record<string, RefObject<HTMLDivElement>>>({});
  const gridRef = useRef<GridStack>(null)

  const getChildKey = useCallback((child: (
      string | number | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | React.PromiseLikeOfReactNode
    )) => {
      if (hasKey(child) && child.key !== null) return child.key
      throw new Error('Grid item must have a unique key')
  }, [])
  
  const childrenArray = Children.toArray(children)

  if (refs.current && childrenArray && Object.keys(refs.current).length !== childrenArray.length) {
    childrenArray.forEach((child) => {
      const key = getChildKey(child)
      refs.current[key] = refs.current[key] ?? createRef()
    })
  }
  
  useLayoutEffect(() => {
    // @ts-expect-error overwrite gridRef according to gridstack demo: https://github.com/gridstack/gridstack.js/blob/fba00d67bf30fbb69e3dc2f41e46d2f34203ea2d/demo/react-hooks.html
    gridRef.current = (gridRef.current ??
      GridStack.init(options))
    const grid = gridRef.current
    // Update global grid reference
    GRIDSTACK_REFS.grid = grid

    // add event listeners
    if (onAdd) grid.on('added', onAdd)
    if (onRemove) grid.on('removed', onRemove)
    if (onChange) grid.on('change', onChange)
    if (onResize) grid.on('resize', onResize)
    if (onResizeStart) grid.on('resizestart', onResizeStart)
    if (onResizeStop) grid.on('resizestop', onResizeStop)
    if (onResizeContent) grid.on('resizecontent', onResizeContent)
    if (onDisable) grid.on('disable', onDisable)
    if (onEnable) grid.on('enable', onEnable)
    if (onDrag) grid.on('drag', onDrag)
    if (onDragStart) grid.on('dragstart', onDragStart)
    if (onDragStop) grid.on('dragstop', onDragStop)
    if (onDrop) grid.on('dropped', onDrop)

    grid.batchUpdate()
    grid.removeAll(false)
    childrenArray?.forEach((child) => {
      const key = getChildKey(child)
      const childElement = refs.current[key].current;
      if (!childElement) return;
      grid.makeWidget(childElement)
    })
    grid.batchUpdate(false)

    return () => {
      grid.offAll();
    }
  }, [childrenArray, getChildKey, onAdd, onChange, onDisable, onDrag, onDragStart, onDragStop, onDrop, onEnable, onRemove, onResize, onResizeContent, onResizeStart, onResizeStop, options])


  if (childrenArray === undefined) return null;
  if (refs.current === null) return null;

  return (
      <div {...props} className={cn(GRID_CLASS, className)}>
        {Children.map(childrenArray, (child) => {
          if (child === undefined) return;
          const key = getChildKey(child)
          return (
            <div ref={refs.current[key]} key={key} className={GRID_ITEM_CLASS}>
              <div className={cn(GRID_ITEM_CONTENT_CLASS, "[&>*]:w-full [&>*]:h-full")}>
                {child}
              </div>
            </div>
          )
        })}
      </div>
  )

});
Grid.displayName = 'Grid';

const ControlledExample = () => {
  const [items,setItems] = useState([{ id: 'item-1' }, { id: 'item-2' }, { id: 'item-3' }, { id: 'item-4' }])
  
  return (
    <Grid className="bg-green-600" options={{ margin: 8, column: 12 }}>
    {items.map(item =><GridItem key={item.id} id={item.id} />)}
    </Grid>
  )
}

export default ControlledExample