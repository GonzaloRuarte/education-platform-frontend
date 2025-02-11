import EmptyToolBar from '@/shared/layout/EmptyToolbar';
import Menu from '@/shared/layout/Menu';
import Box from '@mui/material/Box';
import MUI_Drawer from '@mui/material/Drawer';

const drawerWidth = 240;




const Drawer = () => {
  return <>
    <MUI_Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <EmptyToolBar />
      <Box sx={{ overflow: 'auto' }}>
        <Menu />
      </Box>
    </MUI_Drawer>
  </>
}

export default Drawer