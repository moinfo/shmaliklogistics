import { Head, Link } from '@inertiajs/react';
import { Box, Container, Title, Text, Stack, SimpleGrid, Badge, Group, Button } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import WebsiteLayout from '../../layouts/WebsiteLayout';
import { ScrollReveal, StaggerContainer, HoverCard, fadeUp, fadeLeft, fadeRight, glass, MeshBackground } from '../../components/Animate';
import { useLanguage } from '../../contexts/LanguageContext';

export default function About() {
    const { T } = useLanguage();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { hero, intro, story, values, milestones, team } = T.about;

    return (
        <WebsiteLayout>
            <Head title={`${hero.title} — SH Malik Logistics`} />

            {/* ── Hero ── */}
            <Box style={{ position: 'relative', overflow: 'hidden', minHeight: 440, display: 'flex', alignItems: 'center' }}>
                <Box style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/our_pictures/sh25.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <Box style={{ position: 'absolute', inset: 0, background: isDark ? 'linear-gradient(135deg, rgba(10,22,40,0.96) 0%, rgba(10,22,40,0.72) 100%)' : 'linear-gradient(135deg, rgba(252,248,246,0.95) 0%, rgba(252,233,233,0.70) 100%)' }} />
                <motion.div style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: 80, background: isDark ? 'linear-gradient(to top, #0A1628, transparent)' : 'linear-gradient(to top, #ffffff, transparent)' }} />
                <Container size="xl" style={{ position: 'relative', zIndex: 1 }} py={80}>
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing={60} style={{ alignItems: 'center' }}>
                        <Stack gap="xl">
                            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
                                <Badge color="brand.2" variant="light" size="xl" radius="xl">{hero.badge}</Badge>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
                                <Title order={1} c={isDark ? 'white' : '#0A1628'} style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1 }}>
                                    {hero.title}{' '}
                                    <Text component="span" style={{ color: isDark ? '#ED8E8E' : '#A82828', WebkitTextFillColor: isDark ? '#ED8E8E' : '#A82828' }} inherit>
                                        {hero.highlight}
                                    </Text>
                                    <br />{hero.title2}
                                </Title>
                            </motion.div>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                                <Text c={isDark ? 'gray.3' : 'gray.7'} size="lg" lh={1.8} maw={520}>{hero.desc}</Text>
                            </motion.div>
                        </Stack>
                        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
                            <SimpleGrid cols={2} spacing="md">
                                {hero.stats.map(s => (
                                    <Box key={s.label} style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(10,22,40,0.05)', backdropFilter: 'blur(10px)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(10,22,40,0.1)'}`, borderRadius: 16, padding: '20px 16px', textAlign: 'center' }}>
                                        <Text size="1.8rem">{s.icon}</Text>
                                        <Text fw={900} size="xl" c={isDark ? 'white' : '#0A1628'}>{s.value}</Text>
                                        <Text c="brand.3" size="sm">{s.label}</Text>
                                    </Box>
                                ))}
                            </SimpleGrid>
                        </motion.div>
                    </SimpleGrid>
                </Container>
            </Box>

            {/* ── Who We Are (Intro) ── */}
            <Box py={100} style={{ background: isDark ? '#0A1628' : '#ffffff' }}>
                <Container size="xl">
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing={60} style={{ alignItems: 'center' }}>
                        <ScrollReveal variants={fadeLeft}>
                            <Box style={{ borderRadius: 24, overflow: 'hidden', position: 'relative' }}>
                                <img src="/our_pictures/sh2.jpeg" alt="SH Malik team member with the branded Scania fleet" style={{ width: '100%', display: 'block', borderRadius: 24 }} />
                                <motion.div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
                                    <Box style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)', borderRadius: 14, padding: '14px 18px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
                                        <Group gap="md" wrap="nowrap" align="center">
                                            <Box style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(199,58,58,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Text size="md" c="brand.6" fw={900}>“</Text>
                                            </Box>
                                            <Stack gap={1}>
                                                <Text size="xs" c="brand.6" fw={700} tt="uppercase" style={{ letterSpacing: 1.2 }}>Founder</Text>
                                                <Text fw={700} c="#0A1628" size="sm">{intro.imagePin.label}</Text>
                                                <Text size="xs" c="gray.6">{intro.imagePin.sub}</Text>
                                            </Stack>
                                        </Group>
                                    </Box>
                                </motion.div>
                            </Box>
                        </ScrollReveal>

                        <ScrollReveal variants={fadeRight}>
                            <Stack gap="xl">
                                <Group gap={14} align="center">
                                    <Box style={{ width: 32, height: 2, background: '#C73A3A', borderRadius: 1 }} />
                                    <Text fw={700} size="sm" c="brand.6" tt="uppercase" style={{ letterSpacing: 2 }}>{intro.eyebrow}</Text>
                                </Group>
                                <Title order={2} c={isDark ? 'white' : '#0A1628'} style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', lineHeight: 1.2, fontWeight: 800 }}>
                                    {intro.title}
                                </Title>
                                <Stack gap="md">
                                    {intro.paragraphs.map((p, i) => (
                                        <Text key={i} c={isDark ? 'gray.3' : 'gray.7'} lh={1.8} size="md">{p}</Text>
                                    ))}
                                </Stack>
                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                    {intro.facts.map((f) => (
                                        <Box key={f.label} style={{
                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(10,22,40,0.08)'}`,
                                            borderRadius: 14,
                                            padding: '16px 18px',
                                            background: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                                            boxShadow: isDark ? 'none' : '0 1px 3px rgba(10,22,40,0.04)',
                                        }}>
                                            <Group gap="md" wrap="nowrap" align="center">
                                                <Box style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(199,58,58,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.3rem' }}>
                                                    {f.icon}
                                                </Box>
                                                <Stack gap={2} style={{ minWidth: 0 }}>
                                                    <Text size="xs" c={isDark ? 'gray.5' : 'gray.6'} fw={700} tt="uppercase" style={{ letterSpacing: 1.2 }}>{f.label}</Text>
                                                    <Text fw={800} c={isDark ? 'white' : '#0A1628'} size="sm" truncate>{f.value}</Text>
                                                </Stack>
                                            </Group>
                                        </Box>
                                    ))}
                                </SimpleGrid>
                            </Stack>
                        </ScrollReveal>
                    </SimpleGrid>
                </Container>
            </Box>

            {/* ── Story ── */}
            <Box py={100} style={{ background: isDark ? '#0A1628' : '#ffffff' }}>
                <Container size="xl">
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing={80} style={{ alignItems: 'center' }}>
                        <ScrollReveal variants={fadeLeft}>
                            <Box style={{ borderRadius: 24, overflow: 'hidden', position: 'relative' }}>
                                <img src="/our_pictures/sh23.jpeg" alt="SH Malik Scania on a cross-border mountain corridor" style={{ width: '100%', display: 'block', borderRadius: 24 }} />
                                <motion.div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }}>
                                    <Box style={{ background: 'rgba(10,22,40,0.9)', backdropFilter: 'blur(12px)', borderRadius: 14, padding: '16px 20px', border: '1px solid rgba(199,58,58,0.2)' }}>
                                        <Text c="white" fw={600}>{story.imageBadge}</Text>
                                        <Text c="brand.3" size="sm" mt={4}>{story.imageSubBadge}</Text>
                                    </Box>
                                </motion.div>
                            </Box>
                        </ScrollReveal>

                        <ScrollReveal variants={fadeRight}>
                            <Stack gap="xl">
                                <Stack gap="sm">
                                    <Badge color="brand" variant="light" size="lg" w="fit-content">{story.badge}</Badge>
                                    <Title order={2} style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}>
                                        {story.title}{' '}
                                        <Text component="span" style={{ color: isDark ? '#ED8E8E' : '#A82828', WebkitTextFillColor: isDark ? '#ED8E8E' : '#A82828' }} inherit>
                                            {story.highlight}
                                        </Text>
                                    </Title>
                                </Stack>
                                {story.paragraphs.map((p, i) => (
                                    <Text key={i} c={isDark ? 'gray.3' : 'dimmed'} lh={1.9} size="md">{p}</Text>
                                ))}
                                <Group gap="md">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                                        <Button component={Link} href="/contact" radius="xl" size="lg" color="brand.5" style={{ paddingInline: 32 }}>
                                            {story.contactBtn}
                                        </Button>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                                        <Button component={Link} href="/services" radius="xl" size="lg" variant="outline" color="brand.5" style={{ paddingInline: 32 }}>
                                            {story.servicesBtn}
                                        </Button>
                                    </motion.div>
                                </Group>
                            </Stack>
                        </ScrollReveal>
                    </SimpleGrid>
                </Container>
            </Box>

            {/* ── Values ── */}
            <Box py={100} style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0E4FA0 100%)', position: 'relative', overflow: 'hidden' }}>
                <MeshBackground colors={['#0E4FA0', '#C73A3A', '#0A3A7A']} />
                <Container size="xl">
                    <ScrollReveal>
                        <Stack align="center" gap="sm" mb={60}>
                            <Badge color="brand" variant="light" size="lg">{values.badge}</Badge>
                            <Title order={2} ta="center" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}>
                                {values.title}{' '}
                                <Text component="span" style={{ color: '#ED8E8E', WebkitTextFillColor: '#ED8E8E' }} inherit>
                                    {values.highlight}
                                </Text>
                            </Title>
                        </Stack>
                    </ScrollReveal>
                    <StaggerContainer delay={0.1}>
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                            {values.items.map((v) => (
                                <motion.div key={v.title} variants={fadeUp}>
                                    <HoverCard style={{ height: '100%' }}>
                                        <Box style={{ ...glass.white, borderRadius: 20, padding: 32, textAlign: 'center', height: '100%' }}>
                                            <motion.div style={{ fontSize: '2.8rem', display: 'inline-block', marginBottom: 16 }}
                                                whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }} transition={{ duration: 0.4 }}>
                                                {v.icon}
                                            </motion.div>
                                            <Text fw={800} size="lg" c="white" mb={10}>{v.title}</Text>
                                            <Text c="gray.3" size="sm" lh={1.7}>{v.desc}</Text>
                                        </Box>
                                    </HoverCard>
                                </motion.div>
                            ))}
                        </SimpleGrid>
                    </StaggerContainer>
                </Container>
            </Box>

            {/* ── Milestones ── */}
            <Box py={100} style={{ background: 'linear-gradient(160deg, #0A1628 0%, #0E4FA0 100%)', position: 'relative', overflow: 'hidden' }}>
                <motion.div style={{ position: 'absolute', top: -150, right: -150, width: 500, height: 500, borderRadius: '50%', background: 'rgba(199,58,58,0.06)', pointerEvents: 'none' }}
                    animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 6, repeat: Infinity }} />
                <Container size="xl" style={{ position: 'relative', zIndex: 1 }}>
                    <ScrollReveal>
                        <Stack align="center" gap="sm" mb={60}>
                            <Badge color="brand.3" variant="light" size="lg">{milestones.badge}</Badge>
                            <Title order={2} ta="center" c="white" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}>{milestones.title}</Title>
                        </Stack>
                    </ScrollReveal>
                    <StaggerContainer delay={0.15}>
                        <Stack gap={0}>
                            {milestones.items.map((m, i) => (
                                <motion.div key={m.year} variants={i % 2 === 0 ? fadeLeft : fadeRight}>
                                    <Group gap={0} align="stretch">
                                        <Box style={{ width: 100, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <Box style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #A82828, #C73A3A)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, flexShrink: 0 }}>
                                                <Text c="white" fw={700} size="sm">{m.year}</Text>
                                            </Box>
                                            {i < milestones.items.length - 1 && <Box style={{ width: 2, flex: 1, background: 'rgba(199,58,58,0.25)', minHeight: 40 }} />}
                                        </Box>
                                        <Box style={{ flex: 1, paddingBottom: 40, paddingLeft: 16 }}>
                                            <Box style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px 24px' }}>
                                                <Text fw={800} c="white" size="lg" mb={6}>{m.title}</Text>
                                                <Text c="gray.4" size="sm" lh={1.7}>{m.desc}</Text>
                                            </Box>
                                        </Box>
                                    </Group>
                                </motion.div>
                            ))}
                        </Stack>
                    </StaggerContainer>
                </Container>
            </Box>

            {/* ── Team ── */}
            <Box py={100} style={{ background: isDark ? '#0A1628' : '#ffffff' }}>
                <Container size="xl">
                    <ScrollReveal>
                        <Stack align="center" gap="sm" mb={60}>
                            <Badge color="brand" variant="light" size="lg">{team.badge}</Badge>
                            <Title order={2} ta="center" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}>
                                {team.title}{' '}
                                <Text component="span" style={{ color: isDark ? '#ED8E8E' : '#A82828', WebkitTextFillColor: isDark ? '#ED8E8E' : '#A82828' }} inherit>
                                    {team.highlight}
                                </Text>
                            </Title>
                        </Stack>
                    </ScrollReveal>
                    <StaggerContainer delay={0.12}>
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
                            {team.items.map(t => (
                                <motion.div key={t.role} variants={fadeUp}>
                                    <HoverCard style={{ height: '100%' }}>
                                        <Box style={{ ...glass.brand, borderRadius: 20, padding: 28, textAlign: 'center', height: '100%' }}>
                                            <Text size="3rem" mb="md">{t.icon}</Text>
                                            <Text fw={800} size="lg" c={isDark ? 'white' : '#0A1628'} mb={4}>{t.name || t.role}</Text>
                                            <Text fw={600} size="xs" c={isDark ? 'brand.2' : 'brand.6'} mb={10} tt="uppercase" style={{ letterSpacing: 1 }}>{t.name ? t.role : ''}</Text>
                                            <Text c={isDark ? 'gray.4' : 'dimmed'} size="sm" lh={1.7}>{t.desc}</Text>
                                        </Box>
                                    </HoverCard>
                                </motion.div>
                            ))}
                        </SimpleGrid>
                    </StaggerContainer>
                </Container>
            </Box>
        </WebsiteLayout>
    );
}
