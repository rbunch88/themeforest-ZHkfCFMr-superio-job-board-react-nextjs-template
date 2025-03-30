import dynamic from "next/dynamic";
import Cart from "@/components/shop/cart";

export const metadata = {
  title: "Shopping Cart | My ABA Jobs",
  description: "Review your selected job posting packages before proceeding to checkout on My ABA Jobs.",
};

const index = () => {
  return (
    <>
      <Cart />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
