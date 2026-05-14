import React, { useState } from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import {
  Box, Text, TextInput, Button, Stack, Loader, Center, Divider,
} from '@mantine/core';
import { toast } from 'sonner';
import { useTranslation } from "react-i18next";
import custAxios from '../../configs/axios.config';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { amount, type = 'donation', items = [] } = location.state || {};

  const isMerch = type === 'merch';

  // Redirect if nothing to pay
  if (!amount && items.length === 0) {
    return <Navigate to="/" replace />;
  }

  const total = isMerch
    ? items.reduce((acc, i) => acc + i.price * (i.quantity || 1), 0)
    : amount;

  const [form, setForm] = useState({
    email: '',
    name: '',
    // shipping fields (merch only)
    address: '',
    city: '',
    country: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error(t('checkout.errors.invalid_email'));
      return false;
    }
    if (!form.name.trim()) {
      toast.error(t('checkout.errors.name_required'));
      return false;
    }
    if (isMerch) {
      if (!form.address.trim() || !form.city.trim() || !form.country.trim()) {
        toast.error(t('checkout.errors.shipping_required'));
        return false;
      }
    }
    return true;
  };

  const handleProceed = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = isMerch
        ? {
            type: 'merch',
            email: form.email,
            shippingName: form.name,
            address: `${form.address}, ${form.city}, ${form.country}`,
            items: items.map((i) => ({
              name: i.name,
              price: i.price,
              quantity: i.quantity || 1,
              image: i.prod_image || i.image || undefined,
            })),
          }
        : {
            type: 'donation',
            amount: total,
            email: form.email,
            name: form.name,
          };

      const res = await custAxios.post('/donations/create-checkout-session', payload);

      if (res.data.success && res.data.data.url) {
        // Redirect to Stripe's hosted payment page
        window.location.href = res.data.data.url;
      } else {
        toast.error(t('checkout.errors.session_failed'));
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || t('checkout.errors.generic_error'));
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    input: {
      backgroundColor: '#080b16',
      border: '1px solid #2c2f52',
      color: 'white',
      height: 46,
      fontSize: 14,
      borderRadius: 8,
    },
    label: {
      color: '#8b8fa8',
      fontSize: 11,
      letterSpacing: '1px',
      marginBottom: 4,
      fontFamily: 'Vision Font, sans-serif',
    },
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <Box
        className="custom-scrollbar"
        style={{
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          overflowY: 'scroll',
          background: 'rgba(9, 11, 22, 0.95)',
          border: '2px solid #2b2f55',
          borderRadius: 18,
          padding: '2.5rem 2rem',
        }}
      >
        {/* Header */}
        <Text
          className="vision-font"
          ta="center"
          style={{ fontSize: 32, color: 'white', letterSpacing: '4px', marginBottom: 8 }}
        >
          { isMerch ? t('checkout.order_details') : t('checkout.support_artist') }
        </Text>
        <Text
          className="vision-font"
          ta="center"
          style={{ fontSize: 14, color: '#F6F4D3', opacity: 0.8, marginBottom: 28 }}
        >
          * {t('checkout.amount_to_pay', { amount: total })}
        </Text>

        <Divider color="#2b2f55" mb="xl" />

        <Stack gap="md">
          {/* Common fields */}
          <TextInput
            label={isMerch ? t('checkout.full_name') : t('checkout.your_name')}
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange('name')}
            styles={inputStyles}
            className="vision-font"
          />
          <TextInput
            label={t('checkout.email_address')}
            placeholder="you@example.com"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            styles={inputStyles}
            className="vision-font"
          />

          {/* Merch-only shipping fields */}
          {isMerch && (
            <>
              <Divider label={
                <Text className="vision-font" size="xs" color="#8b8fa8" style={{ letterSpacing: '1px' }}>
                  {t('checkout.shipping_address')}
                </Text>
              } color="#2b2f55" />
              <TextInput
                label={t('checkout.street_address')}
                placeholder="123 Main Street, Apt 4B"
                value={form.address}
                onChange={handleChange('address')}
                styles={inputStyles}
                className="vision-font"
              />
              <TextInput
                label={t('checkout.city')}
                placeholder="New York"
                value={form.city}
                onChange={handleChange('city')}
                styles={inputStyles}
                className="vision-font"
              />
              <TextInput
                label={t('checkout.country')}
                placeholder="United States"
                value={form.country}
                onChange={handleChange('country')}
                styles={inputStyles}
                className="vision-font"
              />
            </>
          )}

          {/* Item summary for merch */}
          {isMerch && items.length > 0 && (
            <>
              <Divider label={
                <Text className="vision-font" size="xs" color="#8b8fa8" style={{ letterSpacing: '1px' }}>
                  {t('checkout.summary')}
                </Text>
              } color="#2b2f55" />
              <Stack gap="xs">
                {items.map((item, idx) => (
                  <Box
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'rgba(43, 47, 85, 0.3)',
                      borderRadius: 8,
                    }}
                  >
                    <Text className="vision-font" size="xs" color="#F6F4D3">
                      {item.name} {item.selectedSize ? `(${item.selectedSize})` : ''} × {item.quantity || 1}
                    </Text>
                    <Text className="vision-font" size="xs" color="#5EEAD4">
                      €{(item.price * (item.quantity || 1)).toFixed(2)}
                    </Text>
                  </Box>
                ))}
                <Box style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px' }}>
                  <Text className="vision-font" size="sm" color="white" fw={700}>{t('checkout.total')}</Text>
                  <Text className="vision-font" size="sm" color="#F6F4D3" fw={700}>€{total}</Text>
                </Box>
              </Stack>
            </>
          )}

          {/* CTA */}
          <Button
            fullWidth
            mt="md"
            onClick={handleProceed}
            loading={loading}
            disabled={loading}
            className="vision-font"
            style={{
              backgroundColor: '#F6F4D3',
              color: '#000',
              height: 50,
              fontSize: 16,
              letterSpacing: '2px',
              fontWeight: 700,
              borderRadius: 10,
            }}
          >
            {loading ? (
              <Center>
                <Loader size="xs" color="#000" mr={8} />
                {t('checkout.redirecting')}
              </Center>
            ) : t('checkout.proceed_payment')}
          </Button>

          <Button
            fullWidth
            variant="subtle"
            onClick={() => navigate(-1)}
            className="vision-font"
            style={{ color: '#8b8fa8', fontSize: 12, letterSpacing: '1px' }}
          >
            {t('checkout.go_back')}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default CheckoutPage;
