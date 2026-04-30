import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Select } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8', textMut: '#475569' };

const ROLE_COLORS = {
    administrator: '#EF4444',
    'operations-manager': '#3B82F6',
    'finance-officer': '#22C55E',
    'hr-officer': '#A855F7',
    driver: '#F59E0B',
};

function UserModal({ title, onClose, onSubmit, data, setData, errors, processing, roles, isDark }) {
    const cardBg     = isDark ? '#07111F' : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';
    const inputStyles = {
        label: { color: textSec, fontSize: 13, marginBottom: 4 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };

    return (
        <Box style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} transition={{ duration: 0.18 }}
                style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
                <Group justify="space-between" mb="lg">
                    <Text fw={800} size="lg" style={{ color: textPri }}>{title}</Text>
                    <Box component="button" onClick={onClose} style={{ background: 'none', border: 'none', color: textSec, cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4 }}>×</Box>
                </Group>
                <form onSubmit={onSubmit}>
                    <Stack gap="md">
                        <TextInput label="Full Name" required value={data.name} onChange={e => setData(p => ({ ...p, name: e.target.value }))} error={errors?.name} styles={inputStyles} />
                        <TextInput label="Email Address" type="email" required value={data.email} onChange={e => setData(p => ({ ...p, email: e.target.value }))} error={errors?.email} styles={inputStyles} />
                        <Select label="Role" placeholder="Select role…" value={data.role_id ? String(data.role_id) : null}
                            onChange={v => setData(p => ({ ...p, role_id: v }))}
                            clearable
                            data={roles.map(r => ({ value: String(r.id), label: r.name }))}
                            styles={{ ...inputStyles, dropdown: { background: isDark ? '#07111F' : '#fff', border: `1px solid ${cardBorder}` } }}
                        />
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
                        <Box component="button" type="button" onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'none', color: textSec, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Cancel</Box>
                        <motion.div whileTap={{ scale: 0.97 }}>
                            <Box component="button" type="submit" disabled={processing}
                                style={{ padding: '9px 24px', borderRadius: 8, border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: '#fff', fontWeight: 700, fontSize: 14, opacity: processing ? 0.7 : 1 }}>
                                {processing ? 'Saving…' : 'Save User'}
                            </Box>
                        </motion.div>
                    </Group>
                </form>
            </motion.div>
        </Box>
    );
}

const blank = { name: '', email: '', role_id: null, password: '', password_confirmation: '' };

export default function UsersIndex({ users, roles }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { props } = usePage();

    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : '#94A3B8';
    const divider    = isDark ? dk.divider : '#E2E8F0';
    const theadBg    = isDark ? 'rgba(33,150,243,0.06)' : '#F8FAFC';

    const [createOpen, setCreateOpen] = useState(false);
    const [editUser, setEditUser]     = useState(null);
    const [formData, setFormData]     = useState(blank);
    const [errors, setErrors]         = useState({});
    const [processing, setProcessing] = useState(false);

    const openCreate = () => { setFormData({ ...blank }); setErrors({}); setCreateOpen(true); };
    const openEdit   = (u) => {
        setFormData({ _isEdit: true, name: u.name, email: u.email, role_id: u.role_id ? String(u.role_id) : null, password: '', password_confirmation: '' });
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

            {/* Header */}
            <Group justify="space-between" mb="xl" wrap="wrap" gap="md">
                <Stack gap={4}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>User Management</Text>
                    <Text size="sm" style={{ color: textSec }}>{users.length} system user{users.length !== 1 ? 's' : ''}</Text>
                </Stack>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box component="button" type="button" onClick={openCreate}
                        style={{ padding: '10px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                        + Add User
                    </Box>
                </motion.div>
            </Group>

            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
                {/* Table header */}
                <Box style={{ display: 'grid', gridTemplateColumns: '1fr 200px 160px 120px', background: theadBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                    {['User', 'Role', 'Created', 'Actions'].map(h => (
                        <Text key={h} size="xs" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</Text>
                    ))}
                </Box>

                {users.length === 0 ? (
                    <Text size="sm" style={{ color: textMut, padding: '32px 20px', textAlign: 'center' }}>No users yet.</Text>
                ) : (
                    users.map(u => {
                        const roleColor = ROLE_COLORS[u.role?.slug] ?? '#94A3B8';
                        const isSelf    = u.id === currentUserId;
                        return (
                            <Box key={u.id} style={{ display: 'grid', gridTemplateColumns: '1fr 200px 160px 120px', padding: '12px 20px', borderBottom: `1px solid ${divider}`, alignItems: 'center' }}>
                                {/* User */}
                                <Group gap="md">
                                    <Box style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #1565C0, #2196F3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Text c="white" fw={800} size="sm">{u.name.charAt(0).toUpperCase()}</Text>
                                    </Box>
                                    <Stack gap={2}>
                                        <Group gap="xs">
                                            <Text size="sm" fw={700} style={{ color: textPri }}>{u.name}</Text>
                                            {isSelf && (
                                                <Box style={{ background: 'rgba(33,150,243,0.15)', borderRadius: 4, padding: '1px 6px' }}>
                                                    <Text size="10px" fw={700} style={{ color: '#60A5FA' }}>YOU</Text>
                                                </Box>
                                            )}
                                        </Group>
                                        <Text size="xs" style={{ color: textSec }}>{u.email}</Text>
                                    </Stack>
                                </Group>

                                {/* Role */}
                                {u.role ? (
                                    <Box style={{ background: roleColor + '18', border: `1px solid ${roleColor}35`, borderRadius: 20, padding: '4px 12px', display: 'inline-flex', alignSelf: 'center' }}>
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
                                <Group gap="sm">
                                    <Box component="button" type="button" onClick={() => openEdit(u)}
                                        style={{ background: 'none', border: `1px solid ${cardBorder}`, borderRadius: 7, padding: '5px 12px', cursor: 'pointer', color: textSec, fontSize: 12, fontWeight: 600 }}>
                                        Edit
                                    </Box>
                                    {!isSelf && (
                                        <Box component="button" type="button" onClick={() => handleDelete(u)}
                                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', color: '#EF4444', fontSize: 12, fontWeight: 600 }}>
                                            ✕
                                        </Box>
                                    )}
                                </Group>
                            </Box>
                        );
                    })
                )}
            </Box>
        </DashboardLayout>
    );
}
