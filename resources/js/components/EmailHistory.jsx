import { Box, Text, Group, Stack, Badge, Tooltip } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)' };

const fmtDateTime = (d) => d
    ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

export default function EmailHistory({ emails = [] }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark     = colorScheme === 'dark';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const divider    = isDark ? dk.divider : '#E2E8F0';

    return (
        <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text fw={700} size="sm" style={{ color: textPri }}>✉ Email History</Text>
                <Text size="xs" style={{ color: textSec }}>{emails.length} {emails.length === 1 ? 'send' : 'sends'}</Text>
            </Box>

            {emails.length === 0 ? (
                <Box style={{ padding: '24px 20px', textAlign: 'center' }}>
                    <Text size="sm" style={{ color: textSec }}>No emails have been sent yet.</Text>
                </Box>
            ) : (
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC' }}>
                                {['When', 'To', 'Subject', 'Sent by', 'Status'].map((h, i) => (
                                    <th key={i} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: textSec }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {emails.map((e) => {
                                const sent = e.status === 'sent';
                                return (
                                    <tr key={e.id} style={{ borderTop: `1px solid ${divider}` }}>
                                        <td style={{ padding: '10px 16px', fontSize: 13, color: textSec, whiteSpace: 'nowrap' }}>{fmtDateTime(e.created_at)}</td>
                                        <td style={{ padding: '10px 16px', fontSize: 13, color: textPri, fontWeight: 600 }}>{e.recipient}</td>
                                        <td style={{ padding: '10px 16px', fontSize: 13, color: textSec, maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.subject}</td>
                                        <td style={{ padding: '10px 16px', fontSize: 13, color: textSec }}>{e.sender?.name ?? '—'}</td>
                                        <td style={{ padding: '10px 16px' }}>
                                            {sent ? (
                                                <Badge size="sm" style={{ background: '#22C55E22', color: '#22C55E', border: '1px solid #22C55E44' }}>Sent</Badge>
                                            ) : (
                                                <Tooltip label={e.error ?? 'Unknown error'} multiline w={320} withArrow>
                                                    <Badge size="sm" style={{ background: '#EF444422', color: '#EF4444', border: '1px solid #EF444444', cursor: 'help' }}>Failed</Badge>
                                                </Tooltip>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Box>
            )}

            <Box style={{ padding: '10px 20px', borderTop: `1px solid ${divider}`, background: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC' }}>
                <Text size="xs" style={{ color: textSec }}>
                    "Sent" means our mail server accepted the message. Delivery to the recipient's inbox can still be affected by spam filters.
                </Text>
            </Box>
        </Box>
    );
}
