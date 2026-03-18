'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  Badge,
  Input,
} from '@chakra-ui/react';
import { Card, CardBody } from '@chakra-ui/card';
import { FiPlus, FiHeart } from 'react-icons/fi';
import Header from '@/app/components/layout/Header';
import Footer from '@/app/components/layout/Footer';

interface Pair {
  id: number;
  cock: number;
  hen: number;
  cock_band_id?: string;
  hen_band_id?: string;
  season: number;
  clutch: number;
  date_paired?: string;
  number_eggs?: number;
  number_babies?: number;
  created_at: string;
}

export default function PairsListPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [filteredPairs, setFilteredPairs] = useState<Pair[]>([]);
  const [seasonFilter, setSeasonFilter] = useState('');

  const handleLogout = () => {
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  useEffect(() => {
    const fetchPairs = async () => {
      try {
        const response = await fetch('/api/pairs', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch pairs');
        }

        const data = await response.json();
        setPairs(data);
        setFilteredPairs(data);
      } catch (error) {
        console.error('Error fetching pairs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPairs();
  }, []);

  useEffect(() => {
    if (seasonFilter) {
      const filtered = pairs.filter(
        (pair) => pair.season.toString() === seasonFilter
      );
      setFilteredPairs(filtered);
    } else {
      setFilteredPairs(pairs);
    }
  }, [seasonFilter, pairs]);

  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.50">
        <VStack gap={4}>
          <Spinner size="lg" color="teal.500" />
          <Text color="gray.600">Loading pairs...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
      {/* Header Component */}
      <Header onLogout={handleLogout} />

      {/* Main Content */}
      <Container maxW="container.xl" py={{ base: 6, md: 10 }} flex="1">
        <VStack gap={6} align="stretch">
          {/* Page Header */}
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'stretch', md: 'center' }}
            gap={4}
          >
            <Box>
              <Heading
                size={{ base: 'lg', md: 'xl' }}
                color="gray.800"
                fontWeight="700"
                mb={2}
              >
                Breeding Pairs
              </Heading>
              <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
                Manage your breeding pairs and track their offspring
              </Text>
            </Box>
            <Button
              colorScheme="teal"
              size={{ base: 'md', md: 'lg' }}
              onClick={() => router.push('/pairs/create')}
              fontWeight="600"
              boxShadow="md"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.2s"
            >
              <FiPlus /> Create New Pair
            </Button>
          </Flex>

          {/* Filter Section */}
          <Card boxShadow="md" borderRadius="lg">
            <CardBody>
              <HStack gap={4} wrap="wrap">
                <Box flex={1} minW="200px">
                  <Text fontSize="sm" fontWeight="600" color="gray.700" mb={2}>
                    Filter by Season
                  </Text>
                  <Input
                    type="number"
                    placeholder="e.g., 2026"
                    value={seasonFilter}
                    onChange={(e) => setSeasonFilter(e.target.value)}
                    size="md"
                    borderColor="gray.300"
                  />
                </Box>
                {seasonFilter && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSeasonFilter('')}
                    alignSelf="flex-end"
                  >
                    Clear Filter
                  </Button>
                )}
              </HStack>
            </CardBody>
          </Card>

          {/* Pairs Count */}
          <Text color="gray.600" fontSize="sm">
            Showing {filteredPairs.length} of {pairs.length} pairs
          </Text>

          {/* Pairs List */}
          {filteredPairs.length === 0 ? (
            <Card boxShadow="md" borderRadius="lg">
              <CardBody py={12}>
                <VStack gap={4}>
                  <Box
                    fontSize="4xl"
                    color="gray.400"
                  >
                    <FiHeart />
                  </Box>
                  <Heading size="md" color="gray.600">
                    No pairs found
                  </Heading>
                  <Text color="gray.500" textAlign="center">
                    {seasonFilter
                      ? `No pairs found for season ${seasonFilter}`
                      : 'Create your first breeding pair to get started'}
                  </Text>
                  <Button
                    colorScheme="teal"
                    onClick={() => router.push('/pairs/create')}
                    mt={2}
                  >
                    <FiPlus /> Create First Pair
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ) : (
            <VStack gap={4} align="stretch">
              {filteredPairs.map((pair) => (
                <Card
                  key={pair.id}
                  boxShadow="md"
                  borderRadius="lg"
                  _hover={{
                    boxShadow: 'lg',
                    transform: 'translateY(-2px)',
                  }}
                  transition="all 0.2s"
                  cursor="pointer"
                  onClick={() => router.push(`/pairs/${pair.id}`)}
                >
                  <CardBody>
                    <Flex
                      direction={{ base: 'column', md: 'row' }}
                      justify="space-between"
                      align={{ base: 'flex-start', md: 'center' }}
                      gap={4}
                    >
                      <VStack align="flex-start" gap={2} flex={1}>
                        <HStack gap={3} wrap="wrap">
                          <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                            Season {pair.season}
                          </Badge>
                          <Badge colorScheme="purple" fontSize="sm" px={3} py={1}>
                            Clutch {pair.clutch}
                          </Badge>
                        </HStack>

                        <VStack align="flex-start" gap={1}>
                          <HStack gap={2}>
                            <Text fontSize="sm" fontWeight="600" color="gray.600">
                              Cock:
                            </Text>
                            <Text fontSize="md" fontWeight="700" color="blue.600">
                              {pair.cock_band_id || `ID: ${pair.cock}`}
                            </Text>
                          </HStack>
                          <HStack gap={2}>
                            <Text fontSize="sm" fontWeight="600" color="gray.600">
                              Hen:
                            </Text>
                            <Text fontSize="md" fontWeight="700" color="pink.600">
                              {pair.hen_band_id || `ID: ${pair.hen}`}
                            </Text>
                          </HStack>
                        </VStack>

                        {pair.date_paired && (
                          <Text fontSize="xs" color="gray.500">
                            Paired: {new Date(pair.date_paired).toLocaleDateString()}
                          </Text>
                        )}
                      </VStack>

                      {/* Stats */}
                      <HStack gap={6}>
                        {pair.number_eggs !== undefined && (
                          <VStack gap={0}>
                            <Text fontSize="2xl" fontWeight="700" color="teal.600">
                              {pair.number_eggs}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              Eggs
                            </Text>
                          </VStack>
                        )}
                        {pair.number_babies !== undefined && (
                          <VStack gap={0}>
                            <Text fontSize="2xl" fontWeight="700" color="green.600">
                              {pair.number_babies}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              Chicks
                            </Text>
                          </VStack>
                        )}
                      </HStack>
                    </Flex>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          )}
        </VStack>
      </Container>

      {/* Professional Footer */}
      <Footer />
    </Box>
  );
}

