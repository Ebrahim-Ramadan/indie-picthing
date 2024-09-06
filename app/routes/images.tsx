import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { Transition } from "@headlessui/react";
import { Menu, Plus, X } from "lucide-react";

import { getImageListItems } from "~/models/image.server";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const imagesList = await getImageListItems({ userId });
  console.log('imagesList', imagesList);
  
  return json({ imagesList });
};

export default function ImagesPage() {
  const data = useLoaderData<typeof loader>();
  const user = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-full min-h-screen flex-col bg-black text-white">
      <header className="flex items-center justify-between  p-4 ">
        <div className="flex items-center">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="mr-4  focus:outline-none"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Menu size={24} />
          </button>
          <h1 className="text-3xl font-bold">
            <Link to=".">Images</Link>
          </h1>
        </div>
        <div className="flex items-center">
          <p className="mr-4">{user.email}</p>
          <Form action="/logout" method="post">
            <button
              type="submit"
              className="rounded bg-slate-600 px-4 py-2 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
            >
              Logout
            </button>
          </Form>
        </div>
      </header>

      <main className="flex h-full bg-black ">
        
        {isSidebarOpen&& 
        <Transition
        show={isSidebarOpen}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 -translate-x-full"
        enterTo="opacity-100 translate-x-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-x-0"
        leaveTo="opacity-0 -translate-x-full"
        className="fixed inset-y-0 left-0 z-30 w-80 bg-black overflow-y-auto border-r transform"
      >
        <div className="p-4">
        <button
        // className="self-end w-full"
          onClick={() => setIsSidebarOpen(false)}
>
<X color="white" size={24} />
</button>
          <Link to="new" className="flex px-4 py-2 flex-row items-center text-white bg-blue-600 rounded-full w-full justify-center">
            <Plus/>
            Add
          </Link>

          <hr className="my-4" />

          {data.imagesList.length === 0 ? (
            <p className="p-4">No images yet</p>
          ) : (
            <ol>
              {data.imagesList.map((img) => (
                <li key={img.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block p-4 text-xl ${isActive ? "bg-blue-300" : ""}`
                    }
                    to={img.id}
                  >
                    <img
                      src={img.originalUrl}
                      alt={`Image ${img.id}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>
      </Transition>
        }

        <div className={`flex-1 p-6 ${isSidebarOpen ? 'ml-80' : ''}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}