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
  { text: 'Stylists', path: '/stylists', icon: <Person /> },
  { text: 'Orders', path: '/orders', icon: <ShoppingCart /> },
  { text: 'POS', path: '/pos', icon: <PointOfSale /> },
  { text: 'Inventory Manager', path: '/products', icon: <StoreIcon /> },
  { text: 'Product Master', path: '/product-master', icon: <InventoryRounded /> },
  { text: 'Membership Tiers', path: '/membership-tiers', icon: <CardMembership /> },
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
    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
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
    </Box>
  )

  const drawer = (
    <>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        px: [1],
        py: 2,
        position: 'relative'
      }}>
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
            width: '100%'
          }}
        >
          R&G SPALON
        </Typography>
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
              <ListItemButton
                component={Link}
                to={link.path}
                selected={location.pathname === link.path}
                onClick={isMobile ? handleDrawerToggle : undefined}
                sx={{
                  borderRadius: 1,
                  minHeight: '48px',
                  px: 2,
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: location.pathname === link.path ? 'primary.main' : 'inherit',
                    minWidth: 40,
                  }}
                >
                  {link.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={link.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: location.pathname === link.path ? 'primary.main' : 'inherit',
                      fontWeight: location.pathname === link.path ? 600 : 400,
                    }
                  }}
                />
              </ListItemButton>
            </ListItemStyled>
          </FramerMotion.motion.div>
        ))}
      </List>
      {userSection}
    </>
  )

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
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
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
              width: drawerWidth,
              backgroundColor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider',
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
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 8, md: 0 },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}