import dynamic from "next/dynamic";
const ControlledExample = dynamic(() => import("@/components/Grid"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="flex flex-col w-full h-full">
      <ControlledExample />
    </main>
  );
}
