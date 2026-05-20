import { Head, Link } from '@inertiajs/react';
import { Box, Container, Stack, Text, Group, Button, Badge } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import WebsiteLayout from '../../layouts/WebsiteLayout';

const block = (e) => e.preventDefault();

function ProtectedImage({ src, alt, style }) {
    return (
        <Box style={{ position: 'relative', ...style }}>
            <img
                src={src}
                alt={alt}
                draggable="false"
                onContextMenu={block}
                onDragStart={block}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', userSelect: 'none', WebkitUserDrag: 'none' }}
            />
            {/* Transparent overlay intercepts right-click and touch-hold */}
            <div
                onContextMenu={block}
                onDragStart={block}
                style={{ position: 'absolute', inset: 0, zIndex: 1, WebkitTouchCallout: 'none', userSelect: 'none' }}
            />
        </Box>
    );
}

export default function StaffCard({ employee }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <WebsiteLayout>
            <Head title={`${employee.name} — SH Malik Logistics`} />

            <Box
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isDark
                        ? 'linear-gradient(135deg, #050D18 0%, #0A1628 60%, #0d1f3c 100%)'
                        : 'linear-gradient(135deg, #0A1628 0%, #1565C0 100%)',
                    padding: '80px 16px 60px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Box style={{ position: 'absolute', top: '20%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(33,150,243,0.06)', filter: 'blur(80px)', pointerEvents: 'none' }} />
                <Box style={{ position: 'absolute', bottom: '10%', right: '8%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(21,101,192,0.08)', filter: 'blur(60px)', pointerEvents: 'none' }} />

                <Container size="xs" style={{ position: 'relative', zIndex: 1 }}>
                    <Stack align="center" gap="xl">

                        {/* Company badge */}
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <Badge color="blue" variant="light" size="lg" radius="xl" style={{ letterSpacing: 1.5, textTransform: 'uppercase', fontSize: 11 }}>
                                SH Malik Logistics
                            </Badge>
                        </motion.div>

                        {/* Front card image */}
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} style={{ width: '100%' }}>
                            <Box style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)', width: '100%', aspectRatio: '0.63 / 1', background: '#0A1628' }}>
                                <ProtectedImage src={employee.image} alt={employee.name} style={{ width: '100%', height: '100%' }} />
                            </Box>
                        </motion.div>

                        {/* Name + role badges + ID */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                            <Stack align="center" gap={8}>
                                <Text fw={900} c="white" style={{ fontSize: 'clamp(1.4rem, 5vw, 2rem)', letterSpacing: -0.5, textAlign: 'center' }}>
                                    {employee.name}
                                </Text>
                                <Group gap={6} justify="center">
                                    {employee.roles.map((r) => (
                                        <Badge key={r} color="blue" variant="filled" size="lg" radius="xl" style={{ letterSpacing: 0.5, textTransform: 'none', fontWeight: 600 }}>
                                            {r}
                                        </Badge>
                                    ))}
                                </Group>
                                <Text c="gray.6" size="xs" style={{ letterSpacing: 0.5 }}>
                                    ID: {employee.idNo} · SH Malik Logistics Co. Ltd
                                </Text>
                            </Stack>
                        </motion.div>

                        {/* Divider */}
                        <Box style={{ width: 60, height: 2, background: 'linear-gradient(90deg, #1565C0, #2196F3)', borderRadius: 2 }} />

                        {/* Contact buttons */}
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }} style={{ width: '100%' }}>
                            <Stack gap="sm">
                                <Button component="a" href={`tel:${employee.phone}`} fullWidth size="md" radius="xl" variant="filled" color="blue" style={{ boxShadow: '0 4px 20px rgba(33,150,243,0.3)' }}>
                                    📞 Call
                                </Button>
                                <Button component="a" href={`https://wa.me/${employee.phone.replace('+', '')}`} target="_blank" rel="noopener noreferrer" fullWidth size="md" radius="xl" variant="light" color="green">
                                    💬 WhatsApp
                                </Button>
                                <Button component="a" href={`mailto:${employee.email}`} fullWidth size="md" radius="xl" variant="subtle" color="gray" style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', overflow: 'hidden' }}>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                        ✉️ {employee.email}
                                    </span>
                                </Button>
                            </Stack>
                        </motion.div>

                        {/* ID card back */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }} style={{ width: '100%' }}>
                            <Text c="gray.6" size="xs" ta="center" mb={8} tt="uppercase" style={{ letterSpacing: 1 }}>ID Card — Back</Text>
                            <Box style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)', width: '100%', aspectRatio: '0.63 / 1', background: '#0A1628' }}>
                                <ProtectedImage src={employee.backImage} alt="ID Card back" style={{ width: '100%', height: '100%' }} />
                            </Box>
                        </motion.div>

                        {/* Company info */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
                            <Stack align="center" gap={4}>
                                <Text c="gray.6" size="xs">📍 Handeni, Tanzania</Text>
                                <Text c="gray.6" size="xs">🌐 www.shmaliklogistics.co.tz</Text>
                            </Stack>
                        </motion.div>

                        {/* Back to team */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}>
                            <Button component={Link} href="/team" variant="transparent" color="gray" size="xs" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                                ← View All Team Members
                            </Button>
                        </motion.div>

                    </Stack>
                </Container>
            </Box>
        </WebsiteLayout>
    );
}
