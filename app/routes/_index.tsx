import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

import { useOptionalUser } from "~/utils";

export const meta: MetaFunction = () => [{ title: "Remix Notes" }];

export default function Index() {
  const user = useOptionalUser();
  console.log('user', user);
  
  return (
    <main className="relative min-h-screen bg-black sm:flex sm:items-center sm:justify-center">
     ass
    </main>
  );
}
