import React, { useState } from 'react';
import { Box, Text, TextInput, PasswordInput, Button, Group, Image, Alert } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { FaLock, FaUser, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import { loginAction } from '../../store/actions/authActions';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

const AdminLogin = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: 'admin@beatspace.com',
    password: ''
  });
  const [error, setError] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await dispatch(loginAction({email: formData.username, password: formData.password}));
      if (res && res.success) {
        console.log(res);
        const role = res.data.user.role;
        console.log(role);
        if(role === 'admin'){
          navigate('/admin/dashboard');
          return;
        }
        navigate('/admin/login');
        setError(t('admin.login.error_not_authorized'));
        
      } else {
        const message = typeof res?.error === 'string'
          ? res.error
          : res?.error?.message || t('admin.login.error_failed');
        setError(message);
      }
    } catch (error) {
      const message = typeof error?.message === 'string'
        ? error.message
        : t('admin.login.error_generic');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      className="alexandria-font"
      style={{ 
        minHeight: '100vh', 
        backgroundColor: '#111827', 
        position: 'relative', 
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Background Frame */}
      <Image
        src="/assets/Frame.png"
        alt="TV Frame"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 2,
          pointerEvents: 'none'
        }}
      />
      
      {/* Background Image */}
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("/assets/Hero-bg.webp")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 1,
          opacity: 0.3
        }}
      />



      {/* Main Content */}
      <Box
        style={{
          position: 'relative',
          zIndex: 3,
          width: '100%',
          maxWidth: '400px',
          padding: '2rem',
          margin: '0 1rem'
        }}
      >
        {/* Header */}
        <Box style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Text
            size="xl"
            className="alexandria-font"
            style={{
              color: '#F59E0B',
              textShadow: '0 0 10px rgba(245, 158, 11, 0.5)',
              letterSpacing: '0.1em'
            }}
          >
            {t('admin.login.title')}
          </Text>
          <Text
            className="alexandria-font"
            style={{
              fontSize: '0.8rem',
              color: '#9CA3AF',
              marginBottom: '1.5rem'
            }}
          >
            {t('admin.login.subtitle')}
          </Text>
        </Box>

        {/* Login Form */}
        <Box
          style={{
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            border: '2px solid #374151',
            borderRadius: '12px',
            padding: '2rem',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 20px rgba(246, 244, 211, 0.1)'
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Error Alert */}
            {error && (
              <Alert
                icon={<FaExclamationTriangle />}
                color="red"
                style={{
                  marginBottom: '1rem',
                  backgroundColor: 'rgba(220, 38, 38, 0.1)',
                  border: '1px solid #DC2626',
                  color: '#FCA5A5'
                }}
              >
                <Text style={{ fontSize: '0.7rem' }}>
                   {error}
                 </Text>
              </Alert>
            )}

            {/* Username Input */}
            <TextInput
              leftSection={<FaUser style={{ color: '#9CA3AF' }} />}
              placeholder={t('admin.login.username_placeholder')}
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              style={{ marginBottom: '1rem' }}
              styles={{
                input: {
                  backgroundColor: 'rgba(55, 65, 81, 0.8)',
                  border: '1px solid #4B5563',
                  color: '#F9FAFB',
                  fontSize: '0.9rem',
                  '&:focus': {
                    borderColor: '#F6F4D3',
                    boxShadow: '0 0 0 1px #F6F4D3'
                  },
                  '&::placeholder': {
                    color: '#9CA3AF'
                  }
                }
              }}

            />

            {/* Password Input */}
            <PasswordInput
              leftSection={<FaLock style={{ color: '#9CA3AF' }} />}
              placeholder={t('admin.login.password_placeholder')}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              style={{ marginBottom: '1.5rem' }}
              styles={{
                input: {
                  backgroundColor: 'rgba(55, 65, 81, 0.8)',
                  border: '1px solid #4B5563',
                  color: '#F9FAFB',
                  fontSize: '0.9rem',
                  '&:focus': {
                    borderColor: '#F6F4D3',
                    boxShadow: '0 0 0 1px #F6F4D3'
                  },
                  '&::placeholder': {
                    color: '#9CA3AF'
                  }
                },
                innerInput: {
                  color: '#F9FAFB'
                }
              }}
            />

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={loading}
              style={{
                backgroundColor: isHovered ? '#F6F4D3' : 'transparent',
                border: '2px solid #F6F4D3',
                color: isHovered ? '#111827' : '#F6F4D3',
                height: '48px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                marginBottom: '1rem'
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Text style={{ fontSize: '0.8rem' }}>
                  {t('admin.login.button')}
                </Text>
            </Button>
          </form>
        </Box>

        {/* Footer */}
        <Box style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link 
            to="/" 
            className="alexandria-font"
            style={{ 
              color: '#F6F4D3', 
              textDecoration: 'none',
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '1rem',
              opacity: 0.8,
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
          >
            <FaArrowLeft size={12} />
            {t('admin.login.back_to_website')}
          </Link>

          <Text
            className="alexandria-font"
            style={{
              color: '#6B7280',
              fontSize: '0.7rem',
            }}
          >
            {t('admin.login.footer')}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLogin;
