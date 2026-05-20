import { Head, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Box, Stack, Text, PasswordInput, Group } from '@mantine/core';
import { usePage } from '@inertiajs/react';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';

export default function ChangePassword() {
    const { flash, auth } = usePage().props;
    const user = auth?.user;
    const fileRef = useRef(null);

    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const inputStyles = {
        label: { color: textSec, fontSize: 12, fontWeight: 600, marginBottom: 4 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };

    const { data, setData, patch, processing, errors, reset } = useForm({
        current_password:      '',
        password:              '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch('/account/password', {
            onSuccess: () => reset('current_password', 'password', 'password_confirmation'),
        });
    };

    const handleAvatarPick = (file) => {
        if (!file) return;
        router.post('/account/avatar', { avatar: file }, { forceFormData: true, preserveScroll: true });
    };

    const [lightboxOpen, setLightboxOpen] = useState(false);

    return (
        <DashboardLayout>
            <Head title="Account Settings" />

            {/* Banner */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18,
                    padding: '20px 28px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Group gap={10} style={{ position: 'relative', zIndex: 1 }}>
                        <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                            ⚙️
                        </Box>
                        <Stack gap={1}>
                            <Text fw={900} size="lg" c="white">Account Settings</Text>
                            <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Update your profile picture and password</Text>
                        </Stack>
                    </Group>
                </Box>
            </motion.div>

            <Box style={{ maxWidth: 520, margin: '0 auto' }}>
                {/* Flash */}
                {flash?.success && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                        <Box mb="lg" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, padding: '10px 16px' }}>
                            <Text size="sm" style={{ color: '#22C55E' }}>✓ {flash.success}</Text>
                        </Box>
                    </motion.div>
                )}

                {/* Profile Picture Card */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                        <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                            <Group gap={8}>
                                <Text size="md">🖼️</Text>
                                <Text fw={700} size="sm" style={{ color: textPri }}>Profile Picture</Text>
                            </Group>
                        </Box>
                        <Box style={{ padding: '20px 24px' }}>
                            <Text size="xs" style={{ color: textSec, marginBottom: 16 }}>JPG, PNG or WEBP. Max 4 MB. A square image works best.</Text>
                            <Group gap="lg" align="center">
                                {user?.avatar_url ? (
                                    <Box
                                        component="img"
                                        src={user.avatar_url}
                                        alt={user.name}
                                        onClick={() => setLightboxOpen(true)}
                                        title="Click to view full image"
                                        style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', border: '3px solid rgba(234,88,12,0.4)', boxShadow: '0 6px 20px rgba(234,88,12,0.3)', cursor: 'zoom-in' }}
                                    />
                                ) : (
                                    <Box style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #C2410C, #EA580C)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(234,88,12,0.35)', flexShrink: 0 }}>
                                        <Text c="white" fw={800} size="40px">{(user?.name || 'U').charAt(0).toUpperCase()}</Text>
                                    </Box>
                                )}
                                <Stack gap={8}>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        style={{ display: 'none' }}
                                        onChange={e => { handleAvatarPick(e.target.files?.[0]); e.target.value = ''; }}
                                    />
                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                        <Box
                                            component="button"
                                            onClick={() => fileRef.current?.click()}
                                            style={{ padding: '9px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, boxShadow: '0 4px 16px rgba(234,88,12,0.4)' }}
                                        >
                                            {user?.avatar_url ? 'Change photo' : 'Upload photo'}
                                        </Box>
                                    </motion.div>
                                </Stack>
                            </Group>
                        </Box>
                    </Box>
                </motion.div>

                {/* Change Password Card */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                        <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                            <Group gap={8}>
                                <Text size="md">🔐</Text>
                                <Text fw={700} size="sm" style={{ color: textPri }}>Change Password</Text>
                            </Group>
                        </Box>
                        <Box style={{ padding: '20px 24px' }}>
                            <form onSubmit={submit}>
                                <Stack gap="md">
                                    <PasswordInput
                                        label="Current Password"
                                        placeholder="Enter your current password"
                                        value={data.current_password}
                                        onChange={(e) => setData('current_password', e.target.value)}
                                        error={errors.current_password}
                                        required
                                        autoComplete="current-password"
                                        styles={inputStyles}
                                    />
                                    <PasswordInput
                                        label="New Password"
                                        placeholder="At least 8 characters"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        error={errors.password}
                                        required
                                        autoComplete="new-password"
                                        styles={inputStyles}
                                    />
                                    <PasswordInput
                                        label="Confirm New Password"
                                        placeholder="Repeat new password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        error={errors.password_confirmation}
                                        required
                                        autoComplete="new-password"
                                        styles={inputStyles}
                                    />
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Box
                                            component="button"
                                            type="submit"
                                            disabled={processing}
                                            style={{ width: '100%', background: 'linear-gradient(135deg, #C2410C, #EA580C)', border: 'none', height: 42, borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 14, cursor: processing ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(234,88,12,0.4)', opacity: processing ? 0.7 : 1 }}
                                        >
                                            {processing ? 'Updating…' : 'Update Password'}
                                        </Box>
                                    </motion.div>
                                </Stack>
                            </form>
                        </Box>
                    </Box>
                </motion.div>
            </Box>

            {/* Lightbox */}
            {lightboxOpen && user?.avatar_url && (
                <Box
                    onClick={() => setLightboxOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, cursor: 'zoom-out', backdropFilter: 'blur(4px)' }}
                >
                    <Box
                        component="img"
                        src={user.avatar_url}
                        alt={user.name}
                        onClick={e => e.stopPropagation()}
                        style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', cursor: 'default' }}
                    />
                    <Box
                        onClick={() => setLightboxOpen(false)}
                        style={{ position: 'absolute', top: 20, right: 24, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 700, cursor: 'pointer' }}
                    >×</Box>
                </Box>
            )}
        </DashboardLayout>
    );
}
