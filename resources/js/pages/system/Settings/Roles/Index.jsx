import { Head, useForm, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, Badge, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };

const MODULES = [
    { key: 'trips',           label: 'Trips',              actions: ['view', 'create', 'edit', 'delete'] },
    { key: 'fleet',           label: 'Fleet',              actions: ['view', 'create', 'edit', 'delete'] },
    { key: 'drivers',         label: 'Drivers',            actions: ['view', 'create', 'edit', 'delete'] },
    { key: 'permits',         label: 'Permits',            actions: ['view', 'create', 'edit', 'delete'] },
    { key: 'clients',         label: 'Clients',            actions: ['view', 'create', 'edit', 'delete'] },
    { key: 'cargo',           label: 'Cargo',              actions: ['view', 'create', 'edit', 'delete'] },
    { key: 'billing',         label: 'Billing',            actions: ['view', 'create', 'edit', 'delete'] },
    { key: 'expenses',        label: 'Expenses',           actions: ['view', 'create', 'edit', 'delete'] },
    { key: 'maintenance',     label: 'Maintenance',        actions: ['view', 'create', 'edit', 'delete'] },
    { key: 'documents',       label: 'Documents',          actions: ['view', 'create', 'delete'] },
    { key: 'hr_employees',    label: 'HR: Employees',      actions: ['view', 'create', 'edit', 'delete'] },
    { key: 'hr_leave',        label: 'HR: Leave',          actions: ['view', 'create', 'approve'] },
    { key: 'hr_payroll',      label: 'HR: Payroll',        actions: ['view', 'create', 'process'] },
    { key: 'hr_advances',     label: 'HR: Advances',       actions: ['view', 'create', 'approve'] },
    { key: 'hr_loans',        label: 'HR: Loans',          actions: ['view', 'create', 'approve'] },
    { key: 'hr_attendance',   label: 'HR: Attendance',     actions: ['view', 'create'] },
    { key: 'hr_salary_slips', label: 'HR: Salary Slips',   actions: ['view'] },
    { key: 'reports',         label: 'Reports',            actions: ['view'] },
    { key: 'settings',        label: 'Settings',           actions: ['view', 'edit'] },
];

const ALL_ACTIONS = ['view', 'create', 'edit', 'delete', 'approve', 'process'];

function hasWildcard(perms) {
    return (perms ?? []).includes('*');
}

function hasPerm(perms, moduleKey, action) {
    if (!perms) return false;
    if (perms.includes('*')) return true;
    if (perms.includes(`${moduleKey}.*`)) return true;
    return perms.includes(`${moduleKey}.${action}`);
}

function togglePerm(perms, moduleKey, action) {
    const key  = `${moduleKey}.${action}`;
    const list = perms.filter(p => p !== '*'); // never mutate wildcard via checkbox
    if (list.includes(key)) return list.filter(p => p !== key);
    return [...list, key];
}

function toggleModuleAll(perms, moduleKey, allActions) {
    const wildcard = `${moduleKey}.*`;
    const list = (perms ?? []).filter(p => p !== '*');
    if (list.includes(wildcard)) {
        // Remove wildcard and individual entries for this module
        return list.filter(p => !p.startsWith(`${moduleKey}.`));
    }
    // Add wildcard, remove individual entries
    const filtered = list.filter(p => !p.startsWith(`${moduleKey}.`));
    return [...filtered, wildcard];
}

function hasModuleAll(perms, moduleKey) {
    if (!perms) return false;
    if (perms.includes('*')) return true;
    return perms.includes(`${moduleKey}.*`);
}

