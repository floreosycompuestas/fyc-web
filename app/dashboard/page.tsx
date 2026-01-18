'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  Spinner,
  Flex,
} from '@chakra-ui/react';
import { Stat, StatLabel, StatNumber } from '@chakra-ui/stat';
import { Card, CardBody } from '@chakra-ui/card';
import { FiUsers, FiActivity, FiSettings, FiPlus } from 'react-icons/fi';
import Header from '@/app/components/layout/Header';
import Footer from '@/app/components/layout/Footer';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Proxy already handles authentication
    setIsLoading(false);
  }, []);

  const handleLogout = async () => {
    try {
      // Call logout endpoint which clears HttpOnly cookies on backend
      await fetch('/api/auth/logout', {
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
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
      {/* Header Component */}
      <Header onLogout={handleLogout} />

      {/* Main Content */}
      <Container maxW="7xl" px={{ base: 4, md: 6 }} py={{ base: 8, md: 12 }}>
        {/* Welcome Section with Better Typography */}
        <VStack align="start" mb={{ base: 8, md: 12 }} gap={{ base: 2, md: 3 }}>
          <Heading size={{ base: "lg", md: "2xl" }} color="gray.900" fontWeight="700">
            Welcome back to FYC
          </Heading>
          <Text color="gray.600" fontSize={{ base: "sm", md: "base" }} maxW="2xl">
            Your comprehensive bird breeding and management platform. Get started by creating a new bird or reviewing your recent activity.
          </Text>
        </VStack>

        {/* Dashboard Stats Grid - Enhanced Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={{ base: 4, md: 6 }} mb={{ base: 10, md: 14 }}>
          {/* Total Birds Card */}
          <Card
            boxShadow="sm"
            rounded="lg"
            borderWidth="1px"
            borderColor="gray.200"
            _hover={{ boxShadow: 'md', borderColor: 'teal.200' }}
            transition="all 0.2s"
          >
            <CardBody p={{ base: 5, md: 6 }}>
              <HStack justify="space-between" gap={4} align="flex-start">
                <VStack align="flex-start" gap={1}>
                  <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="600" color="gray.600" textTransform="uppercase" letterSpacing="0.5px">
                    Total Birds
                  </Text>
                  <Heading size={{ base: "lg", md: "2xl" }} color="teal.600" fontWeight="700">
                    --
                  </Heading>
                  <Text fontSize="xs" color="gray.500">
                    Birds in collection
                  </Text>
                </VStack>
                <Flex
                  w={{ base: 12, md: 14 }}
                  h={{ base: 12, md: 14 }}
                  align="center"
                  justify="center"
                  borderRadius="lg"
                  bg="linear-gradient(135deg, teal.50 0%, teal.100 100%)"
                  flexShrink={0}
                >
                  <Icon as={FiUsers} boxSize={{ base: 6, md: 7 }} color="teal.600" />
                </Flex>
              </HStack>
            </CardBody>
          </Card>

          {/* Recent Activity Card */}
          <Card
            boxShadow="sm"
            rounded="xl"
            borderWidth="1px"
            borderColor="gray.200"
            _hover={{ boxShadow: 'md', borderColor: 'cyan.200' }}
            transition="all 0.2s"
          >
            <CardBody p={{ base: 5, md: 6 }}>
              <HStack justify="space-between" gap={4} align="flex-start">
                <VStack align="flex-start" gap={1}>
                  <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="600" color="gray.600" textTransform="uppercase" letterSpacing="0.5px">
                    Recent Activity
                  </Text>
                  <Heading size={{ base: "lg", md: "2xl" }} color="cyan.600" fontWeight="700">
                    --
                  </Heading>
                  <Text fontSize="xs" color="gray.500">
                    Last 30 days
                  </Text>
                </VStack>
                <Flex
                  w={{ base: 12, md: 14 }}
                  h={{ base: 12, md: 14 }}
                  align="center"
                  justify="center"
                  borderRadius="lg"
                  bg="linear-gradient(135deg, cyan.50 0%, cyan.100 100%)"
                  flexShrink={0}
                >
                  <Icon as={FiActivity} boxSize={{ base: 6, md: 7 }} color="cyan.600" />
                </Flex>
              </HStack>
            </CardBody>
          </Card>

          {/* Account Status Card */}
          <Card
            boxShadow="sm"
            rounded="xl"
            borderWidth="1px"
            borderColor="gray.200"
            _hover={{ boxShadow: 'md', borderColor: 'blue.200' }}
            transition="all 0.2s"
          >
            <CardBody p={{ base: 5, md: 6 }}>
              <HStack justify="space-between" gap={4} align="flex-start">
                <VStack align="flex-start" gap={1}>
                  <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="600" color="gray.600" textTransform="uppercase" letterSpacing="0.5px">
                    Account Status
                  </Text>
                  <Heading size={{ base: "lg", md: "2xl" }} color="blue.600" fontWeight="700">
                    Active
                  </Heading>
                  <Text fontSize="xs" color="gray.500">
                    All systems operational
                  </Text>
                </VStack>
                <Flex
                  w={{ base: 12, md: 14 }}
                  h={{ base: 12, md: 14 }}
                  align="center"
                  justify="center"
                  borderRadius="lg"
                  bg="linear-gradient(135deg, blue.50 0%, blue.100 100%)"
                  flexShrink={0}
                >
                  <Icon as={FiSettings} boxSize={{ base: 6, md: 7 }} color="blue.600" />
                </Flex>
              </HStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Quick Actions Section */}
        <Box mb={{ base: 10, md: 14 }}>
          <VStack align="start" gap={4}>
            <VStack align="start" gap={1}>
              <Heading size={{ base: "md", md: "lg" }} color="gray.900" fontWeight="700">
                Quick Actions
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Get started with these common tasks
              </Text>
            </VStack>
            <SimpleGrid columns={{ base: 2, sm: 2, lg: 4 }} gap={{ base: 3, md: 4 }} w="100%">
              {/* Create Bird Card */}
              <Card
                _hover={{
                  boxShadow: 'lg',
                  transform: 'translateY(-4px)',
                  borderColor: 'blue.300',
                }}
                cursor="pointer"
                transition="all 0.3s"
                rounded="lg"
                borderWidth="1px"
                borderColor="gray.200"
                onClick={() => router.push('/birds/create')}
                bg="linear-gradient(135deg, teal.50 0%, white 100%)"
              >
                <CardBody textAlign="center" py={{ base: 6, md: 8 }} px={{ base: 4, md: 5 }}>
                  <VStack gap={3}>
                    <Flex
                      w={14}
                      h={14}
                      align="center"
                      justify="center"
                      borderRadius="lg"
                      bg="teal.100"
                      boxShadow="sm"
                    >
                      <Icon as={FiPlus} boxSize={7} color="teal.600" fontWeight="bold" />
                    </Flex>
                    <VStack gap={1}>
                      <Text fontWeight="600" fontSize={{ base: "sm", md: "base" }} color="gray.900">
                        Create Bird
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        Add new bird
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* View Birds Card */}
              <Card
                _hover={{
                  boxShadow: 'lg',
                  transform: 'translateY(-4px)',
                  borderColor: 'green.300',
                }}
                cursor="pointer"
                transition="all 0.3s"
                rounded="lg"
                borderWidth="1px"
                borderColor="gray.200"
                onClick={() => router.push('/birds')}
                bg="linear-gradient(135deg, cyan.50 0%, white 100%)"
              >
                <CardBody textAlign="center" py={{ base: 6, md: 8 }} px={{ base: 4, md: 5 }}>
                  <VStack gap={3}>
                    <Flex
                      w={14}
                      h={14}
                      align="center"
                      justify="center"
                      borderRadius="lg"
                      bg="cyan.100"
                      boxShadow="sm"
                    >
                      <Icon as={FiUsers} boxSize={7} color="cyan.600" />
                    </Flex>
                    <VStack gap={1}>
                      <Text fontWeight="600" fontSize={{ base: "sm", md: "base" }} color="gray.900">
                        My Birds
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        View collection
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Profile Card */}
              <Card
                _hover={{
                  boxShadow: 'lg',
                  transform: 'translateY(-4px)',
                  borderColor: 'purple.300',
                }}
                cursor="pointer"
                transition="all 0.3s"
                rounded="lg"
                borderWidth="1px"
                borderColor="gray.200"
                bg="linear-gradient(135deg, teal.50 0%, white 100%)"
              >
                <CardBody textAlign="center" py={{ base: 6, md: 8 }} px={{ base: 4, md: 5 }}>
                  <VStack gap={3}>
                    <Flex
                      w={14}
                      h={14}
                      align="center"
                      justify="center"
                      borderRadius="lg"
                      bg="teal.100"
                      boxShadow="sm"
                    >
                      <Icon as={FiSettings} boxSize={7} color="teal.600" />
                    </Flex>
                    <VStack gap={1}>
                      <Text fontWeight="600" fontSize={{ base: "sm", md: "base" }} color="gray.900">
                        Profile
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        View settings
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Help Card */}
              <Card
                _hover={{
                  boxShadow: 'lg',
                  transform: 'translateY(-4px)',
                  borderColor: 'orange.300',
                }}
                cursor="pointer"
                transition="all 0.3s"
                rounded="lg"
                borderWidth="1px"
                borderColor="gray.200"
                bg="linear-gradient(135deg, orange.50 0%, white 100%)"
              >
                <CardBody textAlign="center" py={{ base: 6, md: 8 }} px={{ base: 4, md: 5 }}>
                  <VStack gap={3}>
                    <Flex
                      w={14}
                      h={14}
                      align="center"
                      justify="center"
                      borderRadius="lg"
                      bg="orange.100"
                      boxShadow="sm"
                    >
                      <Text fontSize="xl" fontWeight="bold" color="orange.600">?</Text>
                    </Flex>
                    <VStack gap={1}>
                      <Text fontWeight="600" fontSize={{ base: "sm", md: "base" }} color="gray.900">
                        Help & Docs
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        Get support
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </VStack>
        </Box>

        {/* Recent Activity Section */}
        <Box>
          <VStack align="start" gap={4}>
            <VStack align="start" gap={1}>
              <Heading size={{ base: "md", md: "lg" }} color="gray.900" fontWeight="700">
                Recent Activity
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Your latest actions and updates
              </Text>
            </VStack>
            <Card w="100%" boxShadow="sm" rounded="lg" borderWidth="1px" borderColor="gray.200">
              <CardBody>
                <VStack gap={4} align="stretch">
                  <Box textAlign="center" py={8}>
                    <Text color="gray.500" fontSize={{ base: "sm", md: "base" }}>
                      No recent activity yet. Start by creating your first bird!
                    </Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </Container>

      {/* Professional Footer */}
      <Footer />
    </Box>
  );
}
