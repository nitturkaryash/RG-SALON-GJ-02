import React, { useState } from 'react';
import { useAppointments } from '../hooks/useAppointments';

// Debug component to see what data is passed to the PurchaseTab
export const DebugTable = ({ purchases }) => {
    const { updateAppointment } = useAppointments();
    const [currentAppointmentId, setCurrentAppointmentId] = useState<string | null>(null);

    return (
        <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid red', backgroundColor: '#ffeeee' }}>
            <h3>Debug: Purchase Data Source</h3>
            <p>Number of purchases: {purchases?.length || 0}</p>
            <pre>{JSON.stringify(purchases?.slice(0, 2), null, 2)}</pre>
        </div>
    );
};

export default DebugTable; 