function RoleForm({ role, onClose, isDark, cardBorder }) {
    const isEdit = !!role;
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name:        role?.name        ?? '',
        description: role?.description ?? '',
        is_active:   role?.is_active   ?? true,
        permissions: role?.permissions ?? [],
    });

    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const inputBg = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';
    const matrixBg = isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC';
    const matrixBorder = isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0';

    const submit = e => {
        e.preventDefault();
        if (isEdit) {
            put(`/system/settings/roles/${role.id}`, { onSuccess: onClose });
        } else {
            post('/system/settings/roles', { onSuccess: () => { reset(); onClose(); } });
        }
    };

    return (
        <Box component="form" onSubmit={submit} style={{ background: isDark ? '#07111F' : '#F8FAFC', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <Text fw={700} size="sm" style={{ color: textPri, marginBottom: 16 }}>{isEdit ? `Edit Role — ${role.name}` : 'New Role'}</Text>

            {/* Name + description */}
            <SimpleGrid cols={2} spacing="sm" mb="md">
                <Box>
                    <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>Role Name *</Text>
                    <Box component="input" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="e.g. Finance Officer"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${errors.name ? '#EF4444' : cardBorder}`, background: inputBg, color: textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                    {errors.name && <Text size="xs" style={{ color: '#EF4444', marginTop: 3 }}>{errors.name}</Text>}
                </Box>
                <Box>
                    <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>Description</Text>
                    <Box component="input" value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Brief description"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: inputBg, color: textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </Box>
            </SimpleGrid>

            {/* Permissions matrix */}
            <Text size="xs" fw={700} style={{ color: textSec, marginBottom: 10, letterSpacing: 0.5, textTransform: 'uppercase' }}>Permissions Matrix</Text>

            {/* Admin shortcut */}
            <Box mb="md" style={{ padding: '10px 14px', background: isDark ? 'rgba(33,150,243,0.08)' : '#EFF6FF', borderRadius: 8, border: '1px solid rgba(33,150,243,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="checkbox" id="perm-all"
                    checked={hasWildcard(data.permissions)}
                    onChange={e => setData('permissions', e.target.checked ? ['*'] : [])} />
                <Text size="sm" fw={700} style={{ color: '#3B82F6' }} component="label" htmlFor="perm-all">
                    ⚡ Grant full access (Administrator)
                </Text>
            </Box>

            <Box style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '8px 12px', textAlign: 'left', color: textSec, fontWeight: 700, fontSize: 11, letterSpacing: 0.5, background: matrixBg, borderBottom: `1px solid ${matrixBorder}`, minWidth: 160 }}>MODULE</th>
                            <th style={{ padding: '8px 10px', textAlign: 'center', color: textSec, fontWeight: 700, fontSize: 11, letterSpacing: 0.5, background: matrixBg, borderBottom: `1px solid ${matrixBorder}`, whiteSpace: 'nowrap' }}>ALL</th>
                            {ALL_ACTIONS.map(a => (
                                <th key={a} style={{ padding: '8px 10px', textAlign: 'center', color: textSec, fontWeight: 700, fontSize: 11, letterSpacing: 0.5, background: matrixBg, borderBottom: `1px solid ${matrixBorder}`, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{a}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {MODULES.map((mod, i) => (
                            <tr key={mod.key} style={{ borderBottom: `1px solid ${matrixBorder}`, background: i % 2 === 0 ? matrixBg : 'transparent' }}>
                                <td style={{ padding: '8px 12px', color: textPri, fontWeight: 600, fontSize: 12 }}>{mod.label}</td>
                                {/* ALL toggle */}
                                <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                    <input type="checkbox"
                                        checked={hasModuleAll(data.permissions, mod.key)}
                                        disabled={hasWildcard(data.permissions)}
                                        onChange={() => setData('permissions', toggleModuleAll(data.permissions, mod.key, mod.actions))}
                                        style={{ accentColor: '#3B82F6', width: 15, height: 15, cursor: 'pointer' }} />
                                </td>
                                {ALL_ACTIONS.map(action => {
                                    const supported = mod.actions.includes(action);
                                    return (
                                        <td key={action} style={{ padding: '8px 10px', textAlign: 'center' }}>
                                            {supported ? (
                                                <input type="checkbox"
                                                    checked={hasPerm(data.permissions, mod.key, action)}
                                                    disabled={hasWildcard(data.permissions) || hasModuleAll(data.permissions, mod.key)}
                                                    onChange={() => setData('permissions', togglePerm(data.permissions, mod.key, action))}
                                                    style={{ accentColor: '#3B82F6', width: 14, height: 14, cursor: 'pointer' }} />
                                            ) : (
                                                <Text size="xs" style={{ color: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }}>—</Text>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Box>

            <Group justify="space-between" align="center" mt="md">
                <Group gap="sm" align="center">
                    <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} id={`role-active-${role?.id ?? 'new'}`} />
                    <Text size="sm" style={{ color: textSec }} component="label" htmlFor={`role-active-${role?.id ?? 'new'}`}>Active</Text>
                </Group>
                <Group gap="sm">
                    <Box component="button" type="button" onClick={onClose}
                        style={{ padding: '7px 16px', borderRadius: 8, background: 'none', border: `1px solid ${cardBorder}`, color: textSec, cursor: 'pointer', fontSize: 13 }}>
                        Cancel
                    </Box>
                    <Box component="button" type="submit" disabled={processing}
                        style={{ padding: '7px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                        {processing ? 'Saving…' : isEdit ? 'Update Role' : 'Create Role'}
                    </Box>
                </Group>
            </Group>
        </Box>
    );
}

export default function RolesIndex({ roles }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const divider    = isDark ? dk.divider : '#F1F5F9';

    const [showNew, setShowNew] = useState(false);
    const [editing, setEditing] = useState(null);
    const [confirmDel, setConfirmDel] = useState(null);

    const deleteRole = (id) => {
        router.delete(`/system/settings/roles/${id}`, { onSuccess: () => setConfirmDel(null) });
    };

    const permSummary = (perms) => {
        if (!perms || perms.length === 0) return 'No permissions';
        if (perms.includes('*')) return '⚡ Full access';
        const modules = [...new Set(perms.map(p => p.split('.')[0]))];
        return `${modules.length} module${modules.length > 1 ? 's' : ''}`;
    };

    return (
        <DashboardLayout title="Roles">
            <Head title="Roles & Permissions" />

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Roles & Permissions</Text>
                    <Text size="sm" style={{ color: textSec }}>Define what each role can access across the system</Text>
                </Stack>
                <Box component="button" onClick={() => { setShowNew(true); setEditing(null); }}
                    style={{ padding: '10px 22px', borderRadius: 10, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                    + Add Role
                </Box>
            </Group>

            {showNew && !editing && (
                <RoleForm onClose={() => setShowNew(false)} isDark={isDark} cardBorder={cardBorder} />
            )}

            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                {roles.length === 0 ? (
                    <Box style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <Text size="sm" style={{ color: textSec }}>No roles yet.</Text>
                    </Box>
                ) : roles.map((r, i) => (
                    <Box key={r.id}>
                        {editing === r.id ? (
                            <Box style={{ padding: 20, borderBottom: i < roles.length - 1 ? `1px solid ${divider}` : 'none' }}>
                                <RoleForm role={r} onClose={() => setEditing(null)} isDark={isDark} cardBorder={cardBorder} />
                            </Box>
                        ) : (
                            <Box style={{ padding: '14px 20px', borderBottom: i < roles.length - 1 ? `1px solid ${divider}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                <Group gap="md" align="center" style={{ flex: 1 }}>
                                    <Box style={{ width: 42, height: 42, borderRadius: 10, background: isDark ? 'rgba(33,150,243,0.15)' : '#EFF6FF', border: '1px solid rgba(33,150,243,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                        🔑
                                    </Box>
                                    <Box>
                                        <Group gap={8} align="center">
                                            <Text fw={700} size="sm" style={{ color: textPri }}>{r.name}</Text>
                                            {!r.is_active && <Badge size="xs" color="gray" variant="light">Inactive</Badge>}
                                            <Badge size="xs" color="blue" variant="light">{r.users_count} user{r.users_count !== 1 ? 's' : ''}</Badge>
                                        </Group>
                                        <Group gap="sm" mt={3}>
                                            {r.description && <Text size="xs" style={{ color: textSec }}>{r.description}</Text>}
                                            <Text size="xs" style={{ color: '#60A5FA' }}>{permSummary(r.permissions)}</Text>
                                        </Group>
                                    </Box>
                                </Group>
                                <Group gap="sm">
                                    {confirmDel === r.id ? (
                                        <>
                                            <Text size="xs" style={{ color: textSec }}>Delete?</Text>
                                            <Box component="button" onClick={() => deleteRole(r.id)}
                                                style={{ padding: '5px 12px', borderRadius: 6, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Yes</Box>
                                            <Box component="button" onClick={() => setConfirmDel(null)}
                                                style={{ padding: '5px 12px', borderRadius: 6, background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: textSec, border: 'none', cursor: 'pointer', fontSize: 12 }}>No</Box>
                                        </>
                                    ) : (
                                        <>
                                            <Box component="button" onClick={() => { setEditing(r.id); setShowNew(false); }}
                                                style={{ padding: '5px 14px', borderRadius: 6, background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: textSec, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Edit</Box>
                                            <Box component="button" onClick={() => setConfirmDel(r.id)} disabled={r.users_count > 0}
                                                style={{ padding: '5px 14px', borderRadius: 6, background: r.users_count > 0 ? 'transparent' : 'rgba(239,68,68,0.1)', color: r.users_count > 0 ? (isDark ? '#334155' : '#CBD5E1') : '#EF4444', border: `1px solid ${r.users_count > 0 ? 'transparent' : 'rgba(239,68,68,0.2)'}`, cursor: r.users_count > 0 ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600 }}>Delete</Box>
                                        </>
                                    )}
                                </Group>
                            </Box>
                        )}
                    </Box>
                ))}
            </Box>
        </DashboardLayout>
    );
}
