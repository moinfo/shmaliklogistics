import { Modal, Box, Text, Group, Stack, Button, TextInput, Select, ActionIcon, Tooltip } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useEffect, useState } from 'react';

const xsrf = () => decodeURIComponent((document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/) || [])[1] ?? '');

async function api(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        credentials: 'same-origin',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-XSRF-TOKEN': xsrf(), ...(options.headers ?? {}) },
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? `Request failed (${res.status})`);
    return res.json();
}

const DURATIONS = [
    { value: '1', label: '1 day' }, { value: '3', label: '3 days' }, { value: '7', label: '7 days' },
    { value: '14', label: '14 days' }, { value: '30', label: '30 days' },
];

/** Button + dialog to create, copy and revoke read-only public tracking links for one vehicle. */
export default function ShareTracking({ vehicleId, tripId = null, buttonLabel = 'Share tracking link' }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? '#E2E8F0' : '#1E293B';
    const textMut = isDark ? 'var(--c-text-muted)' : '#64748B';
    const border  = isDark ? 'var(--c-border-color)' : '#E2E8F0';

    const [open, setOpen] = useState(false);
    const [links, setLinks] = useState([]);
    const [days, setDays] = useState('7');
    const [label, setLabel] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(null);

    const load = () => api(`/system/fleet/${vehicleId}/shares`).then(setLinks).catch(e => setError(e.message));

    useEffect(() => { if (open) { setError(''); load(); } }, [open]);

    const create = async () => {
        setBusy(true); setError('');
        try {
            const link = await api(`/system/fleet/${vehicleId}/shares`, { method: 'POST', body: JSON.stringify({ days: Number(days), label: label || null, trip_id: tripId }) });
            setLinks(l => [link, ...l]);
            setLabel('');
            copy(link);
        } catch (e) { setError(e.message); }
        setBusy(false);
    };

    const revoke = async (link) => {
        try {
            await api(`/system/fleet/shares/${link.id}`, { method: 'DELETE' });
            setLinks(l => l.filter(x => x.id !== link.id));
        } catch (e) { setError(e.message); }
    };

    const copy = async (link) => {
        try { await navigator.clipboard.writeText(link.url); setCopied(link.id); setTimeout(() => setCopied(null), 2000); } catch { /* clipboard blocked: the URL is shown anyway */ }
    };

    return (
        <>
            <Button variant="light" size="xs" onClick={() => setOpen(true)}>🔗 {buttonLabel}</Button>
            <Modal opened={open} onClose={() => setOpen(false)} title="Share live tracking" centered size="lg">
                <Stack gap="sm">
                    <Text size="xs" style={{ color: textMut }}>
                        Anyone with the link can see this vehicle's plate, position and the last 3 hours of its route — no login.
                        They cannot see the driver or speed. Links expire automatically and can be revoked at any time.
                    </Text>
                    <Group align="flex-end" gap="sm">
                        <TextInput label="Shared with (optional)" placeholder="e.g. ABC Traders" value={label} onChange={e => setLabel(e.target.value)} style={{ flex: 1 }} />
                        <Select label="Valid for" data={DURATIONS} value={days} onChange={setDays} allowDeselect={false} w={110} />
                        <Button onClick={create} loading={busy}>Create link</Button>
                    </Group>
                    {error && <Text size="sm" style={{ color: '#EF4444' }}>{error}</Text>}

                    <Text size="sm" fw={700} style={{ color: textPri, marginTop: 8 }}>Active links</Text>
                    {links.length === 0 && <Text size="sm" style={{ color: textMut }}>No active links.</Text>}
                    {links.map(l => (
                        <Box key={l.id} style={{ border: `1px solid ${border}`, borderRadius: 10, padding: '10px 12px' }}>
                            <Group justify="space-between" wrap="nowrap">
                                <Box style={{ minWidth: 0 }}>
                                    <Text size="sm" fw={600} style={{ color: textPri }}>{l.label || 'Untitled link'}</Text>
                                    <Text size="xs" style={{ color: textMut }}>Expires {new Date(l.expires_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
                                    <Text size="xs" style={{ color: '#3B82F6', wordBreak: 'break-all' }}>{l.url}</Text>
                                </Box>
                                <Group gap={4} wrap="nowrap">
                                    <Button size="compact-xs" variant="default" onClick={() => copy(l)}>{copied === l.id ? 'Copied ✓' : 'Copy'}</Button>
                                    <Tooltip label="Revoke now"><ActionIcon variant="subtle" color="red" onClick={() => revoke(l)}>🗑️</ActionIcon></Tooltip>
                                </Group>
                            </Group>
                        </Box>
                    ))}
                </Stack>
            </Modal>
        </>
    );
}
