'use client';

import { cn } from "@/utils/cn";
import { GridStack, GridStackNode, GridStackOptions } from "gridstack";
import "gridstack/dist/gridstack.css";
import React, { Children, HTMLAttributes, ReactElement, RefObject, createRef, memo, useLayoutEffect, useRef, useState } from "react"

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
  | "children"
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
  children?: Array<ReactElement<HTMLDivElement>>;
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

  if (refs.current && children && Object.keys(refs.current).length !== children.length) {
    children.forEach((child) => {
      const key = getChildKey(child)
      refs.current[key] = refs.current[key] ?? createRef()
    })
  }

  useLayoutEffect(() => {
    // @ts-expect-error overwrite gridRef according to gridstack demo: https://github.com/gridstack/gridstack.js/blob/fba00d67bf30fbb69e3dc2f41e46d2f34203ea2d/demo/react-hooks.html
    gridRef.current = (gridRef.current ??
      GridStack.init(options))
    const grid = gridRef.current

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
    children?.forEach((child) => {
      const key = getChildKey(child)
      const childElement = refs.current[key].current;
      if (!childElement) return;
      grid.makeWidget(childElement)
    })
    grid.batchUpdate(false)

    return () => {
      grid.offAll();
    }
  }, [children, onAdd, onChange, onDisable, onDrag, onDragStart, onDragStop, onDrop, onEnable, onRemove, onResize, onResizeContent, onResizeStart, onResizeStop, options])

  if (refs.current === null) return null;

  return (
    <div {...props} className={cn(GRID_CLASS, className)}>
      {Children.map(children, (child) => {
        if (child === undefined) return;
        const key = getChildKey(child)
        return (
          <div ref={refs.current[key]} key={key} className={GRID_ITEM_CLASS}>
            <child.type key={child.key} {...child.props} className={cn(GRID_ITEM_CONTENT_CLASS, child.props.className)} />
          </div>
        )
      })}
    </div>
  )

  function getChildKey(child: ReactElement<HTMLElement>) {
    if (child.key === null) throw new Error('Grid item must have a unique key')
    return child.key
  }
});
Grid.displayName = 'Grid';

const ControlledExample = () => {
  const [items, setItems] = useState([{ id: 'item-1' }, { id: 'item-2' }, { id: 'item-3' }, { id: 'item-4' }])
  return (
    <Grid className="bg-green-600" options={{ margin: 8, column: 12 }}>
      {items.map((item) => (
        <div key={item.id} className="flex rounded-md border-2 border-black items-center justify-center text-3xl text-black font-bold cursor-pointer bg-emerald-600">
          {item.id}
        </div>)
      )}
    </Grid>
  )
}

export default ControlledExample