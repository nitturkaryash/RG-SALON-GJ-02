import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

describe('Membership Payment Toggle', () => {
  function MembershipPaymentComponent({ tier }: { tier: string }) {
    const [useMembershipPayment, setUseMembershipPayment] = React.useState(false);
    return (
      <div>
        {tier && (
          <FormControlLabel
            control={
              <Switch
                checked={useMembershipPayment}
                onChange={(e) => setUseMembershipPayment(e.target.checked)}
                data-testid="membership-switch"
              />
            }
            label="Pay via Membership"
          />
        )}
        {!useMembershipPayment && <div data-testid="payment-methods">Payment Methods</div>}
        {useMembershipPayment && <div data-testid="membership-payment">Membership Payment Mode</div>}
      </div>
    );
  }

  it('toggles payment methods visibility when switch is clicked', () => {
    render(<MembershipPaymentComponent tier="Gold" />);
    // Payment methods should be visible initially
    expect(screen.getByTestId('payment-methods')).toBeInTheDocument();
    // Click the switch to enable membership payment
    fireEvent.click(screen.getByTestId('membership-switch'));
    // Payment methods should not be visible
    expect(screen.queryByTestId('payment-methods')).not.toBeInTheDocument();
    // Membership payment mode should be visible
    expect(screen.getByTestId('membership-payment')).toBeInTheDocument();
  });
}); 