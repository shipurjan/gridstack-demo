import { GridStack } from "gridstack";

export type GlobalGridstackRefs = {
    grid: GridStack | null;
};

export const GRIDSTACK_REFS: GlobalGridstackRefs = {
    grid: null
}