import { Outlet } from 'react-router-dom';
import ProjectTabs from './ProjectTabs';

export default function AppLayout() {
  return (
    <div>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: '#ffffff',
          borderBottom: '1px solid rgba(0,0,0,0.10)',
        }}
      >
        <ProjectTabs />
      </header>
      <div>
        <Outlet />
      </div>
    </div>
  );
}

