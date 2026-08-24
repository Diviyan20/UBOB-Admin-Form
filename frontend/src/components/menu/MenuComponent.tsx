import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const navButtonSx = {
  color: '#7EC8F7',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  backgroundColor: 'transparent',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: 'transparent',
    color: '#A5D8FF',
  },
  '&:focus, &:focus-visible, &.Mui-focusVisible': {
    outline: 'none',
    boxShadow: 'none',
    backgroundColor: 'transparent',
  },
};

const menuPaperSx = {
  backgroundColor: '#12141c',
  color: '#e6e6e6',
};

const menuItemSx = {
  '&:hover': {
    backgroundColor: '#1c2030',
  },
};

export default function MenuBar() {
  const navigate = useNavigate();

  // ─── Configuration menu ───────────────────────────────────────────────
  const configId = React.useId();
  const configButtonId = `${configId}-button`;
  const configMenuId = `${configId}-menu`;
  const [configAnchorEl, setConfigAnchorEl] = React.useState<null | HTMLElement>(null);
  const configOpen = Boolean(configAnchorEl);

  const handleConfigClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setConfigAnchorEl(event.currentTarget);
  };
  const handleConfigClose = () => setConfigAnchorEl(null);

  // ─── Dashboard menu ────────────────────────────────────────────────────
  const dashboardId = React.useId();
  const dashboardButtonId = `${dashboardId}-button`;
  const dashboardMenuId = `${dashboardId}-menu`;
  const [dashboardAnchorEl, setDashboardAnchorEl] = React.useState<null | HTMLElement>(null);
  const dashboardOpen = Boolean(dashboardAnchorEl);

  const handleDashboardClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDashboardAnchorEl(event.currentTarget);
  };
  const handleDashboardClose = () => setDashboardAnchorEl(null);

  const goTo = (path: string, closeMenu: () => void) => {
    navigate(path);
    closeMenu();
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: '#0B0E14',
        borderBottom: '1px solid #1F2430',
        marginBottom: '10px'
      }}
    >
      <Toolbar>
        <Button
          id={configButtonId}
          aria-controls={configOpen ? configMenuId : undefined}
          aria-haspopup="true"
          aria-expanded={configOpen}
          onClick={handleConfigClick}
          disableRipple
          sx={navButtonSx}
        >
          Configuration
        </Button>
        <Menu
          id={configMenuId}
          anchorEl={configAnchorEl}
          open={configOpen}
          onClose={handleConfigClose}
          slotProps={{
            list: {
              'aria-labelledby': configButtonId,
            },
            paper: {
              sx: menuPaperSx,
            },
          }}
        >
          <MenuItem sx={menuItemSx} onClick={() => goTo('/configuration', handleConfigClose)}>
            Outlet Registration
          </MenuItem>
          <MenuItem sx={menuItemSx} onClick={() => goTo('/outlet-screen', handleConfigClose)}>
            Outlet Screen Configuration
          </MenuItem>
        </Menu>

        <Button
          id={dashboardButtonId}
          aria-controls={dashboardOpen ? dashboardMenuId : undefined}
          aria-haspopup="true"
          aria-expanded={dashboardOpen}
          onClick={handleDashboardClick}
          disableRipple
          sx={navButtonSx}
        >
          Dashboard
        </Button>
        <Menu
          id={dashboardMenuId}
          anchorEl={dashboardAnchorEl}
          open={dashboardOpen}
          onClose={handleDashboardClose}
          slotProps={{
            list: {
              'aria-labelledby': dashboardButtonId,
            },
            paper: {
              sx: menuPaperSx,
            },
          }}
        >
          <MenuItem sx={menuItemSx} onClick={() => goTo('/outlet-dashboard', handleDashboardClose)}>
            Outlet Dashboard
          </MenuItem>
          <MenuItem sx={menuItemSx} onClick={() => goTo('/media-library', handleDashboardClose)}>
            Media Library
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}