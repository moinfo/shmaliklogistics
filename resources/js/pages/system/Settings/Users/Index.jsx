import { useRef, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Select } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { useCan } from '../../../../lib/can';

const ROLE_COLORS = {
    administrator: '#EF4444',
    'operations-manager': '#3B82F6',
    'finance-officer': '#22C55E',
    'hr-officer': '#A855F7',
    driver: '#F59E0B',
};

function UserModal({ title, onClose, onSubmit, data, setData, errors, processing, roles, isDark }) {
    const cardBg     = isDark ? '#0F0500' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';
    const inputStyles = {
        label: { color: textSec, fontSize: 13, marginBottom: 4 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };

    return (
        <Box style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} transition={{ duration: 0.18 }}
                style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 18, overflow: 'hidden', width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
                {/* Modal header with orange accent */}
                <Box style={{ background: isDark ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)' : 'linear-gradient(135deg, #C2410C 0%, #EA580C 100%)', padding: '16px 24px' }}>
                    <Group justify="space-between" align="center">
                        <Text fw={800} size="md" c="white">{title}</Text>
                        <Box component="button" onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '2px 8px', borderRadius: 8 }}>×</Box>
                    </Group>
                </Box>
                <Box style={{ padding: 24 }}>
                    <form onSubmit={onSubmit}>
                        <Stack gap="md">
                            <TextInput label="Full Name" required value={data.name} onChange={e => setData(p => ({ ...p, name: e.target.value }))} error={errors?.name} styles={inputStyles} />
                            <TextInput label="Email Address" type="email" required value={data.email} onChange={e => setData(p => ({ ...p, email: e.target.value }))} error={errors?.email} styles={inputStyles} />
                            <Select label="Role" placeholder="Select role…" required value={data.role_id ? String(data.role_id) : null}
                                onChange={v => setData(p => ({ ...p, role_id: v }))}
                                data={roles.map(r => ({ value: String(r.id), label: r.name }))}
                                error={errors?.role_id}
                                comboboxProps={{ zIndex: 1100, withinPortal: true }}
                                styles={{ ...inputStyles, dropdown: { background: isDark ? '#0F0500' : '#fff', border: `1px solid ${cardBorder}` } }}
                            />
                            <Group grow gap="md">
                                <TextInput label="Birth Region" placeholder="e.g. Kilimanjaro"
                                    value={data.birth_region ?? ''}
                                    onChange={e => setData(p => ({ ...p, birth_region: e.target.value }))}
                                    error={errors?.birth_region} styles={inputStyles} />
                                <TextInput label="Birth District" placeholder="e.g. Moshi Rural"
                                    value={data.birth_district ?? ''}
                                    onChange={e => setData(p => ({ ...p, birth_district: e.target.value }))}
                                    error={errors?.birth_district} styles={inputStyles} />
                            </Group>
                            <TextInput label={data._isEdit ? 'New Password (leave blank to keep)' : 'Password'} type="password"
                                required={!data._isEdit}
                                value={data.password}
                                onChange={e => setData(p => ({ ...p, password: e.target.value }))}
                                error={errors?.password} styles={inputStyles} />
                            <TextInput label="Confirm Password" type="password"
                                required={!data._isEdit || !!data.password}
                                value={data.password_confirmation}
                                onChange={e => setData(p => ({ ...p, password_confirmation: e.target.value }))}
                                styles={inputStyles} />
                        </Stack>
                        <Group justify="flex-end" gap="sm" mt="xl">
                            <Box component="button" type="button" onClick={onClose}
                                style={{ padding: '9px 20px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'none', color: textSec, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                                Cancel
                            </Box>
                            <motion.div whileTap={{ scale: 0.97 }}>
                                <Box component="button" type="submit" disabled={processing}
                                    style={{ padding: '9px 24px', borderRadius: 8, border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: '#fff', fontWeight: 700, fontSize: 14, opacity: processing ? 0.7 : 1, boxShadow: '0 4px 12px rgba(194,65,12,0.35)' }}>
                                    {processing ? 'Saving…' : 'Save User'}
                                </Box>
                            </motion.div>
                        </Group>
                    </form>
                </Box>
            </motion.div>
        </Box>
    );
}

const blank = { name: '', email: '', role_id: null, birth_region: '', birth_district: '', password: '', password_confirmation: '' };

export default function UsersIndex({ users, roles }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { props } = usePage();

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const headBg     = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';
    const rowHov     = isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFA';

    const [createOpen, setCreateOpen] = useState(false);
    const [editUser, setEditUser]     = useState(null);
    const [formData, setFormData]     = useState(blank);
    const [errors, setErrors]         = useState({});
    const [processing, setProcessing] = useState(false);
    const can = useCan();
    const canManage = can('settings.edit');

    const openCreate = () => { setFormData({ ...blank }); setErrors({}); setCreateOpen(true); };
    const openEdit   = (u) => {
        setFormData({ _isEdit: true, name: u.name, email: u.email, role_id: u.role_id ? String(u.role_id) : null, birth_region: u.birth_region ?? '', birth_district: u.birth_district ?? '', password: '', password_confirmation: '' });
        setErrors({}); setEditUser(u);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post('/system/settings/users', formData, {
            onSuccess: () => { setProcessing(false); setCreateOpen(false); },
            onError: (err) => { setProcessing(false); setErrors(err); },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.put(`/system/settings/users/${editUser.id}`, formData, {
            onSuccess: () => { setProcessing(false); setEditUser(null); },
            onError: (err) => { setProcessing(false); setErrors(err); },
        });
    };

    const handleDelete = (u) => {
        if (!confirm(`Remove ${u.name} from the system?`)) return;
        router.delete(`/system/settings/users/${u.id}`);
    };

    const fileInputRefs = useRef({});
    const handleAvatarUpload = (u, file) => {
        if (!file) return;
        router.post(`/system/settings/users/${u.id}/avatar`, { avatar: file, _method: 'post' }, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const [lightbox, setLightbox] = useState(null);
    const currentUserId = props.auth?.user?.id;

    return (
        <DashboardLayout title="User Management">
            <Head title="User Management" />

            <AnimatePresence>
                {createOpen && (
                    <UserModal title="Create User" onClose={() => setCreateOpen(false)} onSubmit={handleCreate}
                        data={formData} setData={setFormData} errors={errors} processing={processing} roles={roles} isDark={isDark} />
                )}
                {editUser && (
                    <UserModal title={`Edit — ${editUser.name}`} onClose={() => setEditUser(null)} onSubmit={handleEdit}
                        data={formData} setData={setFormData} errors={errors} processing={processing} roles={roles} isDark={isDark} />
                )}
            </AnimatePresence>

            {/* Page Header Banner */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)' : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>👥</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">User Management</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{users.length} system user{users.length !== 1 ? 's' : ''}</Text>
                            </Stack>
                        </Group>
                        {canManage && (
                            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                <Box component="button" type="button" onClick={openCreate}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                    + Add User
                                </Box>
                            </motion.div>
                        )}
                    </Group>
                </Box>
            </motion.div>

            {/* Users Table */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />

                    {/* Table toolbar */}
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Group gap={8}>
                            <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                            <Text size="sm" fw={700} style={{ color: textPri }}>All Users</Text>
                        </Group>
                        <Text size="xs" style={{ color: textMut }}>{users.length} total</Text>
                    </Box>

                    {/* Table head */}
                    <Box style={{ display: 'grid', gridTemplateColumns: '1fr 200px 160px 130px', background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                        {['User', 'Role', 'Created', 'Actions'].map(h => (
                            <Text key={h} size="10px" fw={800} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.9 }}>{h}</Text>
                        ))}
                    </Box>

                    {users.length === 0 ? (
                        <Box style={{ textAlign: 'center', padding: '60px 0' }}>
                            <Box style={{ width: 72, height: 72, borderRadius: '50%', background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '2px dashed rgba(234,88,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 16px' }}>👥</Box>
                            <Text fw={700} size="md" style={{ color: textPri, marginBottom: 6 }}>No users yet</Text>
                            <Text size="sm" style={{ color: textMut }}>Add the first system user</Text>
                        </Box>
                    ) : (
                        users.map((u, i) => {
                            const roleColor = ROLE_COLORS[u.role?.slug] ?? '#94A3B8';
                            const isSelf    = u.id === currentUserId;
                            return (
                                <motion.div key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                    <Box style={{
                                        display: 'grid', gridTemplateColumns: '1fr 200px 160px 130px',
                                        padding: '13px 20px', borderBottom: `1px solid ${divider}`, alignItems: 'center',
                                        borderLeft: '3px solid transparent', transition: 'background 0.15s, border-left 0.15s',
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = '3px solid #EA580C'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}>

                                        {/* User */}
                                        <Group gap="md">
                                            <Box style={{ position: 'relative', width: 38, height: 38, flexShrink: 0 }}>
                                                {u.avatar_url ? (
                                                    <Box
                                                        component="img"
                                                        src={u.avatar_url}
                                                        alt={u.name}
                                                        onClick={() => setLightbox({ src: u.avatar_url, alt: u.name })}
                                                        title="Click to view full image"
                                                        style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', display: 'block', cursor: 'zoom-in', border: `2px solid ${cardBorder}` }}
                                                    />
                                                ) : (
                                                    <Box style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #C2410C, #EA580C)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(194,65,12,0.35)' }}>
                                                        <Text c="white" fw={800} size="sm">{u.name.charAt(0).toUpperCase()}</Text>
                                                    </Box>
                                                )}
                                                {canManage && (
                                                    <>
                                                        <input
                                                            ref={el => fileInputRefs.current[u.id] = el}
                                                            type="file"
                                                            accept="image/jpeg,image/png,image/webp"
                                                            style={{ display: 'none' }}
                                                            onChange={e => { handleAvatarUpload(u, e.target.files?.[0]); e.target.value = ''; }}
                                                        />
                                                        <Box
                                                            component="button"
                                                            type="button"
                                                            onClick={() => fileInputRefs.current[u.id]?.click()}
                                                            title="Upload photo"
                                                            style={{ position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderRadius: '50%', background: '#EA580C', border: `2px solid ${cardBg}`, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9, lineHeight: 1 }}
                                                        >📷</Box>
                                                    </>
                                                )}
                                            </Box>
                                            <Stack gap={2}>
                                                <Group gap="xs">
                                                    <Text size="sm" fw={700} style={{ color: textPri }}>{u.name}</Text>
                                                    {isSelf && (
                                                        <Box style={{ background: 'rgba(234,88,12,0.15)', borderRadius: 4, padding: '1px 6px', border: '1px solid rgba(234,88,12,0.3)' }}>
                                                            <Text size="10px" fw={700} style={{ color: '#EA580C' }}>YOU</Text>
                                                        </Box>
                                                    )}
                                                </Group>
                                                <Text size="xs" style={{ color: textSec }}>{u.email}</Text>
                                            </Stack>
                                        </Group>

                                        {/* Role */}
                                        {u.role ? (
                                            <Box style={{ background: roleColor + '18', border: `1px solid ${roleColor}35`, borderRadius: 20, padding: '4px 12px', display: 'inline-flex', alignSelf: 'center', width: 'fit-content' }}>
                                                <Box style={{ width: 6, height: 6, borderRadius: '50%', background: roleColor, marginRight: 6, alignSelf: 'center', boxShadow: `0 0 5px ${roleColor}` }} />
                                                <Text size="xs" fw={700} style={{ color: roleColor }}>{u.role.name}</Text>
                                            </Box>
                                        ) : (
                                            <Text size="xs" style={{ color: textMut }}>No role</Text>
                                        )}

                                        {/* Created */}
                                        <Text size="sm" style={{ color: textSec }}>
                                            {new Date(u.created_at).toLocaleDateString('en-TZ', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </Text>

                                        {/* Actions */}
                                        <Group gap="sm" onClick={e => e.stopPropagation()}>
                                            {canManage && (
                                                <Box component="button" type="button" onClick={() => openEdit(u)}
                                                    style={{ background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', color: '#EA580C', fontSize: 12, fontWeight: 700 }}>
                                                    ✏️ Edit
                                                </Box>
                                            )}
                                            {canManage && !isSelf && (
                                                <Box component="button" type="button" onClick={() => handleDelete(u)}
                                                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', color: '#EF4444', fontSize: 12, fontWeight: 600 }}>
                                                    ✕
                                                </Box>
                                            )}
                                            {!canManage && (
                                                <Text size="xs" style={{ color: textMut }}>—</Text>
                                            )}
                                        </Group>
                                    </Box>
                                </motion.div>
                            );
                        })
                    )}

                    {/* Footer */}
                    {users.length > 0 && (
                        <Box style={{ padding: '10px 20px', borderTop: `1px solid ${divider}`, background: headBg }}>
                            <Text size="xs" style={{ color: textMut }}>{users.length} total user{users.length !== 1 ? 's' : ''}</Text>
                        </Box>
                    )}
                </Box>
            </motion.div>

            {/* Lightbox */}
            {lightbox && (
                <Box
                    onClick={() => setLightbox(null)}
                    style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, cursor: 'zoom-out', backdropFilter: 'blur(4px)' }}
                >
                    <Box
                        component="img"
                        src={lightbox.src}
                        alt={lightbox.alt}
                        onClick={e => e.stopPropagation()}
                        style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', cursor: 'default' }}
                    />
                    <Box
                        onClick={() => setLightbox(null)}
                        style={{ position: 'absolute', top: 20, right: 24, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 700, cursor: 'pointer' }}
                    >×</Box>
                </Box>
            )}
        </DashboardLayout>
    );
}
