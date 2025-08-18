'use client';

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from '../pages/Dashboard';
import Appointments from '../pages/Appointments';
import Clients from '../pages/Clients';
import Inventory from '../pages/Inventory';
import Orders from '../pages/Orders';
import POS from '../pages/POS';
import Stylists from '../pages/Stylists';
import ProductCollections from '../pages/ProductCollections';
import ServiceCollections from '../pages/ServiceCollections';
import MembershipTiers from '../pages/MembershipTiers';
import Communications from '../pages/Communications';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthContextProvider } from '../contexts/AuthContext';
import { CustomThemeProvider } from '../contexts/ThemeContext';

export default function Home() {
  return (
    <CustomThemeProvider>
      <AuthContextProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/appointments" element={
                <ProtectedRoute>
                  <Appointments />
                </ProtectedRoute>
              } />
              <Route path="/clients" element={
                <ProtectedRoute>
                  <Clients />
                </ProtectedRoute>
              } />
              <Route path="/inventory" element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } />
              <Route path="/pos" element={
                <ProtectedRoute>
                  <POS />
                </ProtectedRoute>
              } />
              <Route path="/stylists" element={
                <ProtectedRoute>
                  <Stylists />
                </ProtectedRoute>
              } />
              <Route path="/product-collections" element={
                <ProtectedRoute>
                  <ProductCollections />
                </ProtectedRoute>
              } />
              <Route path="/service-collections" element={
                <ProtectedRoute>
                  <ServiceCollections />
                </ProtectedRoute>
              } />
              <Route path="/membership-tiers" element={
                <ProtectedRoute>
                  <MembershipTiers />
                </ProtectedRoute>
              } />
              <Route path="/communications" element={
                <ProtectedRoute>
                  <Communications />
                </ProtectedRoute>
              } />
            </Routes>
          </Layout>
        </Router>
      </AuthContextProvider>
    </CustomThemeProvider>
  );
}
