export type GridItemProps = React.HTMLAttributes<HTMLDivElement>;
export const GridItem = (item: { id: string }) => {
  return (
    <div
      gs-label="item"
      className="flex rounded-md border-2 border-black items-center justify-center text-3xl text-black font-bold cursor-pointer bg-emerald-600"
    >
      {item.id}
    </div>
  );
};
