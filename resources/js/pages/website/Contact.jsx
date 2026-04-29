import { Head } from '@inertiajs/react';
import { Box, Container, Title, Text, Stack, SimpleGrid, Badge, TextInput, Textarea, Button, Group } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import WebsiteLayout from '../../layouts/WebsiteLayout';
import { ScrollReveal, StaggerContainer, HoverCard, fadeUp, fadeLeft, fadeRight, glass, MeshBackground } from '../../components/Animate';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Contact() {
    const { T } = useLanguage();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { hero, cards, form, faq } = T.contact;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', email: '', phone: '', message: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/contact', { onSuccess: () => reset() });
    };

    return (
        <WebsiteLayout>
            <Head title={`${hero.title} ${hero.highlight} — SH Malik Logistics`} />

            {/* ── Hero ── */}
            <Box style={{ position: 'relative', overflow: 'hidden', minHeight: 380, display: 'flex', alignItems: 'center' }}>
                <Box style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <Box style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,22,40,0.97) 0%, rgba(21,101,192,0.88) 100%)' }} />
                <Box style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(33,150,243,0.15) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
                <Container size="xl" style={{ position: 'relative', zIndex: 1 }} py={70}>
                    <Stack align="center" gap="lg">
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                            <Badge color="brand.2" variant="light" size="xl" radius="xl">{hero.badge}</Badge>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
                            <Title order={1} c="white" ta="center" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900 }}>
                                {hero.title}{' '}
                                <Text component="span" style={{ background: 'linear-gradient(135deg, #2196F3, #80B8FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} inherit>
                                    {hero.highlight}
                                </Text>
                            </Title>
                        </motion.div>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                            <Text c="gray.3" ta="center" maw={540} size="lg" lh={1.8}>{hero.desc}</Text>
                        </motion.div>
                    </Stack>
                </Container>
            </Box>

            {/* ── Contact Cards ── */}
            <Box py={60} style={{ background: 'linear-gradient(90deg, #0A1628, #1565C0, #0A1628)' }}>
                <Container size="xl">
                    <StaggerContainer delay={0.15}>
                        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                            {cards.map(item => (
                                <motion.div key={item.label} variants={fadeUp}>
                                    <HoverCard>
                                        <Box style={{ ...glass.white, borderRadius: 20, padding: 28, textAlign: 'center' }}>
                                            <motion.div style={{ fontSize: '2.5rem', display: 'inline-block', marginBottom: 12 }}
                                                animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
                                                {item.icon}
                                            </motion.div>
                                            <Text fw={700} size="xs" c="brand.3" tt="uppercase" style={{ letterSpacing: 2 }} mb={6}>{item.label}</Text>
                                            <Text fw={800} c="white" size="lg" mb={4}>{item.value}</Text>
                                            <Text c="gray.5" size="sm">{item.sub}</Text>
                                        </Box>
                                    </HoverCard>
                                </motion.div>
                            ))}
                        </SimpleGrid>
                    </StaggerContainer>
                </Container>
            </Box>

            {/* ── Form + FAQ ── */}
            <Box py={100} style={{
                background: isDark
                    ? 'linear-gradient(135deg, #050E1E 0%, #0A1628 100%)'
                    : 'linear-gradient(135deg, #e8f0fe 0%, #dbeafe 50%, #eff6ff 100%)',
                position: 'relative', overflow: 'hidden',
            }}>
                <MeshBackground colors={['#1565C0', '#2196F3', '#0A3A7A']} />
                <Container size="xl">
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing={80}>

                        {/* Form */}
                        <ScrollReveal variants={fadeLeft}>
                            <Box style={{ ...glass.light, borderRadius: 24, overflow: 'hidden' }}>
                                <Box style={{ ...glass.dark, padding: '28px 32px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <Text fw={800} c="white" size="xl">{form.title}</Text>
                                    <Text c="gray.4" size="sm" mt={4}>{form.subtitle}</Text>
                                </Box>
                                <Box p={32}>
                                    <form onSubmit={submit}>
                                        <Stack gap="lg">
                                            <SimpleGrid cols={2} spacing="md">
                                                <TextInput label={form.name} placeholder={form.namePlaceholder} value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} required styles={{ input: { borderRadius: 10 } }} />
                                                <TextInput label={form.phone} placeholder={form.phonePlaceholder} value={data.phone} onChange={e => setData('phone', e.target.value)} error={errors.phone} styles={{ input: { borderRadius: 10 } }} />
                                            </SimpleGrid>
                                            <TextInput label={form.email} placeholder={form.emailPlaceholder} type="email" value={data.email} onChange={e => setData('email', e.target.value)} error={errors.email} required styles={{ input: { borderRadius: 10 } }} />
                                            <Textarea label={form.message} placeholder={form.messagePlaceholder} rows={6} value={data.message} onChange={e => setData('message', e.target.value)} error={errors.message} required styles={{ input: { borderRadius: 10 } }} />
                                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                <Button type="submit" loading={processing} color="brand.5" radius="xl" size="lg" fullWidth style={{ boxShadow: '0 8px 30px rgba(21,101,192,0.35)' }}>
                                                    {form.submit}
                                                </Button>
                                            </motion.div>
                                        </Stack>
                                    </form>
                                </Box>
                            </Box>
                        </ScrollReveal>

                        {/* FAQ */}
                        <ScrollReveal variants={fadeRight}>
                            <Stack gap="xl">
                                <Stack gap="sm">
                                    <Badge color="brand" variant="light" size="lg" w="fit-content">{faq.badge}</Badge>
                                    <Title order={2} style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)' }}>
                                        {faq.title}{' '}
                                        <Text component="span" style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} inherit>
                                            {faq.highlight}
                                        </Text>
                                    </Title>
                                    <Text c={isDark ? 'gray.4' : 'dimmed'} lh={1.8}>{faq.desc}</Text>
                                </Stack>
                                <StaggerContainer delay={0.12}>
                                    <Stack gap="md">
                                        {faq.items.map((item, i) => (
                                            <motion.div key={i} variants={fadeUp}>
                                                <HoverCard>
                                                    <Box style={{ ...(isDark ? glass.white : glass.light), borderRadius: 16, padding: '20px 24px' }}>
                                                        <Group gap="sm" align="flex-start" mb={8}>
                                                            <Box style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #1565C0, #2196F3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                                                                <Text c="white" size="xs" fw={800}>Q</Text>
                                                            </Box>
                                                            <Text fw={700} c={isDark ? 'brand.2' : 'brand.8'} size="sm">{item.q}</Text>
                                                        </Group>
                                                        <Text c={isDark ? 'gray.4' : 'dimmed'} size="sm" lh={1.7} style={{ paddingLeft: 32 }}>{item.a}</Text>
                                                    </Box>
                                                </HoverCard>
                                            </motion.div>
                                        ))}
                                    </Stack>
                                </StaggerContainer>
                            </Stack>
                        </ScrollReveal>
                    </SimpleGrid>
                </Container>
            </Box>
        </WebsiteLayout>
    );
}
