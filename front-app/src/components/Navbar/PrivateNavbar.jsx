// ! Comments are all listed below
// *** -> this component creates a responsive navigation bar. It uses Headless UI to handle the complex interactive behavior of a mobile menu and a desktop dropdown menu while providing accessibility features. Tailwind CSS is used extensively for styling the layout, appearance, and responsive behavior. It includes links for main navigation, buttons for actions like generating content and logging out, and a user profile area. The logout functionality is currently a placeholder.



// Fragment allows you to group multiple elements without adding an extra node to the DOM tree. It's useful for conditional rendering or when components like Transition require a single child element but you don't want an unnecessary div
import { Fragment } from "react";
/*
Disclosure: Used for creating the main navigation bar structure, particularly handling the open/close state of the mobile menu.
Menu: Used for creating the user profile dropdown menu on desktop.
Transition: Used to add animated transitions when the user dropdown menu opens and closes.



*/
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/20/solid";
import { FiLogOut } from "react-icons/fi";
import { FaCreativeCommonsShare } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { logoutAPI } from "../../apis/user/usersAPI";
import { useAuth } from "../../AuthContext/AuthContext";

const user = {
  name: "Tom Cook",
  email: "tom@example.com",
};
const navigation = [
  { name: "Dashboard", href: "/dashboard", current: true },
  { name: "Pricing", href: "/plans", current: true },
];
const userNavigation = [{ name: "Sign out", href: "#" }];


//  This is used to conditionally apply Tailwind classes based on state (like item.current or active state in Headless UI components).
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function PrivateNavbar() {
  // auth custom hook
  const {logout} = useAuth();
  // Mutation
    const mutation = useMutation({ mutationFn: logoutAPI });

  //handle logout
  const handleLogout = () => {
    mutation.mutate();
    logout();

  };

  return (
    <Disclosure as="nav" className="bg-gray-900">

      {/* This is a render prop from Headless UI. The function receives an object { open } where open is a boolean indicating if the Disclosure panel (the mobile menu) is currently open. The component's children use this open state to conditionally render elements (like switching between the hamburger and close icons). */}
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="-ml-2 mr-2 flex items-center md:hidden">
                  {/* Mobile menu button */}
                  {/* It contains the Disclosure.Button.
Disclosure.Button: This button controls the open state of the Disclosure. Clicking it toggles the mobile menu panel. */}
                  <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                <div className="flex flex-shrink-0 items-center">
                  {/* logo */}
                  <Link to="/" className="text-white">
                    <FaCreativeCommonsShare className="h-10 w-10" />
                  </Link>
                </div>

                {/*  This div is hidden on small screens (hidden) and displayed as a flex container on medium screens and larger (md:flex). It contains the main navigation links.
It maps over the navigation array.
Each item is rendered as a Link component. */}
                <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        item.current
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white",
                        "rounded-md px-3 py-2 text-sm font-medium"
                      )}
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Link
                    to="/generate-content"
                    className="relative animate-bounce inline-flex items-center gap-x-1.5 rounded-md bg-purple-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  >
                    <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                    Generate content
                  </Link>

                  <button
                    onClick={handleLogout}
                    type="button"
                    className="ml-2 relative inline-flex items-center gap-x-1.5 rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  >
                    <FiLogOut className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                <div className="hidden md:ml-4 md:flex md:flex-shrink-0 md:items-center">
                  <Menu as="div" className="relative ml-3">
                    {/* Wraps the dropdown items to apply transition animations (fade in/out and slight scale change). as={Fragment} is used to apply the transition directly to the Menu.Items without an extra wrapper div. */}
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      {/* The panel containing the dropdown menu items. It's absolutely positioned (absolute) to appear below the user avatar/button, styled with background, shadow, border, z-index (z-10), etc.
It maps over the userNavigation array.
Each item is a Menu.Item. */}
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {userNavigation.map((item) => (
                          <Menu.Item key={item.name}>
                            {/* Another render prop from Headless UI, providing the active state for the current menu item (e.g., when hovered or focused with the keyboard).
The menu item itself is rendered as an <a> tag. The className uses classNames to apply a background color (bg-gray-100) when the item is active. */}
                            {({ active }) => (
                              <a
                                href={item.href}
                                className={classNames(
                                  active ? "bg-gray-100" : "",
                                  "block px-4 py-2 text-sm text-gray-700"
                                )}
                              >
                                {item.name}
                              </a>
                            )}
                          </Menu.Item>
                        ))}
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>
          </div>

{/* This section is the content that is shown when the mobile menu button is clicked (open is true) and is hidden on medium screens and above (md:hidden). */}
          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    "block rounded-md px-3 py-2 text-base font-medium"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            <div className="border-t border-gray-700 pb-3 pt-4">
              <div className="flex items-center px-5 sm:px-6">
                <div className="ml-3">
                  <div className="text-base font-medium text-white">
                    {user.name}
                  </div>
                  <div className="text-sm font-medium text-gray-400">
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1 px-2 sm:px-3">
                {userNavigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}