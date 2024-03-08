import { GRIDSTACK_REFS } from "@/globals/GRID";

export type GridItemProps = React.HTMLAttributes<HTMLDivElement>;
export const GridItem = (item: {id: string}) => {
  const grid = GRIDSTACK_REFS.grid;
  
  
  return <div className="flex rounded-md border-2 border-black items-center justify-center text-3xl text-black font-bold cursor-pointer bg-emerald-600">
      {item.id}
    </div>
};
