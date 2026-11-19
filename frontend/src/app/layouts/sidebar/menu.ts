import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
  { id: 1, label: 'Menu', isTitle: true },
  { id: 2, label: 'Tableau de bord', icon: 'ri-dashboard-2-line', link: '/dashboard' },
  { id: 3, label: 'Clients', icon: 'ri-team-line', link: '/clients' },
  { id: 4, label: 'Projets', icon: 'ri-folders-line', link: '/projets' },

  { id: 5, label: 'Administration', isTitle: true, roles: ['ADMIN'] },
  { id: 6, label: 'Utilisateurs', icon: 'ri-shield-user-line', link: '/users', roles: ['ADMIN'] }
];
