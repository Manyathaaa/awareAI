import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

const Layout = () => (
  <div className="flex min-h-screen">
    <Sidebar />
    <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
      <Outlet />
    </main>
  </div>
);

export default Layout;
