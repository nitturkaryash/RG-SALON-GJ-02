import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Button,
  Tooltip,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  CalendarMonth,
  People,
  ContentCut,
  Person,
  ShoppingCart,
  PointOfSale,
  ChevronLeft,
  ChevronRight,
  Storefront,
  Category,
  CardMembership,
  Inventory,
  Logout,
  Store as StoreIcon,
  InventoryRounded,
} from '@mui/icons-material'
import * as React from 'react'
import * as FramerMotion from 'framer-motion'
import { styled } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import { useAuthContext } from '../contexts/AuthContext'

const drawerWidth = 240
const collapsedDrawerWidth = 64

interface LayoutProps {
  children: React.ReactNode
}

interface MenuLink {
  text: string
  path: string
  icon: React.ReactElement
}

const menuLinks: MenuLink[] = [
  { text: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
  { text: 'Appointments', path: '/appointments', icon: <CalendarMonth /> },
  { text: 'Clients', path: '/clients', icon: <People /> },
  { text: 'Services', path: '/services', icon: <Category /> },
  { text: 'Products', path: '/product-master', icon: <InventoryRounded /> },
  { text: 'Stylists', path: '/stylists', icon: <Person /> },
  { text: 'Orders', path: '/orders', icon: <ShoppingCart /> },
  { text: 'POS', path: '/pos', icon: <PointOfSale /> },
  { text: 'Inventory', path: '/products', icon: <StoreIcon /> },
  { text: 'Memberships', path: '/membership-tiers', icon: <CardMembership /> },
  { text: 'Members', path: '/members', icon: <CardMembership /> },
]

const ListItemStyled = styled(ListItem)(({ theme }) => ({
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: alpha(theme.palette.salon.olive, 0.1),
    transform: 'translateY(-2px)',
  },
}))

const MenuIconStyled = styled(FramerMotion.motion.div)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

const menuItemVariants = {
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
}

export default function Layout({ children }: LayoutProps) {
  const theme = useTheme()
  const location = useLocation()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const { session, logout } = useAuthContext()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Function to get username from localStorage
  const getUsernameFromLocalStorage = () => {
    try {
      const userStr = localStorage.getItem('auth_user')
      if (userStr) {
        const user = JSON.parse(userStr)
        return user.username
      }
      return null
    } catch (error) {
      console.error('Error reading username from localStorage:', error)
      return null
    }
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleCollapseToggle = () => {
    setCollapsed(!collapsed)
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      // The auth listener in AuthContext will handle redirecting to login
      // If using React Router, you could add navigation here
      window.location.href = '/login' // Redirect to login page
    } catch (error) {
      console.error('Error during logout:', error)
      alert('Failed to log out. Please try again.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const userSection = (
    <Box sx={{ p: collapsed ? 1 : 2, borderTop: 1, borderColor: 'divider' }}>
      {!collapsed ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              {session?.username?.charAt(0)?.toUpperCase() || getUsernameFromLocalStorage()?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {session?.username || getUsernameFromLocalStorage() || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Administrator
              </Typography>
            </Box>
          </Box>
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            startIcon={<Logout />}
            onClick={handleLogout}
            disabled={isLoggingOut}
            sx={{
              justifyContent: 'flex-start',
              px: 2,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Tooltip title={session?.username || getUsernameFromLocalStorage() || 'User'} placement="right">
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
              {session?.username?.charAt(0)?.toUpperCase() || getUsernameFromLocalStorage()?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </Tooltip>
          <Tooltip title="Logout" placement="right">
            <IconButton
              size="small"
              color="primary"
              onClick={handleLogout}
              disabled={isLoggingOut}
              sx={{
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <Logout fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  )

  const drawer = (
    <>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: collapsed ? 'center' : 'space-between',
        px: collapsed ? 1 : [1],
        py: 2,
        position: 'relative',
        transition: 'all 0.3s ease',
      }}>
        {!collapsed && (
          <Typography 
            variant="h5" 
            noWrap 
            component="div" 
            color="primary"
            align="center"
            sx={{
              fontWeight: 800,
              letterSpacing: '0.08em',
              background: theme => `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.success.main} 90%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              py: 1.5,
              flex: 1,
            }}
          >
            R&G SPALON
          </Typography>
        )}
        
        {!isMobile && (
          <Tooltip title={collapsed ? "Expand menu" : "Collapse menu"} placement="right">
            <IconButton 
              onClick={handleCollapseToggle}
              sx={{ 
                ml: collapsed ? 0 : 1,
                transition: 'all 0.3s ease',
              }}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          </Tooltip>
        )}
        
        {isMobile && (
          <IconButton 
            onClick={handleDrawerToggle}
            sx={{ position: 'absolute', right: 8 }}
          >
            <ChevronLeft />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        p: 1,
        gap: 1,
        flexGrow: 1
      }}>
        {menuLinks.map((link) => (
          <FramerMotion.motion.div
            key={link.text}
            whileHover="hover"
            variants={menuItemVariants}
            style={{ width: '100%' }}
          >
            <ListItemStyled
              disablePadding
              sx={{ width: '100%' }}
            >
              <Tooltip 
                title={collapsed ? link.text : ""} 
                placement="right" 
                disableHoverListener={!collapsed}
              >
                <ListItemButton
                  component={Link}
                  to={link.path}
                  selected={location.pathname === link.path}
                  onClick={isMobile ? handleDrawerToggle : undefined}
                  sx={{
                    borderRadius: 1,
                    minHeight: '48px',
                    px: collapsed ? 1 : 2,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: location.pathname === link.path ? 'primary.main' : 'inherit',
                      minWidth: collapsed ? 'auto' : 40,
                      mr: collapsed ? 0 : 2,
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {link.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText 
                      primary={link.text}
                      sx={{
                        '& .MuiListItemText-primary': {
                          color: location.pathname === link.path ? 'primary.main' : 'inherit',
                          fontWeight: location.pathname === link.path ? 600 : 400,
                        }
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItemStyled>
          </FramerMotion.motion.div>
        ))}
      </List>
      {userSection}
    </>
  )

  const currentDrawerWidth = collapsed ? collapsedDrawerWidth : drawerWidth

  // Set CSS custom properties for responsive design
  React.useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', `${currentDrawerWidth}px`);
    document.documentElement.style.setProperty('--sidebar-collapsed', collapsed ? 'true' : 'false');
  }, [currentDrawerWidth, collapsed]);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          display: { xs: 'flex', md: 'none' },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="primary"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h5" 
            noWrap 
            component="div" 
            color="primary"
            align="center"
            sx={{
              fontWeight: 800,
              letterSpacing: '0.08em',
              background: theme => `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.success.main} 90%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              width: '100%'
            }}
          >
            R&G SPALON
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ 
          width: { md: currentDrawerWidth }, 
          flexShrink: { md: 0 },
          transition: 'width 0.3s ease',
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: currentDrawerWidth,
              backgroundColor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider',
              transition: 'width 0.3s ease',
              overflowX: 'hidden',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { xs: '100%', md: `calc(100% - ${currentDrawerWidth}px)` },
          mt: { xs: 8, md: 0 },
          minHeight: '100vh',
          backgroundColor: 'background.default',
          transition: 'width 0.3s ease, margin 0.3s ease',
        }}
      >
        <FramerMotion.AnimatePresence initial={false} mode="sync">
          <FramerMotion.motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.2,
              ease: "easeInOut"
            }}
            style={{ width: '100%', height: '100%' }}
          >
            {children}
          </FramerMotion.motion.div>
        </FramerMotion.AnimatePresence>
      </Box>
    </Box>
  )
}