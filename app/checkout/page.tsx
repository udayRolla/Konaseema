import dynamic from "next/dynamic";

const CheckoutClient = dynamic(() => import("./CheckoutClient"), { ssr: false });

export default function Page() {
  return <CheckoutClient />;
}
