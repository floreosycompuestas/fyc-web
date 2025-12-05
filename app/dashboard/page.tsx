'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Link as ChakraLink,
  Stack,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  Spinner,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react';
import { Stat, StatLabel, StatNumber } from '@chakra-ui/stat';
import { Card, CardBody } from '@chakra-ui/card';
import { FiUsers, FiActivity, FiSettings, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { open, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    // Proxy already handles authentication
    setIsLoading(false);
  }, []);

  const handleLogout = async () => {
    try {
      // Call logout endpoint which clears HttpOnly cookies on backend
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for logout
      });

      // Redirect to login after logout (whether successful or not)
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      // Still redirect to login on error
      router.push('/login');
    }
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Birds', href: '/birds' },
    { label: 'Breeders', href: '/breeders' },
    { label: 'Profile', href: '/profile' },
  ];

  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.50">
        <VStack gap={4}>
          <Spinner size="lg" color="blue.500" />
          <Text color="gray.600">Loading...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Responsive Navigation Header */}
      <Box borderBottom="1px" borderColor="gray.200" bg="white" boxShadow="sm">
        <Container maxW="7xl" px={{ base: 4, md: 6 }}>
          <Flex h="16" align="center" justify="space-between">
            {/* Logo */}
            <Heading
              size="lg"
              bgGradient="linear(to-r, blue.500, purple.500)"
              bgClip="text"
              cursor="pointer"
              onClick={() => router.push('/dashboard')}
              _hover={{ opacity: 0.8 }}
              transition="opacity 0.3s"
            >
              FYC
            </Heading>

            {/* Desktop Navigation - Hidden on mobile */}
            <HStack
              display={{ base: 'none', md: 'flex' }}
              gap={1}
              as="nav"
            >
              {navItems.map((item) => (
                <ChakraLink
                  key={item.label}
                  href={item.href}
                  px={3}
                  py={2}
                  rounded="md"
                  _hover={{ bg: 'gray.100' }}
                  fontSize="sm"
                  fontWeight="500"
                  color="gray.700"
                  transition="background-color 0.2s"
                >
                  {item.label}
                </ChakraLink>
              ))}
            </HStack>

            {/* Desktop User Section - Hidden on mobile */}
            <HStack gap={4} display={{ base: 'none', md: 'flex' }}>
              {user && (
                <VStack gap={0} align="flex-end">
                  <Text fontSize="sm" fontWeight="500" color="gray.900">
                    {user.username}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {user.email || 'user@example.com'}
                  </Text>
                </VStack>
              )}
              <Button
                colorScheme="red"
                size="sm"
                variant="outline"
                onClick={handleLogout}
              >
                <FiLogOut style={{ marginRight: '8px' }} />
                Logout
              </Button>
            </HStack>

            {/* Mobile Menu Button - Visible only on mobile */}
            <IconButton
              onClick={open ? onClose : onOpen}
              variant="ghost"
              display={{ base: 'flex', md: 'none' }}
              aria-label="Toggle menu"
            >
              {open ? <FiX size={24} /> : <FiMenu size={24} />}
            </IconButton>
          </Flex>

          {/* Mobile Navigation Menu */}
          {open && (
            <VStack
              display={{ base: 'flex', md: 'none' }}
              gap={0}
              pb={4}
              borderTop="1px"
              borderColor="gray.200"
              align="stretch"
            >
              {navItems.map((item) => (
                <ChakraLink
                  key={item.label}
                  href={item.href}
                  px={3}
                  py={2}
                  _hover={{ bg: 'gray.100' }}
                  fontSize="sm"
                  fontWeight="500"
                  color="gray.700"
                  onClick={onClose}
                  transition="background-color 0.2s"
                >
                  {item.label}
                </ChakraLink>
              ))}
              <Box px={3} py={2} borderTop="1px" borderColor="gray.200">
                {user && (
                  <VStack gap={2} align="flex-start" mb={2}>
                    <Text fontSize="sm" fontWeight="500" color="gray.900">
                      {user.username}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {user.email || 'user@example.com'}
                    </Text>
                  </VStack>
                )}
                <Button
                  w="100%"
                  colorScheme="red"
                  size="sm"
                  variant="outline"
                  onClick={handleLogout}
                >
                  <FiLogOut style={{ marginRight: '8px' }} />
                  Logout
                </Button>
              </Box>
            </VStack>
          )}
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="7xl" px={{ base: 4, md: 6 }} py={12}>
        {/* Welcome Section */}
        <VStack align="start" mb={8} gap={2}>
          <Heading size="2xl">Welcome to FYC Dashboard</Heading>
          <Text color="gray.600">
            You are successfully logged in. This is your dashboard.
          </Text>
        </VStack>

        {/* Dashboard Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} mb={12}>
          <Card>
            <CardBody>
              <HStack justify="space-between">
                <Stack gap={2}>
                  <Stat>
                    <StatLabel>Total Users</StatLabel>
                    <StatNumber>--</StatNumber>
                  </Stat>
                </Stack>
                <Flex
                  w={12}
                  h={12}
                  align="center"
                  justify="center"
                  borderRadius="full"
                  bg="blue.100"
                >
                  <Icon as={FiUsers} boxSize={6} color="blue.600" />
                </Flex>
              </HStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <HStack justify="space-between">
                <Stack gap={2}>
                  <Stat>
                    <StatLabel>Recent Activity</StatLabel>
                    <StatNumber>--</StatNumber>
                  </Stat>
                </Stack>
                <Flex
                  w={12}
                  h={12}
                  align="center"
                  justify="center"
                  borderRadius="full"
                  bg="green.100"
                >
                  <Icon as={FiActivity} boxSize={6} color="green.600" />
                </Flex>
              </HStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <HStack justify="space-between">
                <Stack gap={2}>
                  <Stat>
                    <StatLabel>Account Status</StatLabel>
                    <StatNumber>{user?.email ? 'Active' : '--'}</StatNumber>
                  </Stat>
                </Stack>
                <Flex
                  w={12}
                  h={12}
                  align="center"
                  justify="center"
                  borderRadius="full"
                  bg="purple.100"
                >
                  <Icon as={FiSettings} boxSize={6} color="purple.600" />
                </Flex>
              </HStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Quick Links Section */}
        <Box mb={12}>
          <Heading size="md" mb={4}>
            Quick Links
          </Heading>
          <SimpleGrid columns={{ base: 2, sm: 2, lg: 4 }} gap={4}>
            <Card _hover={{ bg: 'gray.100' }} cursor="pointer">
              <CardBody textAlign="center">
                <Text fontWeight="medium">Profile</Text>
              </CardBody>
            </Card>
            <Card _hover={{ bg: 'gray.100' }} cursor="pointer">
              <CardBody textAlign="center">
                <Text fontWeight="medium">Settings</Text>
              </CardBody>
            </Card>
            <Card _hover={{ bg: 'gray.100' }} cursor="pointer">
              <CardBody textAlign="center">
                <Text fontWeight="medium">Help</Text>
              </CardBody>
            </Card>
            <Card _hover={{ bg: 'gray.100' }} cursor="pointer">
              <CardBody textAlign="center">
                <Text fontWeight="medium">Documentation</Text>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Box>

        {/* Recent Activity Section */}
        <Box>
          <Heading size="md" mb={4}>
            Recent Activity
          </Heading>
          <Card>
            <CardBody>
              <Text textAlign="center" color="gray.500">
                No recent activity yet. Your activities will appear here.
              </Text>
            </CardBody>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
