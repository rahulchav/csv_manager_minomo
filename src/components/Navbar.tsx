import { User, Sun, Moon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { logout } from "wasp/client/auth";

type NavbarProps = {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
};

export function Navbar({ darkMode, setDarkMode }: NavbarProps) {
  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 mx-4">
        <div className="flex items-center justify-between w-full">
          <div className="text-xl font-bold">CSV Manager</div>

          <div className="flex gap-4 items-center">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <div className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary">
                  <User size={20} />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer bg-card"
                  onClick={() => logout()}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
