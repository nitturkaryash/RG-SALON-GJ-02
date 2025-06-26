import React from 'react';
import { motion } from 'framer-motion';
import MeetingIntegration from '../components/MeetingIntegration';

const MeetingCenter: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-blue-100/20 to-indigo-100/20 pointer-events-none" />
      <div className="relative z-10">
        <MeetingIntegration />
      </div>
    </motion.div>
  );
};

export default MeetingCenter; 