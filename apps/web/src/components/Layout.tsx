import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  Container,
  Flex,
  Badge,
  Tooltip
} from '@generalstaff/ui-components';
import {
  LayoutDashboard,
  Box,
  Anchor,
  Plane,
  Settings,
  BarChart2
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Division Designer', icon: LayoutDashboard },
  { path: '/tank', label: 'Tank Designer', icon: Box },
  { path: '/navy', label: 'Navy Designer', icon: Anchor },
  { path: '/air', label: 'Air Designer', icon: Plane },
  { path: '/analysis', label: 'Analysis', icon: BarChart2 },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <Container className="py-4">
          <Flex justify="between" align="center" gap={4}>
            <Flex align="center" gap={3}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">GS</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  GeneralStaff
                </h1>
              </div>
              <nav className="hidden md:flex items-center gap-1 ml-8" aria-label="Main navigation">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) => `
                        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isActive
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>
            </Flex>
            <Flex align="center" gap={3}>
              <Badge variant="outline" className="text-xs">v0.1.0</Badge>
              <Tooltip content="Settings">
                <button className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Settings">
                  <Settings className="h-5 w-5" aria-hidden="true" />
                </button>
              </Tooltip>
            </Flex>
          </Flex>
        </Container>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2" aria-label="Mobile navigation">
        <Flex justify="center" gap={2} className="overflow-x-auto pb-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                  ${isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </Flex>
      </nav>

      {/* Main Content */}
      <main className="flex-1" role="main">
        <Container className="py-6">
          <Outlet />
        </Container>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
        <Container>
          <Flex justify="between" align="center" gap={4} className="text-sm text-gray-500 dark:text-gray-400">
            <span>GeneralStaff - HOI4 Division Designer</span>
            <Flex gap={4}>
              <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Documentation</a>
              <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">GitHub</a>
              <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Discord</a>
            </Flex>
          </Flex>
        </Container>
      </footer>
    </div>
  );
}