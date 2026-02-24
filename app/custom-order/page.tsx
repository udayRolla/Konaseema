import dynamic from "next/dynamic";

const CustomOrderClient = dynamic(() => import("./CustomOrderClient"), {
  ssr: false,
});

export default function Page() {
  return <CustomOrderClient />;
}
